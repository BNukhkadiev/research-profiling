import urllib.parse
import requests
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter
from utils.CORE import fuzzy_match 
import pandas as pd
from django.conf import settings
from ..models import Author, Publication
import logging

logger = logging.getLogger(__name__)


core_data = pd.read_csv(settings.BASE_DIR / 'data' / 'CORE.csv', names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"])
core_data = core_data[['name', 'abbreviation', 'rank']]  # Keep only required columns


class ProfileFetcher:
    def __init__(self, pid, extractor):
        self.pid = urllib.parse.unquote(pid.strip())
        self.root = None
        self.extractor = extractor
        self.core_data = core_data

    def fetch_profile(self):
        # 1. Check MongoDB first
        author = Author.objects(pid=self.pid).first()

        # 2. If found but publications are empty -> need to refresh from DBLP
        if author:
            if author.publications:
                logger.info(f"Author {author.name} found in MongoDB with cached publications.")
                return self._author_to_dict(author)
            else:
                logger.info(f"Author {author.name} found in MongoDB but publications missing. Refreshing from DBLP.")
        else:
            logger.info(f"Author with PID {self.pid} not found in MongoDB. Fetching from DBLP.")

        # 3. Fetch and process DBLP data (fresh fetch)
        self.fetch_data()
        name, affiliations = self.get_name_and_affiliations()
        publications, venue_counts, coauthors_dict, coauthor_pids, topic_counts, venues_list = self.parse_publications(name)
        
        result = self.compile_results(
            name, affiliations, self.pid, publications,
            venue_counts, coauthors_dict, coauthor_pids, topic_counts, venues_list
        )

        # 4. Save/update in MongoDB
        # If author existed, update it; else create new
        if author:
            author.update(
                set__name=name,
                set__affiliations=affiliations,
                set__dblp_url=f"https://dblp.org/pid/{self.pid}",
                set__publications=[Publication(
                    title=pub['title'],
                    year=pub['year'],
                    paper_type=pub['type'],
                    venue=pub['venue'],
                    citations=pub['citations'],
                    topics=pub['topics'],
                    links=pub['links'],
                    coauthors=[a['name'] for a in pub['authors'] if a['name'] != name]
                ) for pub in publications]
            )
            logger.info(f"Updated author {name} in MongoDB with publications.")
        else:
            # New insert
            author_doc = Author(
                pid=self.pid,
                name=name,
                affiliations=affiliations,
                dblp_url=f"https://dblp.org/pid/{self.pid}",
                abstract="",  # Empty for now
                publications=[Publication(
                    title=pub['title'],
                    year=pub['year'],
                    paper_type=pub['type'],
                    venue=pub['venue'],
                    citations=pub['citations'],
                    topics=pub['topics'],
                    links=pub['links'],
                    coauthors=[a['name'] for a in pub['authors'] if a['name'] != name]
                ) for pub in publications]
            )
            author_doc.save()
            logger.info(f"Saved new author {name} to MongoDB.")

        return result
    

    def fetch_data(self):
        dblp_url = f'https://dblp.org/pid/{self.pid}.xml'
        logger.info(f"Querying DBLP API: {dblp_url}")
        response = requests.get(dblp_url)
        response.raise_for_status()
        if not response.text.strip():
            logger.error(f"DBLP returned empty response for PID: {self.pid}")
            raise ValueError("DBLP returned an empty response. PID may not exist.")
        self.root = ET.fromstring(response.text)

    def get_name_and_affiliations(self):
        name = self.root.get("name", "Unknown Researcher")
        affiliations = [note.text for note in self.root.findall(".//note[@type='affiliation']")]
        return name, affiliations

    def parse_publications(self, name):
        publications, venue_counts, coauthors_dict, coauthor_pids, topic_counts, venues_list = [], {}, defaultdict(int), {}, Counter(), []
        
        for pub in self.root.findall(".//r"):
            publ_info = pub.find("./*")
            if publ_info is not None:
                pub_data = self._parse_single_publication(
                    publ_info, name, coauthors_dict, coauthor_pids, topic_counts, venues_list, venue_counts
                )
                publications.append(pub_data)

        return publications, venue_counts, coauthors_dict, coauthor_pids, topic_counts, venues_list


    def _parse_single_publication(self, publ_info, name, coauthors_dict, coauthor_pids, topic_counts, venues_list, venue_counts):
        title = publ_info.findtext("title", "").strip()
        year = int(publ_info.findtext("year", "0") or 0)
        paper_type, venue = self._get_publication_type_and_venue(publ_info)
        
        venues_list.append(venue)
        venue_counts[venue] = venue_counts.get(venue, 0) + 1

        authors = []
        for author in publ_info.findall("author"):
            author_name = author.text
            author_pid = author.get("pid", "")
            authors.append({"name": author_name, "pid": author_pid})
            if author_name != name:
                coauthors_dict[author_name] += 1
                coauthor_pids[author_name] = author_pid

        links = [ee.text for ee in publ_info.findall("ee")]

        # Use title instead of dummy abstract and limit topic extraction
        raw_topics = self.extractor.extract_keywords(doc=title)
        topics = [topic[0] for topic in raw_topics]
        topic_counts.update(topics)

        return {
            "title": title,
            "year": year,
            "type": paper_type,
            "venue": venue,
            "citations": 0,
            "topics": topics,
            "authors": authors,
            "links": links
        }

    def _get_publication_type_and_venue(self, publ_info):
        if publ_info.tag == "inproceedings":
            return "Conference Paper", publ_info.findtext("booktitle", "Unknown Conference")
        elif publ_info.tag == "article":
            return "Journal Article", publ_info.findtext("journal", "Unknown Journal")
        elif publ_info.tag == "phdthesis":
            return "PhD Thesis", "PhD Dissertation"
        elif publ_info.tag == "mastersthesis":
            return "Masters Thesis", "Masters Dissertation"
        return "Other", "Unknown"

    def compile_results(self, name, affiliations, pid, publications, venue_counts, coauthors_dict, coauthor_pids, topic_counts, venues_list):
        venue_ranks = {venue: fuzzy_match(self.core_data, venue, 'name', 'abbreviation') for venue in venues_list}
        venue_list = [{venue: {"count": count, "core_rank": venue_ranks.get(venue, "Unknown")}} 
                      for venue, count in sorted(venue_counts.items(), key=lambda x: x[1], reverse=True)]
        topics_list = [{topic: count} for topic, count in topic_counts.most_common()]
        coauthors_list = sorted(
            [{"name": co_name, "pid": coauthor_pids.get(co_name, ""), "publications_together": count}
             for co_name, count in coauthors_dict.items()],
            key=lambda x: x["publications_together"], reverse=True
        )

        return {
            "name": name,
            "pid": pid,
            "affiliations": affiliations,
            "h-index": 3,  # Placeholder
            "g-index": 2,  # Placeholder
            "total_papers": len(publications),
            "total_citations": 1000,  # Placeholder
            "venues": venue_list,
            "topics": topics_list,
            "papers": publications,
            "coauthors": coauthors_list
        }

    

    def _author_to_dict(self, author):
        return {
            "name": author.name,
            "pid": author.pid,
            "affiliations": author.affiliations,
            "dblp_url": author.dblp_url,
            "abstract": author.abstract,
            "papers": [
                {
                    "title": pub.title,
                    "year": pub.year,
                    "type": pub.paper_type,
                    "venue": pub.venue,
                    "citations": pub.citations,
                    "topics": pub.topics,
                    "links": pub.links,
                    "coauthors": pub.coauthors
                } for pub in author.publications
            ]
        }
