import re
import requests

def get_researcher_description(name, paper_titles):
    url = "http://localhost:11434/api/generate"

    papers_str = "; ".join(paper_titles) if paper_titles else "No published papers listed"

    prompt = (
        f"Generate a concise two-sentence researcher description based on the following details: "
        f"Name: {name}. "
        f"Notable papers: {papers_str}. "
        f"Summarize the research focus, contributions, and impact of this researcher. "
        f"Your response must follow this exact format: [[ description_here ]]. "
        f"DO NOT include any extra text, disclaimers, or greetings. "
        f"Example output: [[ A researcher specializing in deep learning and graph embeddings. ]]"
    )

    payload = {
        "model": "gemma:2b",
        "prompt": prompt,
        "stream": False,
        "options": {"seed": 42}
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        output_text = response.json().get("response", "")
        
        # Use regex to extract the content inside [[ ... ]]
        match = re.search(r"\[\[(.*?)\]\]", output_text)
        if match:
            return match.group(1).strip()  # Extract text inside [[ ... ]]
        else:
            return f"Error: Response format incorrect - {output_text}"
    else:
        return f"Error: {response.text}"
