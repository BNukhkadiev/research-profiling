import urllib.parse
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter
from utils.CORE import fuzzy_match
import pandas as pd
from django.conf import settings
from ..models import Author, Publication, CoAuthor
import logging
from BaseXClient import BaseXClient

logger = logging.getLogger(__name__)

core_data = pd.read_csv(settings.BASE_DIR / 'data' / 'CORE.csv', names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"])
core_data = core_data[['name', 'abbreviation', 'rank']]


class ProfileFetcher:
    def __init__(self, author_name, extractor):
        self.author_name = author_name.strip()
        self.extractor = extractor
        self.core_data = core_data
        self.publications_xml = []

    def fetch_profile(self):
        author = Author.objects(name=self.author_name).first()

        if author and author.publications:
            logger.info(f"Author '{author.name}' found in MongoDB with cached publications.")
            return self._author_to_dict(author)

        logger.info(f"Fetching from BaseX for author '{self.author_name}'")
        self.fetch_data_from_basex()
        affiliations = self._get_author_affiliations(self.author_name)
        publications, coauthors_dict, topic_counts = self.parse_publications()
        result = self.compile_results(
            self.author_name, affiliations, publications, coauthors_dict, topic_counts
        )

        return result 


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
        publications, coauthors_dict, topic_counts = [], defaultdict(int), Counter()

        for pub_xml in self.publications_xml:
            elem = ET.fromstring(pub_xml)
            pub_data = self._parse_single_publication(elem, coauthors_dict, topic_counts)
            publications.append(pub_data)

        return publications, coauthors_dict, topic_counts


    def _parse_single_publication(self, publ_info, coauthors_dict, topic_counts):
        title = publ_info.findtext("title", "").strip()
        year = int(publ_info.findtext("year", "0") or 0)

        # Get venue based on type
        venue = self._get_venue(publ_info)
        core_rank = fuzzy_match(self.core_data, venue, 'name', 'abbreviation') or "Unknown"

        # Detect preprint based on publtype="informal"
        is_preprint = publ_info.attrib.get("publtype") == "informal"

        # Authors
        authors = []
        for author in publ_info.findall("author"):
            author_name = author.text.strip()
            authors.append({"name": author_name})
            if author_name != self.author_name:
                coauthors_dict[author_name] += 1

        # Links
        links = [ee.text.strip() for ee in publ_info.findall("ee")]

        # Extract topics
        raw_topics = self.extractor.extract_keywords(doc=title)
        topics = [topic[0] for topic in raw_topics]
        topic_counts.update(topics)

        return {
            "title": title,
            "year": year,
            "venue": venue,  # Only venue name
            "core_rank": core_rank,
            "citations": 0,  # Placeholder
            "topics": topics,
            "authors": authors,
            "links": links,
            "abstract": "",  # Placeholder
            "preprint": is_preprint  # Preprint flag based on publtype
        }
    
    
    def compile_results(self, name, affiliations, publications, coauthors_dict, topic_counts):
        topics_list = [{topic: count} for topic, count in topic_counts.most_common()]
        coauthors_list = sorted(
            [{"name": co_name, "publications_together": count}
             for co_name, count in coauthors_dict.items()],
            key=lambda x: x["publications_together"], reverse=True
        )
        return {
            "name": name,
            "affiliations": affiliations,
            "h-index": 3,  # Placeholder
            "g-index": 2,  # Placeholder
            "total_papers": len(publications),
            "total_citations": 1000,  # Placeholder
            "papers": publications,
            "topics": topics_list,
            "coauthors": coauthors_list
        }

    def _get_venue(self, publ_info):
        """
        Get only the venue name from the publication.
        """
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
        """Fetch unique affiliations for a given author and return them as a plain string list."""
        session = BaseXClient.Session('localhost', 1984, 'admin', 'admin')
        affiliations = []
        
        try:
            session.execute("OPEN dblp")  # Open the correct DB
            
            query_text = f"""
            let $author_name := '{author_name}'
            for $aff in distinct-values(
            //(article|inproceedings|book|incollection|phdthesis|mastersthesis|proceedings|www|data)[author = $author_name]/note[@type='affiliation']/text()
            )
            return <affiliation>{{$aff}}</affiliation>
            """
            
            query = session.query(query_text)
            
            # Add detailed debugging
            for typecode, item in query.iter():
                try:
                    elem = ET.fromstring(item)
                    affiliations.append(elem.text.strip())                
                except ET.ParseError as e:
                    print("Parse error:", e, "on item:", item)
            
            query.close()
            return affiliations
        finally:
            session.close()