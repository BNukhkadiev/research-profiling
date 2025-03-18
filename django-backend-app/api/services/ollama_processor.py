import requests
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor
from itertools import cycle
from threading import Lock

# List of available Ollama instances (add more if needed)
OLLAMA_PORTS = [11434, 11435]
OLLAMA_PORT_CYCLE = cycle(OLLAMA_PORTS)  # Infinite cycle for round-robin
CYCLE_LOCK = Lock()  # Thread-safe lock for round-robin


class OllamaTextProcessor:
    def __init__(self, model="mistral", batch_size=3, max_tokens=128, temperature=0.7):
        self.model = model
        self.batch_size = batch_size
        self.max_tokens = max_tokens
        self.temperature = temperature

    # ---------------- Round-Robin Instance Selection -------------------
    def get_next_port(self):
        with CYCLE_LOCK:
            return next(OLLAMA_PORT_CYCLE)

    # ---------------- Model Pull Handling -------------------
    def pull_model_on_port(self, port):
        url = f"http://localhost:{port}/api/pull"
        response = requests.post(url, json={"name": self.model})
        if response.status_code == 200:
            print(f"[INFO] Successfully pulled model '{self.model}' on port {port}")
        else:
            print(f"[ERROR] Failed to pull model on port {port}: {response.text}")

    # ---------------- Request Sending with Retry -------------------
    def send_request_to_ollama(self, prompt):
        port = self.get_next_port()
        url = f"http://localhost:{port}/api/generate"
        print(f"[INFO] Sending request to Ollama on port {port}")

        response = requests.post(url, json={
            "model": self.model,
            "prompt": prompt,
            "options": {
                "max_tokens": self.max_tokens,
                "temperature": self.temperature
            },
            "stream": False
        })

        # Handle "model not found"
        if response.status_code == 400 and 'model' in response.text.lower():
            print(f"[WARNING] Model not found on port {port}. Pulling model...")
            self.pull_model_on_port(port)
            # Retry after pulling model
            response = requests.post(url, json={
                "model": self.model,
                "prompt": prompt,
                "options": {
                    "max_tokens": self.max_tokens,
                    "temperature": self.temperature
                },
                "stream": False
            })

        if response.status_code != 200:
            print(f"[ERROR] API call failed on port {port}: {response.status_code} {response.text}")
            return None

        return response.json().get("response", "")

    # ---------------- Prompt Builders -------------------
    def build_topic_prompt(self, batch):
        prompt = "Given the following research papers, extract 2-3 key research topics for each paper.\n\n"
        prompt += "Respond ONLY in this exact JSON format:\n{\n  \"paper_id1\": [\"topic1\", \"topic2\"],\n  \"paper_id2\": [\"topic1\", \"topic2\", \"topic3\"]\n}\n\n"
        for paper in batch:
            prompt += f"Paper ID: {paper['id']}\nTitle: {paper['title']}\nAbstract: {paper['abstract']}\n\n"
        return prompt

    def build_description_prompt(self, researcher):
        paper_titles = ", ".join(paper["title"] for paper in researcher["papers"])

        return (
            f"Write a CONCISE two-sentence summary of {researcher['name']}'s research focus and contributions. "
            f"Notable papers: {paper_titles}. "
            f"DO NOT include introductions, disclaimers, or extra details."
        )

    # ---------------- Response Parsing -------------------
    def parse_topic_response(self, response_text, batch):
        batch_results = {}
        try:
            parsed = json.loads(response_text)
            for paper in batch:
                batch_results[paper['id']] = parsed.get(paper['id'], [])
        except json.JSONDecodeError:
            print("[WARNING] Failed to parse JSON, falling back to regex parsing...")
            for paper in batch:
                pattern = rf'{paper["id"]}:\s*\[(.*?)\]'
                match = re.search(pattern, response_text, re.DOTALL)
                if match:
                    topics = [t.strip().strip('"') for t in match.group(1).split(",") if t.strip()]
                    batch_results[paper['id']] = topics
                else:
                    print(f"[WARNING] No topics found for paper {paper['id']}")
                    batch_results[paper['id']] = []
        return batch_results

    # ---------------- Batch Processor -------------------
    def process_batch(self, batch, task="topics"):
        if task == "topics":
            prompt = self.build_topic_prompt(batch)
        else:
            prompt = self.build_description_prompt(batch[0])  # Only one researcher per batch
        print(prompt)
        result = self.send_request_to_ollama(prompt)
        if not result:
            print("[ERROR] Empty response from model")
            return {} if task == "topics" else ""

        return self.parse_topic_response(result, batch) if task == "topics" else result

    # ---------------- Public Methods -------------------
    def generate_topics(self, papers):
        topics = {}
        batches = [papers[i:i + self.batch_size] for i in range(0, len(papers), self.batch_size)]
        print(f"[INFO] Created {len(batches)} batches from {len(papers)} papers.")

        with ThreadPoolExecutor(max_workers=len(OLLAMA_PORTS)) as executor:
            results = list(executor.map(self.process_batch, batches))

        for batch_result in results:
            topics.update(batch_result)

        return topics

    def generate_description(self, researcher):
        return self.process_batch([researcher], task="description")


# ---------------- Example Usage -------------------

if __name__ == "__main__":
    processor = OllamaTextProcessor(batch_size=3, max_tokens=130, temperature=0.6)

    # Example papers for topic extraction
    papers = [
        {
            "id": "paper1",
            "title": "Deep Learning for NLP",
            "abstract": "Explores deep learning models for NLP tasks like text classification."
        },
        {
            "id": "paper2",
            "title": "Graph Neural Networks",
            "abstract": "Discusses GNN methodologies and their applications in social networks."
        },
        {
            "id": "paper3",
            "title": "Reinforcement Learning for Robotics",
            "abstract": "Surveys different RL algorithms applied in robotics."
        }
    ]

    # Run topic generation
    topics = processor.generate_topics(papers)
    print("\n[RESULT] Extracted Topics:")
    for paper_id, topic_list in topics.items():
        print(f"{paper_id}: {topic_list}")

    # Example researcher description
    researcher = {
        "name": "Dr. Alice Smith",
        "papers": [
            {"title": "Deep Learning for NLP"},
            {"title": "Graph Neural Networks"},
            {"title": "Reinforcement Learning for Robotics"}
        ]
    }

    description = processor.generate_description(researcher)
    print("\n[RESULT] Researcher Description:")
    print(description)
