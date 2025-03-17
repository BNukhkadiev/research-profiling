from django.urls import path, re_path
from .views import  CompareResearchersView, PublicationSearchView, PaperDetailsView
from .views import SearchView, ResearcherProfileView, OpenAlexView


urlpatterns = [
    path('sem-scholar-publication-search/', PublicationSearchView.as_view(), name='sem-scholar-publication-search'),
    path('paper-details/', PaperDetailsView.as_view(), name='paper-details'),
    path('search/', SearchView.as_view(), name='dblp-search'),
    path('researcher-profile/', ResearcherProfileView.as_view(), name='researcher-profile'),
    path('compare-researchers/', CompareResearchersView.as_view(), name='compare-researchers'),  #  ADD THIS!
    path('open-alex/', OpenAlexView.as_view(), name='open-alex'), 
    path('generate-topics/', OpenAlexView.as_view(), name='generate-topics'), 
]


    
