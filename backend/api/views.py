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
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import HTTP_404_NOT_FOUND
from .models import Researcher

class ResearcherAffiliationsAPIView(APIView):
    def get(self, request, researcher_id):
        try:
            researcher = Researcher.objects.get(id=researcher_id)
        except Researcher.DoesNotExist:
            return Response({"error": "Researcher not found"}, status=HTTP_404_NOT_FOUND)

        affiliations = researcher.affiliations.order_by("start_year")
        data = [
            {
                "institution": affiliation.institution,
                "start_year": affiliation.start_year,
                "end_year": affiliation.end_year,
                "position": affiliation.position,
            }
            for affiliation in affiliations
        ]
        return Response({"name": researcher.name, "affiliations": data})


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
        from django.contrib.auth import authenticate

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    """
    Class-Based View for User Login.
    Accepts email and password, authenticates the user,
    and returns an authentication token.
    """
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
