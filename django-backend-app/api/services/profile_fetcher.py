import urllib.parse
import xml.etree.ElementTree as ET
from collections import defaultdict
from utils.CORE import fuzzy_match
import pandas as pd
from django.conf import settings
from ..models import Author, Publication, CoAuthor
import logging
from BaseXClient import BaseXClient

logger = logging.getLogger(__name__)

# Load CORE data
core_data = pd.read_csv(
    settings.BASE_DIR / 'data' / 'CORE.csv',
    names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"]
)[['name', 'abbreviation', 'rank']]


class ProfileFetcher:
    def __init__(self, author_name):
        self.author_name = author_name.strip()
        self.core_data = core_data
        self.publications_xml = []

    def fetch_profile(self):
        author = Author.objects(name=self.author_name).first()

        # CASE 1: Already cached with publications
        if author and author.publications:
            logger.info(f"Author '{author.name}' found in MongoDB with cached publications.")
            return self._author_to_dict(author)

        logger.info(f"Fetching BaseX for author '{self.author_name}'")

        # Fetch from BaseX
        self.fetch_data_from_basex()
        affiliations = self._get_author_affiliations(self.author_name)
        publications, coauthors_dict = self.parse_publications()

        # CASE 2: Exists but missing publications -> update
        if author and not author.publications:
            logger.info(f"Updating existing author '{self.author_name}' with new publications.")
            author.affiliations = affiliations
            author.publications = self._build_publications_for_db(publications)
            author.save()
            return self._author_to_dict(author)

        # CASE 3: New author -> insert
        if not author:
            logger.info(f"Saving new author '{self.author_name}' to MongoDB.")
            author_doc = Author(
                name=self.author_name,
                affiliations=affiliations,
                description="",  # Placeholder
                publications=self._build_publications_for_db(publications)
            )
            author_doc.save()

        # Return compiled result
        return self.compile_results(self.author_name, affiliations, publications, coauthors_dict)

    def _build_publications_for_db(self, publications):
        """Convert parsed dict to Publication objects for DB."""
        publication_docs = []
        for pub in publications:
            pub_doc = Publication(
                title=pub["title"],
                abstract=pub["abstract"],
                core_rank=pub["core_rank"],
                citations=pub["citations"],
                coauthors=[CoAuthor(name=a["name"]) for a in pub["coauthors"] if a["name"] != self.author_name],
                links=pub["links"],
                year=pub['year'],
                venue=pub["venue"],
                topics=pub.get("topics", []),
                is_preprint=pub["is_preprint"]
            )
            publication_docs.append(pub_doc)
        return publication_docs

    def fetch_data_from_basex(self):
        session = BaseXClient.Session('localhost', 1984, 'admin', 'admin')
        try:
            session.execute("OPEN dblp")
            query_text = f"""
            let $author_name := '{self.author_name}'
            for $pub in //(article|inproceedings|book|incollection|phdthesis|mastersthesis|proceedings|www|data)
            where $pub/author = $author_name
            return $pub
            """
            query = session.query(query_text)
            for _, item in query.iter():
                self.publications_xml.append(item)
            query.close()
        finally:
            session.close()

    def parse_publications(self):
        publications, coauthors_dict = [], defaultdict(int)

        for pub_xml in self.publications_xml:
            elem = ET.fromstring(pub_xml)
            pub_data = self._parse_single_publication(elem, coauthors_dict)
            if pub_data:
                publications.append(pub_data)

        return publications, coauthors_dict

    def _parse_single_publication(self, publ_info, coauthors_dict):
        title = publ_info.findtext("title", "").strip()
        year = int(publ_info.findtext("year", "0") or 0)
        if title.lower() == "home page" or year == 0:
            logger.info(f"Skipping invalid publication: '{title}' with year: {year}")
            return None  # Skip this entry
        
        venue = self._get_venue(publ_info)
        core_rank = fuzzy_match(self.core_data, venue, 'name', 'abbreviation') or "Unknown"
        is_preprint = publ_info.attrib.get("publtype") == "informal"

        # Coauthors and authors
        authors = []
        for author in publ_info.findall("author"):
            author_name = author.text.strip()
            authors.append({"name": author_name})
            if author_name != self.author_name:
                coauthors_dict[author_name] += 1

        # Links
        links = [ee.text.strip() for ee in publ_info.findall("ee")]

        return {
            "title": title,
            "year": year,
            "venue": venue,
            "core_rank": core_rank,
            "citations": 0,
            "coauthors": authors,
            "links": links,
            "abstract": "",
            "is_preprint": is_preprint,
            "topics": []
        }

    def compile_results(self, name, affiliations, publications, coauthors_dict):
        coauthors_list = sorted(
            [{"name": co_name, "publications_together": count}
             for co_name, count in coauthors_dict.items()],
            key=lambda x: x["publications_together"], reverse=True
        )
        return {
            "name": name,
            "affiliations": affiliations,
            "h-index": -1,
            "g-index": -1,
            "total_papers": len(publications),
            "total_citations": -1,
            "publications": publications,
            "topics": [],
            "coauthors": coauthors_list
        }

    def _get_venue(self, publ_info):
        if publ_info.tag == "inproceedings":
            return publ_info.findtext("booktitle", "Unknown Conference")
        elif publ_info.tag == "article":
            return publ_info.findtext("journal", "Unknown Journal")
        elif publ_info.tag == "book":
            return publ_info.findtext("booktitle") or publ_info.findtext("publisher", "Unknown Book")
        elif publ_info.tag == "incollection":
            return publ_info.findtext("booktitle", "Unknown Book/Collection")
        elif publ_info.tag == "phdthesis":
            return "PhD Dissertation"
        elif publ_info.tag == "mastersthesis":
            return "Master's Dissertation"
        elif publ_info.tag == "data":
            return publ_info.findtext("publisher", "Unknown Dataset Publisher")
        return "Unknown"

    def _get_author_affiliations(self, author_name):
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
                    logger.warning(f"Parse error: {e} on item: {item}")
            query.close()
            return affiliations
        finally:
            session.close()

    def _author_to_dict(self, author):
        return {
            "name": author.name,
            "affiliations": author.affiliations,
            "description": author.description,
            "publications": [
                {
                    "title": pub.title,
                    "abstract": pub.abstract,
                    "venue": pub.venue,
                    "core_rank": pub.core_rank,
                    "citations": pub.citations,
                    "coauthors": [co.name for co in pub.coauthors],
                    "links": pub.links,
                    "year": pub.year,
                    "topics": pub.topics if pub.topics else [],
                    "is_preprint": pub.is_preprint
                }
                for pub in author.publications
            ]
        }
