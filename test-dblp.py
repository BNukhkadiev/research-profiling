import requests

def get_researcher_description(name, paper_titles):
    url = "http://localhost:11434/api/generate"

    # Format the list of paper titles as a readable string
    papers_str = "; ".join(paper_titles) if paper_titles else "No published papers listed"

    prompt = (
        f"Generate a concise 2 sentence researcher description using the follownig information. "
        f"Name: {name}"
        f"Notable papers: {papers_str}. "
        f"Summarize the research focus, contributions, and impact."
        f"Directly return the profile without introductions, disclaimers, or extra formatting."
    )

    payload = {
        "model": "gemma:2b",  # Make sure you are using the optimized model
        "prompt": prompt,
        "stream": False
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        return response.json()["response"]
    else:
        return f"Error: {response.text}"


# Example usage
description = get_researcher_description(
    name="Heiko Paulheim",
    paper_titles=[
        "Knowledge Graphs",
        "Graph-based Learning for Scientific Discovery",
    ]
)

print(description)