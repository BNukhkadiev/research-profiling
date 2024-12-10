from django.urls import path
from .views import AuthorDetailsView, SemanticScholarSearchView, PublicationSearchView

urlpatterns = [
    path('sem-scholar-search/', SemanticScholarSearchView.as_view(), name='sem-scholar-search'),
    path('sem-scholar-publication-search/', PublicationSearchView.as_view(), name='sem-scholar-publication-search'),
    path('author-details/', AuthorDetailsView.as_view(), name='author-details'),
]
