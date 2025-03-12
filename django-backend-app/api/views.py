import logging
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token  # For token-based auth
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
import xml.etree.ElementTree as ET
##from utils.LLM import get_researcher_description
from utils.keybert import KeywordExtractor
import string
from .services.profile_fetcher import ProfileFetcher
from .services.dblp_author_search import DblpAuthorSearchService



# core_data =  pd.read_csv('data/CORE.csv', names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"])
# core_data = core_data[['name', 'abbreviation', 'rank']]
import difflib
import urllib.parse
from collections import Counter, defaultdict
import pandas as pd

from .models import Author , Publication # Import your MongoEngine model




extractor = KeywordExtractor()
core_data =  pd.read_csv('data/CORE.csv', names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"])
core_data = core_data [['name', 'abbreviation', 'rank']]
            
# Set up logging
logger = logging.getLogger(__name__)


#########
class PublicationSearchView(APIView):
    permission_classes = [AllowAny]
    """
    Handles retrieval of publications for a given author using Semantic Scholar.
    """

    def get(self, request):
        # Get the author ID from the query parameter
        author_id = request.GET.get('author_id', '')
        logger.info(f"Received publication search request for author ID: {author_id}")

        if not author_id:
            return Response({"error": "Author ID parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Semantic Scholar API query URL with expanded fields
        semantic_scholar_url = (
            f"https://api.semanticscholar.org/graph/v1/author/{author_id}/papers?"
            f"fields=url,title,year,authors,abstract,venue,citationCount,fieldsOfStudy"
        )
        logger.info(f"Making request to Semantic Scholar API: {semantic_scholar_url}")

        try:
            # Make the API request
            semantic_scholar_response = requests.get(semantic_scholar_url)
            logger.info(f"Semantic Scholar API response status code: {semantic_scholar_response.status_code}")
            semantic_scholar_response.raise_for_status()  # Raise error for HTTP issues
            
            # Parse JSON response
            data = semantic_scholar_response.json()
            
            # Transform the data into a structured response if needed
            publications = data.get("data", [])
            formatted_publications = []
            for pub in publications:
                formatted_publications.append({
                    "url": pub.get("url"),
                    "title": pub.get("title"),
                    "year": pub.get("year"),
                    "authors": [
                        {"name": author.get("name"), "id": author.get("authorId")}
                        for author in pub.get("authors", [])
                    ],
                    "abstract": pub.get("abstract"),
                    "venue": pub.get("venue"),
                    "citationCount": pub.get("citationCount"),
                    "fieldsOfStudy": pub.get("fieldsOfStudy"),
                })

            # Return the transformed response
            logger.info(f"Successfully fetched and formatted {len(formatted_publications)} publications.")
            return Response({"publications": formatted_publications}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error while calling Semantic Scholar API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class PaperDetailsView(APIView):
    permission_classes = [AllowAny]
    """
    Handles retrieval of paper details using Semantic Scholar.
    """
    # Integrate keywords here. 
    def get(self, request):
        # Get the paper ID from the query parameter
        paper_id = request.GET.get('paper_id', '')
        logger.info(f"Received paper details request for paper ID: {paper_id}")

        if not paper_id:
            return Response({"error": "Paper ID parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Semantic Scholar API query URL for a specific paper
        semantic_scholar_url = (
            f"https://api.semanticscholar.org/graph/v1/paper/{paper_id}?"
            f"fields=url,year,authors,abstract,fieldsOfStudy,venue"
        )
        logger.info(f"Making request to Semantic Scholar API: {semantic_scholar_url}")

        try:
            # Make the API request
            semantic_scholar_response = requests.get(semantic_scholar_url)
            logger.info(f"Semantic Scholar API response status code: {semantic_scholar_response.status_code}")
            semantic_scholar_response.raise_for_status()  # Raise error for HTTP issues
            
            # Parse JSON response
            paper_data = semantic_scholar_response.json()
            
            # Transform the data into a structured response
            formatted_paper = {
                "url": paper_data.get("url"),
                "year": paper_data.get("year"),
                "authors": [{"name": author.get("name")} for author in paper_data.get("authors", [])],
                "abstract": paper_data.get("abstract"),
                "fieldsOfStudy": paper_data.get("fieldsOfStudy"),
                "venue": paper_data.get("venue"),
            }

            # Return the transformed response
            logger.info(f"Successfully fetched paper details for paper ID {paper_id}.")
            return Response({"paper": formatted_paper}, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error while calling Semantic Scholar API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DBLPSearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search_query = request.GET.get('query', '').strip()
        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        search_service = DblpAuthorSearchService(search_query)
        authors = search_service.search_authors()

        if not authors:
            return Response({"error": "No authors found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"authors": authors}, status=status.HTTP_200_OK)

'''
class ResearcherProfileView(APIView):
    permission_classes = [AllowAny]

    # Instantiate keyword extractor once for efficiency
    extractor = KeywordExtractor()

    def get(self, request):
        pid = request.GET.get('pid', '').strip()

        if not pid:
            logger.warning("No PID provided in request")
            return Response({"error": "pid parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Fetching profile for PID: {pid}")

        try:
            fetcher = ProfileFetcher(pid, self.extractor)
            profile_data = fetcher.fetch_profile()

            return Response(profile_data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching data from DBLP for PID {pid}: {e}")
            return Response({"error": "Failed to fetch data from DBLP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except ValueError as e:
            logger.error(f"Invalid PID or no data found for PID {pid}: {e}")
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.exception(f"Unexpected error occurred for PID {pid}: {e}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        # --- Remove the last word from affiliation (if more than one word) ---
        words = affiliation.split()
        if len(words) > 1:
            affiliation_excl_last = " ".join(words[:-1]).rstrip(",")
        else:
            affiliation_excl_last = affiliation.rstrip(",")

        logger.info(f"Name: {name}, Affiliation minus last word: {affiliation_excl_last}")

        # --- Query the GitHub Search API for the first matching user ---
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

        # --- If no user found, return early ---
        if not items:
            logger.warning(f"No GitHub user found for name: {name}")
            return Response({"github_url": "No GitHub user found"}, status=status.HTTP_200_OK)

        # --- Take the first user as the match ---
        user_info = items[0]
        user_details_api = user_info.get("url")
        if not user_details_api:
            logger.warning("No user details URL found in search result.")
            return Response({"github_url": "No GitHub repository found"}, status=status.HTTP_200_OK)

        # --- Fetch the user’s detailed info from GitHub ---
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

        # --- Check the matching condition ---
        condition_location = (location_first_word and location_first_word in affiliation_excl_last)
        condition_company = (company == affiliation_excl_last)

        if condition_location or condition_company:
            github_url = user_details.get("html_url", "No GitHub repository found")
        else:
            github_url = "No GitHub repository found"

        return Response({"github_url": github_url}, status=status.HTTP_200_OK)
    



            logger.error(f"Error querying DBLP API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
        '''
class ResearcherProfileView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        pid = request.GET.get('pid', '').strip()
        pid = urllib.parse.unquote(pid)
        logger.info(f"Received author details request with pid: {pid}")

        if not pid:
            return Response({"error": "pid parameter is required."}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            dblp_url = f'https://dblp.org/pid/{pid}.xml'
            logger.info(f"Querying DBLP API: {dblp_url}")
            dblp_response = requests.get(dblp_url)
            dblp_response.raise_for_status()

            if not dblp_response.text.strip():
                logger.error(f"DBLP returned an empty response for PID: {pid}")
                return Response({"error": "DBLP returned an empty response. PID may not exist."},
                                status=status.HTTP_404_NOT_FOUND)

            root = ET.fromstring(dblp_response.text)

            name = root.get("name", "Unknown Researcher")
            affiliations = [note.text for note in root.findall(".//note[@type='affiliation']")]

            # Fetch or create the Author doc
            author_doc = Author.objects(pid=pid).first()
            if not author_doc:
                author_doc = Author(pid=pid)
            author_doc.name = name
            author_doc.affiliations = affiliations

            # We'll build up these details to return and/or store
            pub_list = []                # Will hold embedded Publication objects
            venue_counts = {}            # Count occurrences of each venue
            coauthors_dict = defaultdict(int)  # coauthor -> count
            coauthor_pids = {}                 # coauthor_name -> pid
            topic_counts = Counter()
            venues_list = []

            # Parse publications
            for pub in root.findall(".//r"):
                publ_info = pub.find("./*")
                if publ_info is not None:
                    title = publ_info.findtext("title", "").strip()
                    year_str = publ_info.findtext("year", "0")
                    try:
                        year = int(year_str)
                    except ValueError:
                        year = 0

                    # Determine publication type
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
                        venue = "Unknown Venue"

                    # Count venue occurrences
                    venues_list.append(venue)
                    venue_counts[venue] = venue_counts.get(venue, 0) + 1

                    # Extract authors (for coauthor info)
                    paper_authors = []
                    for author_node in publ_info.findall("author"):
                        author_name = author_node.text
                        author_pid = author_node.get("pid", "")
                        paper_authors.append({"name": author_name, "pid": author_pid})

                        # Track coauthor count, excluding the main researcher
                        if author_name != name:
                            coauthors_dict[author_name] += 1
                            coauthor_pids[author_name] = author_pid

                    # Extract links
                    links = [ee.text for ee in publ_info.findall("ee")]

                    # Stub for topic extraction
                    abstract = "Some abstract here bla bla bla bla "
                    # raw_topics = extractor.extract_keywords(doc=abstract)
                    # topics = [topic[0] for topic in raw_topics]
                    topics = ["bla", "bla"]  # Make it a list so Counter can work properly
                    topic_counts.update(topics)

                    # Create an EmbeddedDocument for each publication
                    publication = Publication(
                        title=title,
                        year=year,
                        paper_type=paper_type,
                        venue=venue,
                        citations=0,       # placeholder
                        topics=topics,     # list of topics
                        links=links
                    )
                    pub_list.append(publication)

            # Now store the publication list in our Author doc
            author_doc.publications = pub_list
            author_doc.save()

            # Fuzzy match for venue ranks (assuming you have fuzzy_match & core_data defined)
            venue_ranks = {
                venue: fuzzy_match(core_data, venue, 'name', 'abbreviation') 
                for venue in venues_list
            }

            # Convert venue counts to required format
            venue_list = [
                {
                    venue: {
                        "count": count, 
                        "core_rank": venue_ranks.get(venue, "Unknown")
                    }
                }
                for venue, count in sorted(venue_counts.items(), key=lambda x: x[1], reverse=True)
            ]

            # Build topics list from the Counter
            topics_list = [{topic: count} for topic, count in topic_counts.most_common()]

            # Convert coauthors dictionary to list with coauthored publication count
            coauthors_list = sorted(
                [
                    {
                        "name": coauth_name, 
                        "pid": coauthor_pids.get(coauth_name, ""), 
                        "publications_together": count
                    }
                    for coauth_name, count in coauthors_dict.items()
                ],
                key=lambda x: x["publications_together"], 
                reverse=True
            )

            # Prepare final data to return
            # If you want to return the publication list in raw JSON, you can do something like:
            publications_json = [
                {
                    "title": p.title,
                    "year": p.year,
                    "type": p.paper_type,
                    "venue": p.venue,
                    "citations": p.citations,
                    "topics": p.topics,
                    "links": p.links
                }
                for p in pub_list
            ]

            return Response({
                "name": name,
                "affiliations": affiliations,
                "h-index": 3,  # Placeholder
                "g-index": 2,  # Placeholder
                "total_papers": len(pub_list),
                "total_citations": 1000,  # Placeholder
                "venues": venue_list,
                "topics": topics_list,
                "papers": publications_json,
                "coauthors": coauthors_list,
            }, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error querying DBLP API: {e}")
            return Response({"error": str(e)}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except ET.ParseError as e:
            logger.error(f"Error parsing DBLP XML: {e}")
            return Response({"error": "Failed to parse DBLP XML."}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

        # --- Remove last word from affiliation ---
        words = affiliation.split()
        affiliation_excl_last = " ".join(words[:-1]).rstrip(",") if len(words) > 1 else affiliation.rstrip(",")

        logger.info(f"Name: {name}, Affiliation minus last word: {affiliation_excl_last}")

        # --- Search for GitHub User ---
        query = name.replace(" ", "+")
        search_api_url = f"https://api.github.com/search/users?q={query}"

        try:
            search_response = requests.get(search_api_url)
            search_response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling GitHub Search API: {e}")
            return Response({"error": "Error calling GitHub Search API"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        search_data = search_response.json()
        items = search_data.get("items", [])

        if not items:
            logger.warning(f"No GitHub user found for name: {name}")
            return Response({"github_url": "No GitHub user found", "repositories": []}, status=status.HTTP_200_OK)

        # --- First matched user ---
        user_info = items[0]
        github_username = user_info.get("login")
        github_profile_url = user_info.get("html_url", "No GitHub profile found")

        # --- Fetch user details ---
        user_details_api = user_info.get("url")
        if not user_details_api:
            logger.warning("No user details URL found in search result.")
            return Response({"github_url": "No GitHub profile found", "repositories": []}, status=status.HTTP_200_OK)

        try:
            user_details_resp = requests.get(user_details_api)
            user_details_resp.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching user details: {e}")
            return Response({"error": "Error fetching user details from GitHub"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user_details = user_details_resp.json()
        company = user_details.get("company", "") or ""
        location = user_details.get("location", "") or ""

        location_words = location.strip().split()
        location_first_word = location_words[0].strip(string.punctuation) if location_words else ""

        logger.debug(f"[GitHubProfileView] company={company}, location={location}")

        # --- Check if user matches affiliation ---
        condition_location = (location_first_word and location_first_word in affiliation_excl_last)
        condition_company = (company == affiliation_excl_last)

        if not (condition_location or condition_company):
            return Response({"github_url": "No GitHub profile found", "repositories": []}, status=status.HTTP_200_OK)

        # --- Fetch Repositories ---
        repositories = self.get_github_repositories(github_username)

        return Response({"github_url": github_profile_url, "repositories": repositories}, status=status.HTTP_200_OK)

    def get_github_repositories(self, username):
        """ Fetch all repositories for a given GitHub username. """
        url = f"https://api.github.com/users/{username}/repos"
        response = requests.get(url)

        if response.status_code == 200:
            repos = response.json()
            return [
                {
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "html_url": repo["html_url"],
                    "description": repo["description"]
                }
                for repo in repos
            ]
        else:
            logger.error(f"Failed to fetch repositories for {username}: {response.status_code}")
            return []


class HuggingFaceProfileView(APIView):
    permission_classes = [AllowAny]

    @staticmethod
    def get_huggingface_resources(username):
        """
        Fetch models and datasets associated with a Hugging Face username.
        """
        models_url = f"https://huggingface.co/api/models?author={username}"
        datasets_url = f"https://huggingface.co/api/datasets?author={username}"

        models_response = requests.get(models_url)
        datasets_response = requests.get(datasets_url)

        # Handle non-200 responses for models
        if models_response.status_code != 200:
            logger.warning(
                f"Failed to fetch models for user {username}. "
                f"Status code: {models_response.status_code}"
            )
            models = []
        else:
            models = models_response.json() if models_response.content else []

        # Handle non-200 responses for datasets
        if datasets_response.status_code != 200:
            logger.warning(
                f"Failed to fetch datasets for user {username}. "
                f"Status code: {datasets_response.status_code}"
            )
            datasets = []
        else:
            datasets = datasets_response.json() if datasets_response.content else []

        model_links = [
            f"https://huggingface.co/{model['id']}"
            for model in models
            if "id" in model
        ]
        dataset_links = [
            f"https://huggingface.co/datasets/{dataset['id']}"
            for dataset in datasets
            if "id" in dataset
        ]

        return model_links, dataset_links

    @staticmethod
    def generate_possible_usernames(first_name, last_name):
        """
        Generate possible Hugging Face usernames based on common patterns.
        """
        first_name = first_name.lower()
        last_name = last_name.lower()

        return [
            f"{first_name}{last_name}",
            f"{first_name}_{last_name}",
            f"{first_name}.{last_name}",
            f"{first_name}-{last_name}",
            f"{first_name}{last_name[0]}",   # First name + first letter of last name
            f"{first_name[0]}{last_name}",   # First letter of first name + last name
            f"{first_name}{last_name[:3]}",  # First name + first 3 letters of last name
            f"{last_name}{first_name}",      # Reverse order
            f"{first_name[0]}{last_name[0]}" # Initials
        ]

    @staticmethod
    def find_valid_username(first_name, last_name):
        """
        Check Hugging Face API for valid usernames from generated possibilities.
        Returns the first valid username found, or None if none match.
        """
        possibilities = HuggingFaceProfileView.generate_possible_usernames(first_name, last_name)
        for username in possibilities:
            # Query the user's models to check existence
            response = requests.get(f"https://huggingface.co/api/models?author={username}")
            # If the request is OK and the JSON array is non-empty, we consider that username valid
            if response.status_code == 200 and response.json():
                return username
        return None

    def get(self, request):
        # Grab the entire name from the query parameter
        full_name = request.GET.get("name", "").strip()
        if not full_name:
            return Response(
                {"error": "The 'name' parameter is required (e.g. 'Heiko Paulheim')."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Split name into first and last; require at least two words
        parts = full_name.split()
        if len(parts) < 2:
            return Response(
                {"error": "Please provide at least first and last name (e.g. 'Heiko Paulheim')."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        first_name, last_name = parts[0], parts[-1]

        # --- Attempt to find a valid Hugging Face username ---
        logger.info(f"Searching Hugging Face for user: {first_name} {last_name}")
        username = self.__class__.find_valid_username(first_name, last_name)

        if not username:
            logger.warning(f"No Hugging Face user found for {full_name}")
            return Response(
                {"huggingface_url": "No Hugging Face profile found", "models": [], "datasets": []},
                status=status.HTTP_200_OK
            )

        # --- If found, fetch models and datasets ---
        model_links, dataset_links = self.__class__.get_huggingface_resources(username)
        huggingface_profile_url = f"https://huggingface.co/{username}"

        return Response(
            {
                "huggingface_url": huggingface_profile_url,
                "models": model_links,
                "datasets": dataset_links
            },
            status=status.HTTP_200_OK
        )