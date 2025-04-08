import logging
import xml.etree.ElementTree as ET
from ..models import Author
from .ollama_processor import OllamaTextProcessor
from BaseXClient import BaseXClient

logger = logging.getLogger(__name__)


class AuthorSearchService:
    def __init__(self, query):
        self.query = query.strip()

    def search_and_save_authors(self):
        """
        Fuzzy search for authors matching the query,
        then get affiliations, publications, and store in MongoDB.
        """
        matched_authors = self._get_author_affiliations(self.query)
        if not matched_authors:
            return {"error": f"No matches found for '{self.query}'."}

        results = {}
        for author_name, affiliations in matched_authors.items():
            cached_author = Author.objects(name=author_name).first()
            description = cached_author.description if cached_author else None

            # Fetch titles if description missing
            paper_titles = []
            if not description:
                paper_titles = self._get_publication_titles(author_name)
                description = self._get_researcher_description(author_name, paper_titles)

            # Save to DB
            if cached_author:
                cached_author.description = cached_author.description or description
                cached_author.affiliations = cached_author.affiliations or affiliations
                cached_author.save()
                logger.info(f"Updated author '{author_name}' in MongoDB.")
            else:
                Author(
                    name=author_name,
                    description=description,
                    affiliations=affiliations
                ).save()
                logger.info(f"Saved new author '{author_name}' to MongoDB.")

            results[author_name] = {
                "description": description,
                "affiliations": affiliations
            }

        return results

    def _get_author_affiliations(self, author_query, limit=5):
        """Uses fuzzy + exact match to get authors and their affiliations from BaseX."""
        from BaseXClient import BaseXClient
        import xml.etree.ElementTree as ET

        session = BaseXClient.Session('localhost', 1984, 'admin', 'admin')
        author_aff_map = {}

        xquery = f"""
        let $author_name := lower-case('{author_query}')

        let $exact :=
          for $entry in //www
          let $author := lower-case(normalize-space(string-join($entry/author, ' ')))
          where $author = $author_name
          return element result {{
            attribute type {{ "exact" }},
            <author>{{ $entry/author }}</author>,
            for $aff in $entry/note[@type='affiliation']
            return <affiliation label="{{ $aff/@label }}">{{ $aff/text() }}</affiliation>
          }}

        let $partial :=
          for $entry in //www[author contains text {{ $author_name }} using fuzzy]
          let $author := lower-case(normalize-space(string-join($entry/author, ' ')))
          where $author != $author_name
          return element result {{
            attribute type {{ "partial" }},
            <author>{{ $entry/author }}</author>,
            for $aff in $entry/note[@type='affiliation']
            return <affiliation label="{{ $aff/@label }}">{{ $aff/text() }}</affiliation>
          }}
        let $partial_limited := subsequence($partial, 1, {limit})
        return ($exact, $partial_limited)
        """

        try:
            session.execute("OPEN dblp")
            result = session.execute(f'XQUERY {xquery}')

            root = ET.fromstring(f"<results>{result}</results>")
            for res in root.findall('result'):
                author_container = res.find('author')
                if not author_container:
                    continue
                authors = [a.text for a in author_container.findall('author') if a.text]
                affiliations = [
                    aff.text for aff in res.findall('affiliation') if aff.text
                ]
                for author in authors:
                    if author in author_aff_map:
                        author_aff_map[author].extend(
                            a for a in affiliations if a not in author_aff_map[author]
                        )
                    else:
                        author_aff_map[author] = affiliations

        except Exception as e:
            logger.error(f"BaseX query failed: {e}")
        finally:
            session.close()

        return author_aff_map

    def _get_publication_titles(self, author_name, limit=10):
        """Fetch and parse publication titles for a given author (exact match only)."""
        from BaseXClient import BaseXClient
        import xml.etree.ElementTree as ET

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
                    logger.warning(f"Skipping publication due to parse error: {e}")

            query.close()
            return list(dict.fromkeys(publications))[:limit]

        finally:
            session.close()

    def _get_researcher_description(self, name, paper_titles):
        """Generate a short researcher description using Ollama or fallback."""
        processor = OllamaTextProcessor(batch_size=1, max_tokens=50, temperature=0.7)
        researcher = {
            "name": name,
            "papers": [{"title": title} for title in paper_titles[:10]]
        }

        description = processor.generate_description(researcher)
        # description = "blla blla blla"  # Placeholder

        if not description:
            logger.error(f"Failed to generate description for {name}.")
            return "Description generation failed."

        return description

