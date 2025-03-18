import logging
import xml.etree.ElementTree as ET
from ..models import Author
from .ollama_processor import OllamaTextProcessor
from BaseXClient import BaseXClient

logger = logging.getLogger(__name__)


class AuthorSearchService:
    def __init__(self, query):
        self.query = query.strip()

    def search_single_author(self):
        """
        Searches for a single author in MongoDB, checks if they have a description and affiliations,
        and retrieves missing information if necessary.
        """
        cached_author = Author.objects(name=self.query).first()
        affiliations = cached_author.affiliations if cached_author else None
        description = cached_author.description if cached_author else None

        # If affiliations are missing, fetch from BaseX
        if not affiliations:
            logger.info(f"Fetching affiliations for author '{self.query}' from BaseX.")
            affiliations = self._get_author_affiliations(self.query)

        # Fetch paper titles only if description is missing
        paper_titles = []
        if not description:
            paper_titles = self._get_publication_titles(self.query)
            if not paper_titles and not affiliations:
                logger.info(f"No data found in BaseX for author '{self.query}'.")
                return {"error": f"No data found for author '{self.query}'. Please check the name and try again."}

            logger.info(f"Generating description for author '{self.query}'")
            description = self._get_researcher_description(self.query, paper_titles)

        # Save or update author in MongoDB
        if cached_author:
            cached_author.description = cached_author.description or description
            cached_author.affiliations = cached_author.affiliations or affiliations
            cached_author.save()
            logger.info(f"Updated author '{self.query}' in MongoDB.")
        else:
            author_doc = Author(
                name=self.query,
                description=description,
                affiliations=affiliations
            )
            author_doc.save()
            logger.info(f"Saved new author '{self.query}' to MongoDB.")

        return {
            "name": self.query,
            "description": description,
            "affiliations": affiliations
        }

    def _get_author_affiliations(self, author_name):
        """Fetch unique affiliations for a given author from BaseX."""
        session = BaseXClient.Session('localhost', 1984, 'admin', 'admin')
        affiliations = []

        try:
            session.execute("OPEN dblp")

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
            session.execute("OPEN dblp")

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
            return list(dict.fromkeys(publications))[:limit]  # Deduplicate and limit

        finally:
            session.close()

    def _get_researcher_description(self, name, paper_titles):
        """Generate a short researcher description using Ollama LLM."""
        processor = OllamaTextProcessor(batch_size=1, max_tokens=50, temperature=0.7)

        researcher = {
            "name": name,
            "papers": [{"title": title} for title in paper_titles[:10]]
        }

        # description = processor.generate_description(researcher)
        description = "blla blla blla"

        if not description:
            logger.error(f"Failed to generate description for {name}.")
            return "Description generation failed."

        return description
