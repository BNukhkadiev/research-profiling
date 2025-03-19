import requests
import re
import json
import time
from concurrent.futures import ThreadPoolExecutor
from itertools import cycle
from threading import Lock
import time 


# List of available Ollama instances (add more if needed)
OLLAMA_PORTS = [11434, 11435]
OLLAMA_PORT_CYCLE = cycle(OLLAMA_PORTS)  # Infinite cycle for round-robin
CYCLE_LOCK = Lock()  # Thread-safe lock for round-robin

# ---------------- Round-Robin Instance Selection -------------------

def get_next_port():
    with CYCLE_LOCK:
        return next(OLLAMA_PORT_CYCLE)

# ---------------- Model Pull Handling -------------------

def pull_model_on_port(port, model):
    url = f"http://localhost:{port}/api/pull"
    response = requests.post(url, json={"name": model})
    if response.status_code == 200:
        print(f"[INFO] Successfully pulled model '{model}' on port {port}")
    else:
        print(f"[ERROR] Failed to pull model on port {port}: {response.text}")

# ---------------- Request Sending with Retry -------------------

def send_request_to_ollama(prompt, model="mistral"):
    port = get_next_port()
    url = f"http://localhost:{port}/api/generate"
    print(f"[INFO] Sending request to Ollama on port {port}")

    response = requests.post(url, json={
        "model": model,
        "prompt": prompt,
        "stream": False
    })

    # Handle "model not found"
    if response.status_code == 400 and 'model' in response.text.lower():
        print(f"[WARNING] Model not found on port {port}. Pulling model...")
        pull_model_on_port(port, model)
        # Retry after pulling model
        response = requests.post(url, json={
            "model": model,
            "prompt": prompt,
            "options": {
              "max_tokens": 128,
              "temperature": 0.7
            },
            "stream": False
        })

    if response.status_code != 200:
        print(f"[ERROR] API call failed on port {port}: {response.status_code} {response.text}")
        return None

    return response.json().get("response", "")

# ---------------- Prompt Builder -------------------

def build_prompt(batch):
    prompt = "Given the following research papers, extract 2-3 key research topics for each paper.\n\n"
    prompt += "Respond ONLY in this exact JSON format:\n{\n  \"paper_id1\": [\"topic1\", \"topic2\"],\n  \"paper_id2\": [\"topic1\", \"topic2\", \"topic3\"]\n}\n\n"
    for paper in batch:
        prompt += f"Paper ID: {paper['id']}\nTitle: {paper['title']}\nAbstract: {paper['abstract']}\n\n"
    return prompt

# ---------------- Response Parsing -------------------

def parse_response(response_text, batch):
    batch_results = {}
    try:
        # Try to parse as JSON
        parsed = json.loads(response_text)
        for paper in batch:
            batch_results[paper['id']] = parsed.get(paper['id'], [])
    except json.JSONDecodeError:
        print("[WARNING] Failed to parse JSON, falling back to regex parsing...")
        # Fallback to regex parsing
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

def process_batch(batch):
    prompt = build_prompt(batch)
    result = send_request_to_ollama(prompt)
    if not result:
        print("[ERROR] Empty response from model")
        return {}
    # Optional: Print raw response for debugging
    # print(f"[DEBUG] LLM response:\n{result}")
    return parse_response(result, batch)

# ---------------- Main Topic Generation -------------------

def generate_topics(papers, batch_size=3, model="mistral"):
    topics = {}
    start_time = time.time()

    # Create fixed-size batches
    batches = [papers[i:i + batch_size] for i in range(0, len(papers), batch_size)]
    print(f"[INFO] Created {len(batches)} batches (batch size = {batch_size}) from {len(papers)} papers.")

    # Parallel batch processing
    with ThreadPoolExecutor(max_workers=len(OLLAMA_PORTS)) as executor:
        results = list(executor.map(process_batch, batches))

    # Collect and combine results
    for batch_result in results:
        topics.update(batch_result)

    end_time = time.time()
    print(f"[SUCCESS] Topics generated for {len(papers)} papers in {end_time - start_time:.2f} seconds.")
    return topics

