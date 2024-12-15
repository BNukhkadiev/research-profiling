from django.urls import path
from .views import DBLPSearchView, DBLPPublicationSearchView, LoginView
from django.urls import path, include

urlpatterns = [
    path('dblp-search/', DBLPSearchView.as_view(), name='dblp-search'),
    path('dblp-publication-search/', DBLPPublicationSearchView.as_view(), name='dblp-publication-search'),
    path('login/', LoginView.as_view(), name="login"),
]