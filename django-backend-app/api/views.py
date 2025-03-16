import logging
from urllib.parse import unquote
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
from .services.author_search import AuthorSearchService
from .services.openalex_service import OpenAlexFetcher
import asyncio
from api.models import Author  # Ensure this matches your models import path
import time 

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


class SearchView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        start_time = time.time()
        search_query = request.GET.get('query', '').strip()
        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        search_service = AuthorSearchService(search_query)
        authors = search_service.search_single_author()
        end_time = time.time()
        print("Time taken to process:", end_time - start_time)
        if not authors:
            return Response({"error": "No authors found."}, status=status.HTTP_404_NOT_FOUND)

        return Response({"authors": authors}, status=status.HTTP_200_OK)



class ResearcherProfileView(APIView):
    permission_classes = [AllowAny]

    # Instantiate keyword extractor once for efficiency
    extractor = KeywordExtractor()

    def get(self, request):
        author_name = request.GET.get('author_name', '').strip()

        if not author_name:
            logger.warning("No NAME provided in request")
            return Response({"error": "NAME parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Fetching profile for PID: {author_name}")

        try:
            fetcher = ProfileFetcher(author_name, self.extractor)
            profile_data = fetcher.fetch_profile()

            return Response(profile_data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching data from DBLP for NAME {author_name}: {e}")
            return Response({"error": "Failed to fetch data from DBLP."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        except ValueError as e:
            logger.error(f"Invalid NAME or no data found for NAME {author_name}: {e}")
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.exception(f"Unexpected error occurred for NAME {author_name}: {e}")
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
            author = Author.objects(pid=pid).first()
            if not author:
                logger.warning(f"Author with PID {pid} not found in MongoDB.")
                return Response({"error": "Author not found."}, status=status.HTTP_404_NOT_FOUND)

            # Collect all DOIs from publications
            all_dois = []
            for pub in author.publications:
                all_dois.extend(OpenAlexFetcher.extract_dois(pub.links))
            unique_dois = list(set(all_dois))

            if not unique_dois:
                logger.info(f"No DOIs found for author {pid}")
                return Response({"message": "No DOIs found to update."}, status=status.HTTP_200_OK)

            # Fetch OpenAlex data for all DOIs
            openalex_data = asyncio.run(OpenAlexFetcher.fetch_openalex_data(unique_dois))
            
            # Rebuild the publications list with updated data
            updated_publications = []
            for pub in author.publications:
                # pub_dois = OpenAlexFetcher.extract_dois(pub.links)
                pub_dois = pub.links
                main_doi = pub_dois[0] if pub_dois else None
                if main_doi and main_doi in openalex_data:
                    data = openalex_data[main_doi]
                    pub.citations = data.get("cited_by_count", 0)
                    pub.abstract = data.get("abstract", "")

                updated_publications.append(pub)  # Add updated publication to list

            # Reassign and save
            author.publications = updated_publications
            author.save()  # This will persist changes now

            logger.info(f"Citations and abstracts updated for PID: {pid}")

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
    

comparison_list = set()
class CompareResearchersView(APIView):
    permission_classes = [AllowAny]
    """
    Manages the list of researchers in comparison.
    """

    def get(self, request):
        """
        Get the list of researchers currently in the comparison list.
        """
        return Response({"comparison_list": list(comparison_list)}, status=status.HTTP_200_OK)

    def post(self, request):
        """
        Add a researcher to the comparison list.
        If the researcher is not found in MongoDB, fetch it from DBLP and store it.
        """
        pid = request.data.get("pid", "").strip()
        if not pid:
            return Response({"error": "pid parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # If already in the list, return success
        if pid in comparison_list:
            return Response({"message": "Researcher already in comparison list."}, status=status.HTTP_200_OK)

        # Check if researcher exists in MongoDB
        author = Author.objects(pid=pid).first()
        if not author:
            try:
                logger.info(f"Fetching new researcher data for {pid}")
                fetcher = ProfileFetcher(pid, extractor=KeywordExtractor())
                profile_data = fetcher.fetch_profile()

                # Store new author in MongoDB
                new_author = Author(
                    pid=profile_data["pid"],
                    name=profile_data["name"],
                    affiliations=profile_data["affiliations"],
                    dblp_url=profile_data.get("dblp_url", ""),
                    description=profile_data.get("description", ""),
                    publications=[
                        {
                            "title": pub["title"],
                            "year": pub["year"],
                            "paper_type": pub["type"],
                            "venue": pub["venue"],
                            "citations": pub["citations"],
                            "topics": pub["topics"],
                            "links": pub["links"],
                            "coauthors": [a["name"] for a in pub["authors"] if a["name"] != profile_data["name"]]
                        } for pub in profile_data.get("papers", [])
                    ]
                )
                new_author.save()

                # Add to comparison list
                comparison_list.add(pid)

                return Response({"message": "Researcher added to comparison list.", "profile": profile_data}, status=status.HTTP_201_CREATED)
            except Exception as e:
                logger.error(f"Failed to fetch researcher {pid}: {e}")
                return Response({"error": "Failed to fetch researcher data"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Add researcher to comparison list if already exists in MongoDB
        comparison_list.add(pid)
        return Response({"message": "Researcher added to comparison list."}, status=status.HTTP_200_OK)

    def delete(self, request):
        """
        Remove a researcher from the comparison list.
        """
        pid = request.data.get("pid", "").strip()
        if not pid:
            return Response({"error": "pid parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        if pid in comparison_list:
            comparison_list.remove(pid)
            return Response({"message": f"Removed researcher {pid} from comparison list."}, status=status.HTTP_200_OK)

        return Response({"error": "Researcher not found in comparison list."}, status=status.HTTP_404_NOT_FOUND)
