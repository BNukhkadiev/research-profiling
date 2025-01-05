from django.urls import path
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