import requests
from bs4 import BeautifulSoup

def search_hf_user_scrape(first_name, last_name):
    query = f"{first_name} {last_name}"
    url = "https://huggingface.co/search"
    params = {"type": "users", "q": query}
    
    response = requests.get(url, params=params)
    if response.status_code != 200:
        print("Error:", response.status_code)
        return None

    soup = BeautifulSoup(response.text, 'html.parser')
    
    # The structure of the search result HTML might change over time.
    # You might need to inspect the page source in your browser to adjust the selectors.
    results = []
    # Example: assume user cards are in <div class="user-card"> and username in an <a> tag.
    user_cards = soup.find_all('div', class_='user-card')
    for card in user_cards:
        username_tag = card.find('a')
        if username_tag and username_tag.text:
            username = username_tag.text.strip()
            results.append(username)
    
    return results

if __name__ == "__main__":
    result = search_hf_user_scrape("Arman", "Cohan")
    print(result)
