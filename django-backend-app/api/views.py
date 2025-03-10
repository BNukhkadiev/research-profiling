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
from utils.keybert import KeywordExtractor
import string
from .services.profile_fetcher import ProfileFetcher
from .services.dblp_author_search import DblpAuthorSearchService





# core_data =  pd.read_csv('data/CORE.csv', names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"])
# core_data = core_data[['name', 'abbreviation', 'rank']]
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
    


