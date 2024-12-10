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

# Set up logging
logger = logging.getLogger(__name__)
@method_decorator(csrf_exempt, name='dispatch')
class SemanticScholarSearchView(APIView):
    permission_classes = [AllowAny]
    """
    Handles search for authors on Semantic Scholar.
    """
    def get(self, request):
        # Get the search term from the query parameter
        search_query = request.GET.get('query', '')
        logger.info(f"Received author search request with query: {search_query}")

        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Query the Semantic Scholar API for authors
        semantic_scholar_url = (
            f"https://api.semanticscholar.org/graph/v1/author/search?"
            f"query={search_query}&fields=name,url"
        )
        logger.info(f"Making request to Semantic Scholar API: {semantic_scholar_url}")

        try:
            semantic_scholar_response = requests.get(semantic_scholar_url)
            logger.info(f"Semantic Scholar API response status code: {semantic_scholar_response.status_code}")
            semantic_scholar_response.raise_for_status()  # Raise error for HTTP issues
            data = semantic_scholar_response.json()  # Parse JSON response
            logger.info(f"Semantic Scholar API response data: {data}")
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error while calling Semantic Scholar API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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

        # Query the Semantic Scholar API for publications by author ID
        semantic_scholar_url = (
            f"https://api.semanticscholar.org/graph/v1/author/{author_id}/papers?"
            f"fields=url,title,year,authors"
        )
        logger.info(f"Making request to Semantic Scholar API: {semantic_scholar_url}")

        try:
            semantic_scholar_response = requests.get(semantic_scholar_url)
            logger.info(f"Semantic Scholar API response status code: {semantic_scholar_response.status_code}")
            semantic_scholar_response.raise_for_status()  # Raise error for HTTP issues
            data = semantic_scholar_response.json()  # Parse JSON response
            logger.info(f"Semantic Scholar API response data: {data}")
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error while calling Semantic Scholar API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AuthorDetailsView(APIView):
    permission_classes = [AllowAny]
    """
    Handles fetching author details from Semantic Scholar.
    """

    def get(self, request):
        # Get the author ID from the query parameter
        author_id = request.GET.get("author_id", "")
        logger.info(f"Received request to fetch details for author ID: {author_id}")

        if not author_id:
            return Response(
                {"error": "Author ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Query the Semantic Scholar API for the author's details
        semantic_scholar_url = (
            f"https://api.semanticscholar.org/graph/v1/author/{author_id}?"
            f"fields=name,url,affiliations,paperCount,hIndex,citationCount"
        )
        logger.info(f"Querying Semantic Scholar API: {semantic_scholar_url}")

        try:
            semantic_scholar_response = requests.get(semantic_scholar_url)
            semantic_scholar_response.raise_for_status()
            author_data = semantic_scholar_response.json()

            # Return the author data
            logger.info(f"Author data fetched successfully: {author_data}")
            return Response(author_data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error querying Semantic Scholar API: {e}")
            return Response(
                {"error": "Failed to fetch author details."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )