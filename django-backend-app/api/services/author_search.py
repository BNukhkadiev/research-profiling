import logging
import re
from ..models import Author
from .ollama_processor import OllamaTextProcessor
from BaseXClient import BaseXClient
import xml.etree.ElementTree as ET
import requests

logger = logging.getLogger(__name__)


class AuthorSearchService:
    def __init__(self, query):
        self.query = query.strip()

    def search_single_author(self):
        # 1. Check MongoDB for existing author (exact match)
        cached_author = Author.objects(name=self.query).first()
        
        # Always retrieve affiliations from BaseX
        affiliations = self._get_author_affiliations(self.query)

        if cached_author:
            logger.info(f"Found cached author '{self.query}' in MongoDB.")
            return {
                "name": cached_author.name,
                "description": cached_author.description,
                "affiliations": affiliations
            }

        # 2. If not cached, query BaseX to search for author data
        logger.info(f"Querying BaseX for author '{self.query}'")
        
        # Also fetch publication titles to generate description
        paper_titles = self._get_publication_titles(self.query)

        if not affiliations and not paper_titles:
            logger.info(f"No data found in BaseX for author '{self.query}'.")
            return {
                "error": f"No data found for author '{self.query}'. Please check the name and try again."
            }

        # 3. Generate LLM-based description (placeholder for now)
        # description = "Some description bla bla"
        description = self._get_researcher_description(self.query, paper_titles)

        # 4. Save author to MongoDB
        author_doc = Author(
            name=self.query,
            description=description
        )
        author_doc.save()
        logger.info(f"Saved author '{self.query}' to MongoDB.")

        # 5. Return final result
        return {
            "name": self.query,
            "description": description,
            "affiliations": affiliations
        }

    def _get_author_affiliations(self, author_name):
        """Fetch unique affiliations for a given author and return them as a plain string list."""
        session = BaseXClient.Session('localhost', 1984, 'admin', 'admin')
        affiliations = []

        try:
            session.execute("OPEN dblp")  # Open DB

            query_text = f"""
            let $author_name := '{author_name}'
            for $aff in distinct-values(
                //(article|inproceedings|book|incollection|phdthesis|mastersthesis|proceedings|www|data)[author = $author_name]/note[@type='affiliation']/text()
            )
            return <affiliation>{{$aff}}</affiliation>
            """

            query = session.query(query_text)

            for _, item in query.iter():
                try:
                    elem = ET.fromstring(item)
                    affiliations.append(elem.text.strip())
                except ET.ParseError as e:
                    logger.error(f"Parse error: {e} on item: {item}")

            query.close()
            return affiliations

        finally:
            session.close()

    def _get_publication_titles(self, author_name, limit=10):
        """Fetch and parse publication titles for a given author."""
        session = BaseXClient.Session('localhost', 1984, 'admin', 'admin')
        publications = []
        try:
            session.execute("OPEN dblp")  # Open DB

            query_text = f"""
            let $author_name := '{author_name}'
            for $pub in //(article|inproceedings|book|incollection|phdthesis|mastersthesis|proceedings|www|data)
            where $pub/author = $author_name
            return $pub
            """

            query = session.query(query_text)

            for _, item in query.iter():
                try:
                    elem = ET.fromstring(item)
                    title = elem.findtext("title")
                    if title:
                        publications.append(title.strip())
                except ET.ParseError as e:
                    logger.error(f"Parse error: {e} on item: {item}")

            query.close()

            unique_titles = list(dict.fromkeys(publications))[:limit]  # Deduplicate and limit
            return unique_titles

        finally:
            session.close()

    def _get_researcher_description(self, name, paper_titles):
        """
        Generate a short researcher description using Ollama LLM.
        """
        processor = OllamaTextProcessor(batch_size=1, max_tokens=50, temperature=0.7)  
        
        researcher = {
            "name": name,
            "papers": [{"title": title} for title in paper_titles]
        }

        description = processor.generate_description(researcher)

        if not description:
            logger.error(f"Failed to generate description for {name}.")
            return "Description generation failed."

        return description