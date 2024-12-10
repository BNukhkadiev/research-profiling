import requests
import xml.etree.ElementTree as ET


search_query='rainer+gemulla'

dblp_url = f"https://dblp.org/search/author/api?q={search_query}&format=json"

dblp_response = requests.get(dblp_url)
dblp_response.raise_for_status()
dblp_data = dblp_response.json()

# print(dblp_data)

dblp_authors = dblp_data["result"]["hits"]["hit"]

for dblp_author in dblp_authors:
    author_name = dblp_author["info"]["author"]
    author_url = dblp_author["info"].get("url")
    dblp_affiliations = []
    dblp_paper_titles = []

    # print(author_url)
    author_profile_response = requests.get(f"{author_url}.xml")
    author_profile_response.raise_for_status()
    # print(author_profile_response.text)
    root = ET.fromstring(author_profile_response.text)

    dblp_paper_titles = [title.text.rstrip(".") for title in root.findall(".//title")]

    print(dblp_paper_titles)
    


