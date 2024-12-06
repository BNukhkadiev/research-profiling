from django.urls import path
from .views import DBLPSearchView, DBLPPublicationSearchView

urlpatterns = [
    path('dblp-search/', DBLPSearchView.as_view(), name='dblp-search'),
    path('dblp-publication-search/', DBLPPublicationSearchView.as_view(), name='dblp-publication-search'),
]
