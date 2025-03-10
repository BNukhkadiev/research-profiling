from django.urls import path
from .views import PublicationSearchView, PaperDetailsView, DBLPSearchView, ResearcherProfileView

urlpatterns = [
    path('sem-scholar-publication-search/', PublicationSearchView.as_view(), name='sem-scholar-publication-search'),
    path('paper-details/', PaperDetailsView.as_view(), name='paper-details'),
    path('paper-details/', PaperDetailsView.as_view(), name='paper-details'),
    path('dblp-search/', DBLPSearchView.as_view(), name='dblp-search'),
    path('researcher-profile/', ResearcherProfileView.as_view(), name='researcher-profile')
]
