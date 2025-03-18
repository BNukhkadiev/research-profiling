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
from .services.ollama_processor import OllamaTextProcessor
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
    def get(self, request):
        author_name = request.GET.get('author_name', '').strip()

        if not author_name:
            logger.warning("No NAME provided in request")
            return Response({"error": "NAME parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Fetching profile for PID: {author_name}")

        try:
            fetcher = ProfileFetcher(author_name)
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



class OpenAlexView(APIView):
    """
    API endpoint to fetch abstracts and citation counts from OpenAlex for given DOIs
    and save them into corresponding MongoDB Publication entries.
    """
    permission_classes = [AllowAny]
    def post(self, request):
        dois = request.data.get("dois", [])
        if not dois or not isinstance(dois, list):
            return Response({"error": "A list of DOIs must be provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Filter DOIs that actually need fetching (missing abstracts)
        dois_to_fetch = []
        for doi in dois:
            found = False
            authors = Author.objects(publications__links__contains=doi)
            for author in authors:
                for publication in author.publications:
                    if doi in publication.links and publication.abstract:
                        found = True
                        break  # Found abstract, skip
                if found:
                    break
            if not found:
                dois_to_fetch.append(doi)

        if not dois_to_fetch:
            return Response({"message": "All DOIs already have abstracts. No update needed."}, status=status.HTTP_200_OK)

        # Fetch from OpenAlex for those without abstract
        fetched_data = asyncio.run(OpenAlexFetcher.fetch_openalex_data(dois_to_fetch))

        updated_count = 0

        # Update publications in MongoDB
        for doi, data in fetched_data.items():
            if not data:
                continue

            authors = Author.objects(publications__links__contains=doi)
            for author in authors:
                updated = False
                for publication in author.publications:
                    if doi in publication.links:
                        # Update citations
                        if data.get("cited_by_count") is not None:
                            publication.citations = data["cited_by_count"]
                        # Update abstract only if empty
                        if not publication.abstract and data.get("abstract") is not None:
                            if isinstance(data["abstract"], str):  # Ensure it's a string
                                publication.abstract = data["abstract"]
                        updated = True
                if updated:
                    author.save()
                    updated_count += 1

        return Response({
            "message": f"Successfully updated {updated_count} authors' publications.",
            "details": fetched_data
        }, status=status.HTTP_200_OK)
    

class GenerateTopicsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        dois = request.data.get("dois", [])
        if not dois or not isinstance(dois, list):
            return Response({"error": "A list of DOIs must be provided."}, status=status.HTTP_400_BAD_REQUEST)

        processor = OllamaTextProcessor(batch_size=3, max_tokens=130, temperature=0.6)  # Create processor instance
        updated_count = 0
        updated_publications = []
        existing_publications = []  # Store publications that already have topics

        # Collect papers for batch processing
        papers_to_process = []

        for doi in dois:
            authors = Author.objects(publications__links__contains=doi)
            for author in authors:
                for publication in author.publications:
                    if doi in publication.links:
                        # If topics already exist, return existing ones instead of extracting again
                        if publication.topics:
                            existing_publications.append({
                                "doi": doi,
                                "title": publication.title,
                                "abstract": publication.abstract,
                                "topics": publication.topics
                            })
                            continue  # Skip topic extraction for this paper

                        # Concatenate title and abstract for topic extraction
                        text_to_analyze = f"{publication.title} {publication.abstract}".strip()
                        if not text_to_analyze:
                            continue  # Skip if both title and abstract are empty

                        papers_to_process.append({
                            "id": doi,  # Using DOI as a unique identifier
                            "title": publication.title,
                            "abstract": publication.abstract
                        })

        # Generate topics in batch if there are new papers to process
        if papers_to_process:
            topics_dict = processor.generate_topics(papers_to_process)

            # Update publications with extracted topics
            for doi, topics in topics_dict.items():
                for author in Author.objects(publications__links__contains=doi):
                    for publication in author.publications:
                        if doi in publication.links and not publication.topics:
                            publication.topics = topics
                            author.save()
                            updated_count += 1
                            updated_publications.append({
                                "doi": doi,
                                "title": publication.title,
                                "abstract": publication.abstract,
                                "topics": publication.topics
                            })

        return Response({
            "message": f"Successfully updated topics for {updated_count} publications.",
            "updated_publications": updated_publications,
            "existing_publications": existing_publications
        }, status=status.HTTP_200_OK)


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
            # Check if author exists (case-insensitive)
            author = Author.objects(name__iexact=name).first()

            if author and author.publications:
                # Add to comparison list and return existing data
                comparison_list.add(author.name)  # Use exact name from DB
                return Response({"message": "Researcher added to comparison list."}, status=status.HTTP_200_OK)

            # If author doesn't exist OR has no publications -> fetch
            logger.info(f"Fetching researcher data for {name}")
            fetcher = ProfileFetcher(author_name=name)
            profile_data = fetcher.fetch_profile()

            # Check if author now exists in DB (race condition handling)
            author = Author.objects(name__iexact=name).first()
            if author:
                # Case: Exists but no publications, update
                if not author.publications:
                    logger.info(f"Updating existing author '{name}' with fetched publications.")
                    author.affiliations = profile_data["affiliations"]
                    author.publications = fetcher._build_publications_for_db(profile_data["publications"])
                    author.save()
            else:
                # Case: Fully new author, save
                logger.info(f"Saving new author '{name}' to MongoDB.")
                new_author = Author(
                    name=profile_data["name"],
                    affiliations=profile_data["affiliations"],
                    description=profile_data.get("description", ""),
                    publications=fetcher._build_publications_for_db(profile_data["publications"])
                )
                new_author.save()

            # Add to comparison list
            comparison_list.add(profile_data["name"])  # Use properly cased name

            return Response({"message": "Researcher added to comparison list.", "profile": profile_data}, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Failed to fetch and save researcher '{name}': {e}")
            return Response({"error": "Failed to fetch and save researcher data."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete(self, request):
        """
        Remove a researcher from the comparison list.
        Accepts name as a query parameter: ?name=Researcher%20Name
        """
        name = request.query_params.get("name", "").strip()  # ✅ Get from query params (fixing frontend issue)

        if not name:
            return Response({"error": "name parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ Optionally use cache (uncomment if using Django cache)
        # comparison_list = cache.get('comparison_list', set())
        global comparison_list  # Using global for now, you can replace this with cache as needed

        # Case 1: Researcher is in comparison list, remove
        if name in comparison_list:
            comparison_list.remove(name)
            # cache.set('comparison_list', comparison_list)  # Uncomment if using cache
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