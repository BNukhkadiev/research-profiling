import requests
import urllib.parse
import xml.etree.ElementTree as ET
import re
import requests
import logging
from ..models import Author


logger = logging.getLogger(__name__)

class DblpAuthorSearchService:

    def __init__(self, query):
        self.query = query.strip()

    def search_authors(self):
        # 1. Check MongoDB for existing authors
        cached_authors = Author.objects(name__icontains=self.query)[:10]  # limit to top 10 matches
        if cached_authors:
            logger.info(f"Found {len(cached_authors)} cached authors in MongoDB.")
            return [self._author_to_dict(author) for author in cached_authors]

        # 2. Query DBLP API
        dblp_url = f"https://dblp.org/search/author/api?q={urllib.parse.quote(self.query)}&format=json"
        logger.info(f"Querying DBLP API: {dblp_url}")
        response = requests.get(dblp_url)
        response.raise_for_status()
        data = response.json()
        hits = data.get("result", {}).get("hits", {}).get("hit", [])
        if not hits:
            logger.warning("No authors found in DBLP.")
            return []

        authors_list = []
        for hit in hits:
            author_info = hit.get("info", {})
            author_name = author_info.get("author")
            author_url = author_info.get("url")

            if not author_url:
                continue  # Skip authors without valid profile URL

            author_pid = author_url.split("/pid/")[-1]
            author_data = self._fetch_author_details(author_name, author_url, author_pid)
            if author_data:
                authors_list.append(author_data)

        return authors_list
    

    def _fetch_author_details(self, author_name, author_url, author_pid):
        try:
            author_pid_url = f"{author_url}.xml"
            logger.info(f"Fetching DBLP XML from {author_pid_url}")
            response = requests.get(author_pid_url)
            response.raise_for_status()
            root = ET.fromstring(response.text)

            # Parse affiliations
            affiliations = [note.text for note in root.findall(".//note[@type='affiliation']")]

            # Parse publications (titles & venues)
            # Extract paper titles for LLM description (limit to top 3-5)
            paper_titles = []
            for pub in root.findall(".//r"):
                publ_info = pub.find("./*")
                if publ_info is not None:
                    title = publ_info.findtext("title", "").strip()
                    if title:
                        paper_titles.append(title)
                    if len(paper_titles) >= 5:  # Limit to top 5 titles
                        break
            
            # Generate abstract (using LLM service)
            abstract = self._get_researcher_description(name=author_name, paper_titles=paper_titles)

            # Save to MongoDB
            author_doc = Author(
                pid=author_pid,
                name=author_name,
                dblp_url=author_url,
                affiliations=affiliations,
                abstract=abstract,
                publications=[]
            )
            author_doc.save()
            logger.info(f"Saved author {author_name} to MongoDB.")

            return self._author_to_dict(author_doc)


        except (requests.RequestException, ET.ParseError) as e:
            logger.error(f"Failed to fetch/parse DBLP XML for {author_name}: {e}")
            return None

    def _author_to_dict(self, author):
        """Helper method to convert Author document to dict."""
        return {
            "name": author.name,
            "pid": author.pid,
            "affiliations": author.affiliations,
            "dblp_url": author.dblp_url,
            "abstract": author.abstract
        }

    def _get_researcher_description(self, name, paper_titles):
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