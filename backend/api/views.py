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
class DBLPSearchView(APIView):
    permission_classes = [AllowAny]
    """
    Handles search for authors on DBLP.
    """
    def get(self, request):
        # Get the search term from the query parameter
        search_query = request.GET.get('query', '')
        logger.info(f"Received author search request with query: {search_query}")

        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Query the DBLP API for authors
        dblp_url = f"https://dblp.org/search/author/api?q={search_query}&format=json"
        logger.info(f"Making request to DBLP API: {dblp_url}")

        try:
            dblp_response = requests.get(dblp_url)
            logger.info(f"DBLP API response status code: {dblp_response.status_code}")
            dblp_response.raise_for_status()  # Raise error for HTTP issues
            data = dblp_response.json()  # Parse JSON response
            logger.info(f"DBLP API response data: {data}")
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error while calling DBLP API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DBLPPublicationSearchView(APIView):
    permission_classes = [AllowAny]
    """
    Handles search for publications on DBLP.
    """
    def get(self, request):
        # Get the search term from the query parameter
        search_query = request.GET.get('query', '')
        logger.info(f"Received publication search request with query: {search_query}")

        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Query the DBLP API for publications
        dblp_url = f"https://dblp.org/search/publ/api?q={search_query}&format=json"
        logger.info(f"Making request to DBLP API: {dblp_url}")

        try:
            dblp_response = requests.get(dblp_url)
            logger.info(f"DBLP API response status code: {dblp_response.status_code}")
            dblp_response.raise_for_status()  # Raise error for HTTP issues
            data = dblp_response.json()  # Parse JSON response
            logger.info(f"DBLP API response data: {data}")
            return Response(data, status=status.HTTP_200_OK)
        except requests.exceptions.RequestException as e:
            logger.error(f"Error while calling DBLP API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