# ---------------- Example Usage -------------------

if __name__ == "__main__":
    # Load test papers (replace 'test_papers.json' with your actual file)
    import json
        
    papers = [
      {
        "id": "paper1",
        "title": "Deep Learning Approaches for Natural Language Processing",
        "abstract": "This paper explores the application of deep learning models, including recurrent neural networks and transformers, in solving various natural language processing tasks such as text classification, sentiment analysis, and machine translation."
      },
      {
        "id": "paper2",
        "title": "Graph Neural Networks: Methods and Applications",
        "abstract": "Graph Neural Networks (GNNs) have emerged as a powerful tool for learning on graph-structured data. This paper reviews the core methodologies of GNNs and discusses their applications in social networks, knowledge graphs, and biological networks."
      },
      {
        "id": "paper3",
        "title": "A Survey on Reinforcement Learning Techniques for Robotics",
        "abstract": "Reinforcement Learning (RL) has been successfully applied to a range of robotic control tasks. This paper surveys different RL algorithms, including policy gradients and Q-learning, and their implementation challenges in real-world robotic systems."
      },
      {
        "id": "paper4",
        "title": "Explainable AI: Interpreting Black-Box Machine Learning Models",
        "abstract": "As machine learning models grow in complexity, the need for interpretability increases. This work provides an overview of explainable AI methods, including SHAP values and LIME, to interpret black-box models in domains such as healthcare and finance."
      },
      {
        "id": "paper5",
        "title": "Transfer Learning for Image Classification with Convolutional Neural Networks",
        "abstract": "Transfer learning enables the use of pre-trained convolutional neural networks (CNNs) for image classification tasks with limited data. This paper discusses various transfer learning strategies and evaluates their performance on benchmark datasets."
      },
      {
        "id": "paper6",
        "title": "Federated Learning: Privacy-Preserving Machine Learning at Scale",
        "abstract": "Federated learning allows machine learning models to be trained across multiple decentralized devices without sharing raw data. This paper explores the challenges and solutions for implementing federated learning in real-world scenarios such as mobile devices and healthcare."
      },
      {
        "id": "paper7",
        "title": "Knowledge Graph Embeddings: Techniques and Applications",
        "abstract": "Knowledge graph embeddings aim to encode entities and relations from knowledge graphs into continuous vector spaces. This paper reviews different embedding techniques and highlights their applications in recommendation systems and question answering."
      },
      {
        "id": "paper8",
        "title": "BERT and Beyond: Recent Advances in Pre-trained Language Models",
        "abstract": "Pre-trained language models like BERT have revolutionized NLP tasks. This paper surveys the evolution of these models, including RoBERTa, GPT, and T5, and their fine-tuning for downstream tasks such as reading comprehension and summarization."
      },
      {
        "id": "paper9",
        "title": "Adversarial Attacks and Defenses in Deep Learning",
        "abstract": "Deep learning models are vulnerable to adversarial attacks. This paper reviews common attack methods, such as FGSM and PGD, and various defense strategies to improve model robustness in security-critical applications."
      },
      {
        "id": "paper10",
        "title": "Meta-Learning for Few-Shot Learning Problems",
        "abstract": "Meta-learning, or learning to learn, aims to address few-shot learning challenges by enabling models to rapidly adapt to new tasks. This paper reviews model-agnostic meta-learning (MAML) and other algorithms that improve performance in low-data regimes."
      }
    ]
    start_time = time.time()
    # Run topic generation
    topics = generate_topics(papers, batch_size=3)
    end_time = time.time()

    print("Time:", end_time - start_time)
    # Display final topics
    print("\n[RESULT] Extracted Topics:")
    for paper_id, topic_list in topics.items():
        print(f"{paper_id}: {topic_list}")
