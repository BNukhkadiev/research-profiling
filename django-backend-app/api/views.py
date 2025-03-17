import logging
from urllib.parse import unquote
import requests
import time
import hashlib
import difflib
import urllib.parse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.core.cache import cache
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import xml.etree.ElementTree as ET
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token  
from collections import Counter, defaultdict
import pandas as pd
import string
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
# Custom utilities
from utils.keybert import KeywordExtractor
from utils.abstracts import get_abstract_from_openalex
from utils.CORE import fuzzy_match

logger = logging.getLogger(__name__)

# Load CORE data
core_data = pd.read_csv(
    'data/CORE.csv',
    names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"]
)
core_data = core_data[['name', 'abbreviation', 'rank']]

extractor = KeywordExtractor()
from django.contrib.auth import authenticate
 
@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView): 
     permission_classes = [AllowAny]
 
     def post(self, request):
         # Extract email and password from the request data
         email = request.data.get('email')
         password = request.data.get('password')
 
         # Validate input
         if not email or not password:
             return Response(
                 {"error": "Email and password are required."},
                 status=status.HTTP_400_BAD_REQUEST,
             )
 
         try:
             # Find the user by email
             user = User.objects.get(email=email)
         except User.DoesNotExist:
             return Response(
                 {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
             )
 
         # Authenticate the user using username and password
         user = authenticate(username=user.username, password=password)
 
         if user is not None:
             # Generate or retrieve a token
             token, created = Token.objects.get_or_create(user=user)
             return Response(
                 {
                     "token": token.key,
                     "user": {
                         "id": user.id,
                         "email": user.email,
                         "name": user.get_full_name() or user.username,
                     },
                 },
                 status=status.HTTP_200_OK,
             )
         else:
             return Response(
                 {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
             )
         from rest_framework.permissions import AllowAny
class SignupView(APIView):
     permission_classes = [AllowAny]
     def post(self, request):
         
         first_name = request.data.get("first_name")
         last_name = request.data.get("last_name")
         email = request.data.get("email")
         password = request.data.get("password")
 
         
         if not first_name or not last_name or not email or not password:
             
             return Response(
                 {"error": "All fields are required."},
                 status=status.HTTP_400_BAD_REQUEST,
             )
 
         
         if User.objects.filter(email=email).exists():
             
             return Response(
                 {"error": "A user with this email already exists."},
                 status=status.HTTP_400_BAD_REQUEST,
             )
 
         
         try:
             user = User.objects.create_user(
                 username=email,
                 email=email,
                 password=password,
                 first_name=first_name,
                 last_name=last_name,
             )
             user.save()
         except Exception as e:
             
             return Response(
                 {"error": "An error occurred while creating the user: " + str(e)},
                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
             )
 
         
         return Response(
             {"message": "User created successfully."},
             status=status.HTTP_201_CREATED,
         )
def get_citation_count(title, year=None, authors=None):
    """
    Fetches citation count for a given paper title using Semantic Scholar's search endpoint.
    Uses fuzzy matching based on title similarity, year, and author overlap.
    Implements retry logic with exponential backoff.
    """
    try:
        query = urllib.parse.quote(title)
        search_url = (
            "https://api.semanticscholar.org/graph/v1/paper/search"
            f"?query={query}&fields=citationCount,year,title,authors&limit=10"
        )

        retries = 3
        response = None
        delay = 0.2
        for attempt in range(retries):
            try:
                response = requests.get(search_url, timeout=10)
                response.raise_for_status()
                break
            except (requests.exceptions.RequestException, requests.exceptions.Timeout) as e:
                logger.error(f"Attempt {attempt + 1}: {e}")
                if attempt < retries - 1:
                    time.sleep(delay)
                    delay *= 2
                    continue
                logger.error(f"Failed to fetch citation count after {retries} attempts: {e}")
                return 0

        data = response.json()
        if not data.get("data"):
            logger.warning(f"No papers found for title '{title}'")
            return 0

        best_match = None
        best_score = -1
        for paper in data["data"]:
            score = 0
            s2_title = paper.get("title", "")
            title_similarity = difflib.SequenceMatcher(None, title.lower(), s2_title.lower()).ratio() * 100
            score += title_similarity

            paper_year = paper.get("year")
            if year is not None and paper_year == year:
                score += 50
            elif year is not None and paper_year is not None:
                year_diff = abs(paper_year - year)
                if year_diff <= 3:
                    score += max(0, 30 - (year_diff * 10))

            if authors and paper.get("authors"):
                paper_authors = [a.get("name", "").lower() for a in paper["authors"]]
                for author_name in authors:
                    if any(author_name.lower() in pa for pa in paper_authors):
                        score += 30
                        break

            if score > best_score:
                best_score = score
                best_match = paper

        if best_score >= 40:
            logger.info(
                f"Best match for '{title}' => Score: {best_score:.1f}, "
                f"Citations: {best_match.get('citationCount', 0)}"
            )
            return best_match.get("citationCount", 0)
        else:
            logger.warning(f"No good match found for '{title}', best score was {best_score:.1f}")
            return 0

    except Exception as e:
        logger.error(f"Error fetching citation count for title '{title}': {e}")
        return 0


def compute_h_index(citations):
    """
    Computes the h-index from a list of citation counts.
    """
    if not citations:
        return 0
    citations = [c for c in citations if isinstance(c, (int, float)) and c is not None]
    if not citations:
        return 0
    citations.sort(reverse=True)
    h = 0
    for i, c in enumerate(citations):
        if c >= i + 1:
            h = i + 1
        else:
            break
    return h


def compute_g_index(citations):
    """
    Computes the g-index from a list of citation counts.
    """
    if not citations:
        return 0
    citations = [c for c in citations if isinstance(c, (int, float)) and c is not None]
    if not citations:
        return 0
    citations.sort(reverse=True)
    total = 0
    g = 0
    for i, c in enumerate(citations):
        total += c
        if total >= (i + 1) ** 2:
            g = i + 1
        else:
            break
    return g


def get_researcher_citation_metrics(publications):
    """
    Calculates total citations, h-index, and g-index for a researcher.
    Utilizes caching to minimize redundant API calls.
    """
    titles = sorted([p.get('title', '') for p in publications])
    cache_key = f"citation_metrics_{hashlib.md5(str(titles).encode()).hexdigest()}"
    cached_result = cache.get(cache_key)
    if cached_result:
        logger.info(f"Using cached citation metrics for {len(publications)} publications")
        return cached_result

    citations = []
    for pub in publications:
        title = pub.get('title', '')
        year = pub.get('year')
        authors = []
        for a in pub.get('authors', []):
            if isinstance(a, dict) and a.get('name'):
                authors.append(a['name'])
            elif isinstance(a, str):
                authors.append(a)
        ccount = get_citation_count(title, year, authors)
        citations.append(ccount)
        time.sleep(0.2)

    h_index = compute_h_index(citations)
    g_index = compute_g_index(citations)
    total_citations = sum(citations)
    result = {
        'total_citations': total_citations,
        'h_index': h_index,
        'g_index': g_index
    }
    cache.set(cache_key, result, 60 * 60 * 24)
    return result


@method_decorator(csrf_exempt, name='dispatch')
class SemanticScholarSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        """Search authors via Semantic Scholar and enrich with DBLP data."""
        search_query = request.GET.get('query', '').strip()
        logger.info(f"Received author search request with query: {search_query}")

        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Semantic Scholar author search
            semantic_scholar_url = (
                f"https://api.semanticscholar.org/graph/v1/author/search?"
                f"query={search_query}&fields=name,url,affiliations,paperCount,hIndex,citationCount,"
                f"externalIds,papers.title,papers.year"
            )
            logger.info(f"Querying Semantic Scholar API: {semantic_scholar_url}")
            semantic_scholar_response = requests.get(semantic_scholar_url, timeout=10)
            semantic_scholar_response.raise_for_status()
            semantic_scholar_data = semantic_scholar_response.json()

            # DBLP author search
            dblp_url = f"https://dblp.org/search/author/api?q={search_query}&format=json"
            logger.info(f"Querying DBLP API: {dblp_url}")
            dblp_response = requests.get(dblp_url, timeout=10)
            dblp_response.raise_for_status()
            dblp_data = dblp_response.json()

            if not semantic_scholar_data.get("data") or not dblp_data.get("result", {}).get("hits", {}).get("hit"):
                logger.warning("No authors found in Semantic Scholar or DBLP.")
                return Response({"error": "No authors found."}, status=status.HTTP_404_NOT_FOUND)

            dblp_authors = dblp_data["result"]["hits"]["hit"]
            processed_authors = []
            for scholar_author in semantic_scholar_data["data"]:
                scholar_paper_titles = {
                    paper["title"].strip().rstrip(".")
                    for paper in scholar_author.get("papers", [])
                    if "title" in paper
                }
                best_match = None
                max_intersection_size = 0
                for dblp_author in dblp_authors:
                    author_name = dblp_author["info"]["author"]
                    author_url = dblp_author["info"].get("url")
                    dblp_affiliations = []
                    dblp_paper_titles = []
                    if not author_url:
                        logger.debug(f"No URL found for DBLP author: {author_name}")
                        continue
                    try:
                        logger.info(f"Fetching DBLP XML for author: {author_name} from {author_url}")
                        author_profile_response = requests.get(f"{author_url}.xml", timeout=10)
                        author_profile_response.raise_for_status()
                        root = ET.fromstring(author_profile_response.text)
                        dblp_paper_titles = [title.text.rstrip(".") for title in root.findall(".//title")]
                        logger.debug(f"Extracted DBLP titles for {author_name}: {dblp_paper_titles}")
                        if "notes" in dblp_author["info"]:
                            notes = dblp_author["info"]["notes"].get("note", [])
                            if isinstance(notes, dict):
                                notes = [notes]
                            dblp_affiliations = [
                                note["text"] for note in notes if note.get("@type") == "affiliation"
                            ]
                        intersection_size = len(scholar_paper_titles.intersection(dblp_paper_titles))
                        logger.debug(f"Intersection size for {author_name}: {intersection_size}")
                        if intersection_size > max_intersection_size and intersection_size > 3:
                            max_intersection_size = intersection_size
                            best_match = {"affiliations": dblp_affiliations}
                    except (requests.exceptions.RequestException, ET.ParseError) as e:
                        logger.error(f"Error processing DBLP data for author {author_name}: {e}")
                if best_match:
                    scholar_author["affiliations"].extend(best_match["affiliations"])
                else:
                    logger.warning(f"No match found for Semantic Scholar author: {scholar_author['name']}")
                processed_authors.append(scholar_author)
            logger.info("Processed authors with enriched affiliations.")
            return Response({"data": processed_authors}, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error querying APIs: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicationSearchView(APIView):
    permission_classes = [AllowAny]
    """
    Retrieves publications for a given author using Semantic Scholar.
    Uses caching and batch requests for missing citation counts.
    """

    def get(self, request):
        author_id = request.GET.get('author_id', '').strip()
        logger.info(f"Received publication search request for author ID: {author_id}")
        if not author_id:
            return Response({"error": "Author ID parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        cache_key = f"author_publications_{author_id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            logger.info(f"Using cached publication data for author ID: {author_id}")
            return Response({"publications": cached_data}, status=status.HTTP_200_OK)

        semantic_scholar_url = (
            f"https://api.semanticscholar.org/graph/v1/author/{author_id}/papers?"
            f"fields=url,paperId,title,year,authors,abstract,venue,citationCount,fieldsOfStudy"
        )
        logger.info(f"Making request to Semantic Scholar API: {semantic_scholar_url}")
        try:
            session = requests.Session()
            retries = Retry(total=3, backoff_factor=0.5, status_forcelist=[429, 500, 502, 503, 504])
            session.mount('https://', HTTPAdapter(max_retries=retries))
            semantic_scholar_response = session.get(semantic_scholar_url, timeout=15)
            logger.info(f"Semantic Scholar API response status code: {semantic_scholar_response.status_code}")
            semantic_scholar_response.raise_for_status()

            data = semantic_scholar_response.json()
            publications = data.get("data", [])
            formatted_publications = []
            batch_size = 25

            for i in range(0, len(publications), batch_size):
                batch = publications[i : i + batch_size]
                # Collect paper IDs missing citationCount
                missing_ids = {}
                for pub in batch:
                    paper_id = pub.get("paperId")
                    if pub.get("citationCount") is None and paper_id:
                        missing_ids[paper_id] = pub

                # Fetch missing citation counts in a single batch request
                if missing_ids:
                    batch_url = "https://api.semanticscholar.org/graph/v1/paper/batch?fields=paperId,citationCount"
                    body = {"ids": list(missing_ids.keys())}
                    try:
                        batch_response = session.post(batch_url, json=body, timeout=10)
                        batch_response.raise_for_status()
                        batch_data = batch_response.json()
                        citation_mapping = {item.get("paperId"): item.get("citationCount", 0) for item in batch_data}
                        for pid, pub in missing_ids.items():
                            pub["citationCount"] = citation_mapping.get(pid, 0)
                    except Exception as e:
                        logger.error(f"Batch request error for citation counts: {e}")
                        for pid, pub in missing_ids.items():
                            pub["citationCount"] = 0

                # Format each publication
                for pub in batch:
                    s2_url = pub.get("url")
                    paper_id = pub.get("paperId")
                    if not s2_url and paper_id:
                        s2_url = f"https://www.semanticscholar.org/paper/{paper_id}"
                    formatted_publications.append({
                        "url": s2_url or "",
                        "title": pub.get("title"),
                        "year": pub.get("year"),
                        "authors": [
                            {"name": author.get("name"), "id": author.get("authorId")}
                            for author in pub.get("authors", [])
                        ],
                        "abstract": pub.get("abstract"),
                        "venue": pub.get("venue"),
                        "citationCount": pub.get("citationCount", 0),
                        "fieldsOfStudy": pub.get("fieldsOfStudy"),
                    })

            # Cache publication data for 6 hours
            cache.set(cache_key, formatted_publications, 60 * 60 * 6)
            logger.info(f"Successfully fetched and formatted {len(formatted_publications)} publications.")
            return Response({"publications": formatted_publications}, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error while calling Semantic Scholar API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AuthorDetailsView(APIView):
    permission_classes = [AllowAny]
    """
    Fetches author details from Semantic Scholar and processes affiliations.
    """

    def get(self, request):
        author_id = request.GET.get("author_id", "").strip()
        affiliation = request.GET.get("affiliation", "").strip()
        logger.info(f"Received request to fetch details for author ID: {author_id} with affiliation: {affiliation}")
        if not author_id:
            return Response({"error": "Author ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        semantic_scholar_url = (
            f"https://api.semanticscholar.org/graph/v1/author/{author_id}?"
            f"fields=name,url,affiliations,paperCount,hIndex,citationCount"
        )
        logger.info(f"Querying Semantic Scholar API: {semantic_scholar_url}")
        try:
            semantic_scholar_response = requests.get(semantic_scholar_url, timeout=10)
            semantic_scholar_response.raise_for_status()
            author_data = semantic_scholar_response.json()

            # If a manual 'affiliation' was provided, we add it if not already present
            if affiliation and affiliation not in author_data.get("affiliations", []):
                author_data.setdefault("affiliations", []).append(affiliation)

            logger.info(f"Author data fetched and processed successfully: {author_data}")
            return Response(author_data, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error querying Semantic Scholar API: {e}")
            return Response({"error": "Failed to fetch author details."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaperDetailsView(APIView):
    permission_classes = [AllowAny]
    """
    Retrieves detailed information for a specific paper using Semantic Scholar.
    """

    def get(self, request):
        paper_id = request.GET.get('paper_id', '').strip()
        logger.info(f"Received paper details request for paper ID: {paper_id}")
        if not paper_id:
            return Response({"error": "Paper ID parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        semantic_scholar_url = (
            f"https://api.semanticscholar.org/graph/v1/paper/{paper_id}?"
            f"fields=url,year,authors,abstract,fieldsOfStudy,venue,citationCount"
        )
        logger.info(f"Making request to Semantic Scholar API: {semantic_scholar_url}")
        try:
            semantic_scholar_response = requests.get(semantic_scholar_url, timeout=10)
            semantic_scholar_response.raise_for_status()
            paper_data = semantic_scholar_response.json()

            formatted_paper = {
                "url": paper_data.get("url"),
                "year": paper_data.get("year"),
                "authors": [{"name": author.get("name")} for author in paper_data.get("authors", [])],
                "abstract": paper_data.get("abstract"),
                "fieldsOfStudy": paper_data.get("fieldsOfStudy"),
                "venue": paper_data.get("venue"),
                "citationCount": paper_data.get("citationCount", 0),
            }
            logger.info(f"Successfully fetched paper details for paper ID {paper_id}.")
            return Response({"paper": formatted_paper}, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error while calling Semantic Scholar API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search_query = request.GET.get('query', '').strip()
        logger.info(f"Received author search request with query: {search_query}")
        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            dblp_url = f"https://dblp.org/search/author/api?q={search_query}&format=json"
            logger.info(f"Querying DBLP API: {dblp_url}")
            dblp_response = requests.get(dblp_url, timeout=10)
            dblp_response.raise_for_status()
            dblp_data = dblp_response.json()

            logger.info("ResearcherThumbnailView is a placeholder.")
            return Response({"publications": []}, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching DBLP XML for author {search_query}: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DBLPSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search_query = request.GET.get('query', '').strip()
        logger.info(f"Received author search request with query: {search_query}")
        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            dblp_url = f"https://dblp.org/search/author/api?q={urllib.parse.quote(search_query)}&format=json"
            logger.info(f"Querying DBLP API: {dblp_url}")
            dblp_response = requests.get(dblp_url, timeout=10)
            dblp_response.raise_for_status()
            dblp_data = dblp_response.json()

            if not dblp_data.get("result", {}).get("hits", {}).get("hit"):
                logger.warning("No authors found in DBLP.")
                return Response({"error": "No authors found."}, status=status.HTTP_404_NOT_FOUND)

            authors_list = []
            dblp_authors = dblp_data["result"]["hits"]["hit"]

            for dblp_author in dblp_authors:
                author_info = dblp_author.get("info", {})
                author_name = author_info.get("author")
                author_url = author_info.get("url")
                if not author_url:
                    continue

                author_pid = author_url.split("/pid/")[-1]
                author_pid_url = f"{author_url}.xml"
                logger.info(f"Fetching DBLP XML from {author_pid_url}")
                author_profile_response = requests.get(author_pid_url, timeout=10)
                author_profile_response.raise_for_status()

                root = ET.fromstring(author_profile_response.text)
                affiliations = [note.text for note in root.findall(".//note[@type='affiliation']")]

                publications = []
                for pub in root.findall(".//r"):
                    publ_info = pub.find("./*")
                    if publ_info is not None:
                        title = publ_info.findtext("title", "").strip()
                        venue = (
                            publ_info.findtext("booktitle")
                            or publ_info.findtext("journal", "Unknown Venue")
                        )
                        if title:
                            publications.append((title, venue))

                abstract = ""
                authors_list.append({
                    "name": author_name,
                    "pid": author_pid,
                    "affiliations": affiliations,
                    "dblp_url": author_url,
                    "abstract": abstract
                })

            return Response({"authors": authors_list}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error querying DBLP API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ET.ParseError as e:
            logger.error(f"Error parsing DBLP XML: {e}")
            return Response({"error": "Failed to parse DBLP XML."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResearcherProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        pid = request.GET.get('pid', '').strip()
        pid = urllib.parse.unquote(pid)
        logger.info(f"Received author details request with pid: {pid}")

        if not pid:
            return Response({"error": "pid parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            dblp_url = f'https://dblp.org/pid/{pid}.xml'
            logger.info(f"Querying DBLP API: {dblp_url}")
            dblp_response = requests.get(dblp_url, timeout=10)
            dblp_response.raise_for_status()

            if not dblp_response.text.strip():
                logger.error(f"DBLP returned an empty response for PID: {pid}")
                return Response(
                    {"error": "DBLP returned an empty response. PID may not exist."},
                    status=status.HTTP_404_NOT_FOUND
                )

            root = ET.fromstring(dblp_response.text)
            name = root.get("name", "Unknown Researcher")
            affiliations = [note.text for note in root.findall(".//note[@type='affiliation']")]

            publications = []
            venue_counts = {}
            coauthors_dict = defaultdict(int)
            coauthor_pids = {}
            topic_counts = Counter()
            venues_list = []

            for pub in root.findall(".//r"):
                publ_info = pub.find("./*")
                if publ_info is not None:
                    title = publ_info.findtext("title", "").strip()
                    year_str = publ_info.findtext("year", "0") or "0"
                    year = int(year_str) if year_str.isdigit() else 0

                    if publ_info.tag == "inproceedings":
                        paper_type = "Conference Paper"
                        venue = publ_info.findtext("booktitle", "Unknown Conference")
                    elif publ_info.tag == "article":
                        paper_type = "Journal Article"
                        venue = publ_info.findtext("journal", "Unknown Journal")
                    elif publ_info.tag == "phdthesis":
                        paper_type = "PhD Thesis"
                        venue = "PhD Dissertation"
                    elif publ_info.tag == "mastersthesis":
                        paper_type = "Masters Thesis"
                        venue = "Masters Dissertation"
                    else:
                        paper_type = "Other"
                        venue = "Unknown"

                    venues_list.append(venue)
                    venue_counts[venue] = venue_counts.get(venue, 0) + 1

                    paper_authors = []
                    for author_elem in publ_info.findall("author"):
                        author_name = author_elem.text
                        author_pid = author_elem.get("pid", "")
                        paper_authors.append({"name": author_name, "pid": author_pid})
                        if author_name != name:
                            coauthors_dict[author_name] += 1
                            coauthor_pids[author_name] = author_pid

                    links = [ee.text for ee in publ_info.findall("ee")]
                    primary_url = links[0] if links else ""

                    # Placeholder text for KeyBERT (since real abstracts aren't in DBLP)
                    abstract = "Some abstract here for topic extraction..."
                    raw_topics = extractor.extract_keywords(doc=abstract)
                    topics = [t[0] for t in raw_topics]
                    topic_counts.update(topics)

                    authors_for_citation = [a["name"] for a in paper_authors]
                    citation_count = get_citation_count(title, year, authors_for_citation)

                    publications.append({
                        "title": title,
                        "year": year,
                        "type": paper_type,
                        "venue": venue,
                        "citations": citation_count,
                        "topics": topics,
                        "authors": paper_authors,
                        "links": links,
                        "url": primary_url,
                    })

            citations_list = [pub["citations"] for pub in publications]
            h_index = compute_h_index(citations_list)
            g_index = compute_g_index(citations_list)
            total_citations = sum(citations_list)

            # Attempt to match each venue to a CORE rank using fuzzy matching
            venue_ranks = {
                v: fuzzy_match(core_data, v, 'name', 'abbreviation') for v in venues_list
            }

            # Build a list of { "venueName": {"count": X, "core_rank": Y } }
            venue_list = [
                {venue: {"count": cnt, "core_rank": venue_ranks.get(venue, "Unknown")}}
                for venue, cnt in sorted(venue_counts.items(), key=lambda x: x[1], reverse=True)
            ]

            # Convert topics from the Counter to a list of { topicName: count }
            topics_list = [{t: c} for t, c in topic_counts.most_common()]

            # Sort coauthors by how many publications they share
            coauthors_list = sorted(
                [
                    {"name": coauth, "pid": coauthor_pids.get(coauth, ""), "publications_together": ct}
                    for coauth, ct in coauthors_dict.items()
                ],
                key=lambda x: x["publications_together"],
                reverse=True
            )

            return Response({
                "name": name,
                "affiliations": affiliations,
                "h-index": h_index,
                "g-index": g_index,
                "total_papers": len(publications),
                "total_citations": total_citations,
                "venues": venue_list,
                "topics": topics_list,
                "papers": publications,
                "coauthors": coauthors_list,
            }, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching data from DBLP for PID {pid}: {e}")
            return Response({"error": "Failed to fetch data from DBLP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except ValueError as e:
            logger.error(f"Invalid or no data found for PID {pid}: {e}")
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.exception(f"Unexpected error occurred for PID {pid}: {e}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateCitationsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        pid = request.data.get("pid", "").strip()
        if not pid:
            logger.warning("No PID provided in request")
            return Response({"error": "pid parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Updating citations and abstracts for PID: {pid}")

        try:
            # Example usage (assuming you have a Mongoengine model named 'Author'):
            # from myapp.models import Author
            # author = Author.objects(pid=pid).first()
            # ...
            # This snippet is placeholder logic:
            author = None  # TODO: fetch from your DB if needed

            if not author:
                logger.warning(f"Author with PID {pid} not found in MongoDB.")
                return Response({"error": "Author not found."}, status=status.HTTP_404_NOT_FOUND)

            # Example placeholder:
            # Collect all DOIs from publications, fetch from OpenAlex, update, etc.

            return Response({"message": "Citations and abstracts updated successfully."}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.exception(f"Error updating citations for PID {pid}: {e}")
            return Response({"error": "Failed to update citations and abstracts."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GitHubProfileView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        name = request.GET.get("name", "").strip()
        affiliation = request.GET.get("affiliation", "").strip()

        if not name or not affiliation:
            return Response(
                {"error": "Both 'name' and 'affiliation' parameters are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove the last word from affiliation (if more than one word)
        words = affiliation.split()
        if len(words) > 1:
            affiliation_excl_last = " ".join(words[:-1]).rstrip(",")
        else:
            affiliation_excl_last = affiliation.rstrip(",")

        logger.info(f"Name: {name}, Affiliation minus last word: {affiliation_excl_last}")

        # Query the GitHub Search API for the first matching user
        query = name.replace(" ", "+")
        search_api_url = f"https://api.github.com/search/users?q={query}"

        try:
            search_response = requests.get(search_api_url)
            search_response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling GitHub Search API: {e}")
            return Response({"github_url": "Error calling GitHub Search API"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        search_data = search_response.json()
        items = search_data.get("items", [])

        if not items:
            logger.warning(f"No GitHub user found for name: {name}")
            return Response({"github_url": "No GitHub user found"}, status=status.HTTP_200_OK)

        # Take the first user as the match
        user_info = items[0]
        user_details_api = user_info.get("url")
        if not user_details_api:
            logger.warning("No user details URL found in search result.")
            return Response({"github_url": "No GitHub repository found"}, status=status.HTTP_200_OK)

        # Fetch the user’s detailed info from GitHub
        try:
            user_details_resp = requests.get(user_details_api)
            user_details_resp.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching user details: {e}")
            return Response({"github_url": "Error fetching user details from GitHub"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user_details = user_details_resp.json()
        company = user_details.get("company", "") or ""
        location = user_details.get("location", "") or ""

        # location_first_word is the first word in the location (remove punctuation)
        location_words = location.strip().split()
        location_first_word = location_words[0].strip(string.punctuation) if location_words else ""

        logger.debug(f"[GitHubProfileView] company={company}, location={location}")

        # Check the matching condition
        condition_location = (location_first_word and location_first_word in affiliation_excl_last)
        condition_company = (company == affiliation_excl_last)

        if condition_location or condition_company:
            github_url = user_details.get("html_url", "No GitHub repository found")
        else:
            github_url = "No GitHub repository found"

        return Response({"github_url": github_url}, status=status.HTTP_200_OK)


# Global comparison list to store researcher names
comparison_list = set()


class CompareResearchersView(APIView):
    permission_classes = [AllowAny]
    """
    Manages the list of researchers in comparison, based on names.
    """

    def get(self, request):
        """
        Get the list of researchers currently in the comparison list.
        """
        return Response({"comparison_list": list(comparison_list)}, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Add a researcher to the comparison list.
        If not found in MongoDB, fetch and store. If found without publications, update.
        """
        name = request.data.get("name", "").strip()
        if not name:
            return Response({"error": "name parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # If already in comparison list
        if name in comparison_list:
            return Response({"message": "Researcher already in comparison list."}, status=status.HTTP_200_OK)

        try:
            # Example: If you have a Mongoengine model named Author:
            # author = Author.objects(name__iexact=name).first()
            author = None  # Replace with your actual DB fetch
            # (The rest of the code is your original logic for fetching & storing if not found)

            # If you do have an 'author' and author.publications, we add to list:
            if author and author.publications:
                comparison_list.add(author.name)
                return Response({"message": "Researcher added to comparison list."}, status=status.HTTP_200_OK)

            # Otherwise fetch from some external source
            logger.info(f"Fetching researcher data for {name}")
            # fetcher = ProfileFetcher(author_name=name, extractor=KeywordExtractor()) # type: ignore
            # profile_data = fetcher.fetch_profile()

            # Then do your saving logic...
            # For demonstration, just do a placeholder response:
            comparison_list.add(name)
            return Response({"message": "Researcher added to comparison list."}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Failed to fetch and save researcher '{name}': {e}")
            return Response({"error": "Failed to fetch and save researcher data."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        """
        Remove a researcher from the comparison list.
        Accepts name as a query parameter: ?name=Researcher%20Name
        """
        name = request.query_params.get("name", "").strip()
        if not name:
            return Response({"error": "name parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        global comparison_list

        # Case 1: Researcher is in comparison list, remove
        if name in comparison_list:
            comparison_list.remove(name)
            return Response({"message": f"Removed researcher '{name}' from comparison list."}, status=status.HTTP_200_OK)

        # Case 2: Researcher not found
        return Response({"error": "Researcher not found in comparison list."}, status=status.HTTP_404_NOT_FOUND)

    @staticmethod
    def _author_to_dict(author):
        """
        Utility to convert Author Mongo object to dict for JSON response.
        """
        return {
            "name": author.name,
            "affiliations": author.affiliations,
            "description": author.description,
            "publications": [pub.to_mongo() for pub in author.publications]  # Convert publications for response
        }
