import requests


def reconstruct_abstract(inverted_index):
    """
    Converts OpenAlex's inverted index format into a readable plain text abstract.
    """
    if not inverted_index:
        return "No abstract available"

    # Create a list to store words in their correct positions
    max_index = max(max(positions) for positions in inverted_index.values())
    abstract_words = [""] * (max_index + 1)

    for word, positions in inverted_index.items():
        for pos in positions:
            abstract_words[pos] = word

    return " ".join(abstract_words)


def get_abstract_from_openalex(title):
    """
    Fetches paper abstract from OpenAlex by title and converts it to plain text.
    """
    base_url = "https://api.openalex.org/works"
    params = {"search": title, "per_page": 1}
    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        data = response.json()
        if "results" in data and len(data["results"]) > 0:
            paper = data["results"][0]
            inverted_index = paper.get("abstract_inverted_index", {})
            return reconstruct_abstract(inverted_index)

    return "Abstract not found"
