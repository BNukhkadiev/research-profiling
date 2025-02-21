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
<<<<<<< HEAD:backend/api/views.py
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
=======
import xml.etree.ElementTree as ET
from utils.LLM import get_researcher_description
from utils.keybert import KeywordExtractor
from utils.abstracts import get_abstract_from_openalex
from utils.CORE import fuzzy_match
import string
import difflib
import urllib.parse
from collections import Counter, defaultdict
import pandas as pd
>>>>>>> origin/bagas_branch:django-backend-app/api/views.py


extractor = KeywordExtractor()
core_data =  pd.read_csv('data/CORE.csv', names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"])
core_data = core_data [['name', 'abbreviation', 'rank']]
            
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


<<<<<<< HEAD:backend/api/views.py
class DBLPPublicationSearchView(APIView):
=======
#########
class PublicationSearchView(APIView):
>>>>>>> origin/bagas_branch:django-backend-app/api/views.py
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

<<<<<<< HEAD:backend/api/views.py
        
        return Response(
            {"message": "User created successfully."},
            status=status.HTTP_201_CREATED,
        )
=======

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


class ResearcherThumbnailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        search_query = request.GET.get('query', '')
        logger.info(f"Received author search request with query: {search_query}")

        if not search_query:
            return Response({"error": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try: 
            dblp_url = f"https://dblp.org/search/author/api?q={search_query}&format=json"
            logger.info(f"Querying DBLP API: {dblp_url}")
            dblp_response = requests.get(dblp_url)
            dblp_response.raise_for_status()
            dblp_data = dblp_response.json()

            # Return the transformed response
            logger.info(f"Successfully fetched and formatted {len(formatted_publications)} publications.")
            return Response({"publications": formatted_publications}, status=status.HTTP_200_OK)

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
            # Query DBLP API for author search
            dblp_url = f"https://dblp.org/search/author/api?q={urllib.parse.quote(search_query)}&format=json"
            logger.info(f"Querying DBLP API: {dblp_url}")
            dblp_response = requests.get(dblp_url)
            dblp_response.raise_for_status()
            dblp_data = dblp_response.json()

            # Check if any authors were found
            if not dblp_data.get("result", {}).get("hits", {}).get("hit"):
                logger.warning("No authors found in DBLP.")
                return Response({"error": "No authors found."}, status=status.HTTP_404_NOT_FOUND)

            authors_list = []
            dblp_authors = dblp_data["result"]["hits"]["hit"]

            # Process each matched author
            for dblp_author in dblp_authors:
                author_info = dblp_author.get("info", {})
                author_name = author_info.get("author")
                author_url = author_info.get("url")

                if not author_url:
                    continue  # Skip authors with missing DBLP profile links

                # Extract PID correctly (after "pid/")
                author_pid = author_url.split("/pid/")[-1]  # Extract PID part

                # Fetch detailed DBLP XML using author PID
                author_pid_url = f"{author_url}.xml"
                logger.info(f"Fetching DBLP XML from {author_pid_url}")
                author_profile_response = requests.get(author_pid_url)
                author_profile_response.raise_for_status()
                root = ET.fromstring(author_profile_response.text)

                # Extract affiliations
                affiliations = [note.text for note in root.findall(".//note[@type='affiliation']")]

                # Extract publications
                publications = []
                for pub in root.findall(".//r"):
                    publ_info = pub.find("./*")  # Finds first child element (e.g., article or inproceedings)
                    if publ_info is not None:
                        title = publ_info.findtext("title", "").strip()
                        venue = publ_info.findtext("booktitle") or publ_info.findtext("journal", "Unknown Venue")
                        if title:
                            publications.append((title, venue))

                # Generate LLM-based abstract
                titles = [title for title, _ in publications]
                abstract = get_researcher_description(name=author_name, paper_titles=titles[:5])

                # Append author data to list
                authors_list.append({
                    "name": author_name,
                    "pid": author_pid,  # Now correctly extracted
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
            dblp_response = requests.get(dblp_url)
            dblp_response.raise_for_status()

            if not dblp_response.text.strip():
                logger.error(f"DBLP returned an empty response for PID: {pid}")
                return Response({"error": "DBLP returned an empty response. PID may not exist."},
                                status=status.HTTP_404_NOT_FOUND)

            root = ET.fromstring(dblp_response.text)

            name = root.get("name", "Unknown Researcher")
            affiliations = [note.text for note in root.findall(".//note[@type='affiliation']")]

            publications = []
            venue_counts = {}  # Count occurrences of each venue
            coauthors_dict = defaultdict(int)  # Store coauthor names with count of coauthored papers
            coauthor_pids = {}  # Store PID of coauthors
            topic_counts = Counter()
            venues_list = []

            for pub in root.findall(".//r"):
                publ_info = pub.find("./*")
                if publ_info is not None:
                    title = publ_info.findtext("title", "").strip()
                    year = int(publ_info.findtext("year", "0") or 0)

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

                    # Count venue occurrences
                    venues_list.append(venue)
                    venue_counts[venue] = venue_counts.get(venue, 0) + 1

                    # Extract authors
                    paper_authors = []
                    for author in publ_info.findall("author"):
                        author_name = author.text
                        author_pid = author.get("pid", "")
                        paper_authors.append({"name": author_name, "pid": author_pid})

                        # Track coauthor count, excluding the main researcher
                        if author_name != name:
                            coauthors_dict[author_name] += 1
                            coauthor_pids[author_name] = author_pid

                    # Extract links
                    links = [ee.text for ee in publ_info.findall("ee")]

                    # Extract topics using KeywordExtractor
                    abstract = "Some abstract here bla bla bla bla "
                    raw_topics = extractor.extract_keywords(doc=abstract)
                    topics = [topic[0] for topic in raw_topics]

                    topic_counts.update(topics)

                    publications.append({
                        "title": title,
                        "year": year,
                        "type": paper_type,
                        "venue": venue,
                        "citations": 0,  # Placeholder
                        "topics": topics,
                        "authors": paper_authors,
                        "links": links
                    })

            venue_ranks = {venue: fuzzy_match(core_data, venue, 'name', 'abbreviation') for venue in venues_list}

            # Convert venue counts to required format
            venue_list = [{venue: {"count": count, "core_rank": venue_ranks.get(venue, "Unknown")}} 
                          for venue, count in sorted(venue_counts.items(), key=lambda x: x[1], reverse=True)]
            topics_list = [{topic: count} for topic, count in topic_counts.most_common()]

            # Convert coauthors dictionary to list with coauthored publication count
            coauthors_list = sorted(
                [{"name": name, "pid": coauthor_pids.get(name, ""), "publications_together": count}
                for name, count in coauthors_dict.items()],
                key=lambda x: x["publications_together"], reverse=True
            )

            

            return Response({
                "name": name,
                "affiliations": affiliations,
                "h-index": 3,  # Placeholder
                "g-index": 2,  # Placeholder
                "total_papers": len(publications),
                "total_citations": 1000,  # Placeholder
                "venues": venue_list,
                "topics": topics_list,
                "papers": publications,
                "coauthors": coauthors_list,
            }, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            logger.error(f"Error querying DBLP API: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
>>>>>>> origin/bagas_branch:django-backend-app/api/views.py
