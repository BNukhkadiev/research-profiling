from django.urls import path
<<<<<<< HEAD:backend/api/urls.py
from .views import DBLPSearchView, DBLPPublicationSearchView, LoginView
from django.urls import path, include
from .views import SignupView
from .views import ResearcherAffiliationsAPIView


urlpatterns = [
    path('dblp-search/', DBLPSearchView.as_view(), name='dblp-search'),
    path('dblp-publication-search/', DBLPPublicationSearchView.as_view(), name='dblp-publication-search'),
    path('login/', LoginView.as_view(), name="login"),
    path("signup/", SignupView.as_view(), name="signup"),
    path("researchers/<int:researcher_id>/affiliations/", ResearcherAffiliationsAPIView.as_view(), name="researcher_affiliations"),
]
=======
from .views import AuthorDetailsView, SemanticScholarSearchView, PublicationSearchView, PaperDetailsView, DBLPSearchView, ResearcherProfileView

urlpatterns = [
    path('sem-scholar-search/', SemanticScholarSearchView.as_view(), name='sem-scholar-search'),
    path('sem-scholar-publication-search/', PublicationSearchView.as_view(), name='sem-scholar-publication-search'),
    path('author-details/', AuthorDetailsView.as_view(), name='author-details'),
    path('paper-details/', PaperDetailsView.as_view(), name='paper-details'),
    path('paper-details/', PaperDetailsView.as_view(), name='paper-details'),
    path('dblp-search/', DBLPSearchView.as_view(), name='dblp-search'),
    path('researcher-profile/', ResearcherProfileView.as_view(), name='researcher-profile')
]
>>>>>>> origin/bagas_branch:django-backend-app/api/urls.py
