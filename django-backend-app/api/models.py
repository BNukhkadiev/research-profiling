from django.contrib.auth.models import AbstractUser
from django.db import models

# mongo_models/models.py
from mongoengine import (
    Document, StringField, ListField, DateTimeField,
    ReferenceField, EmbeddedDocument, EmbeddedDocumentField,
    EmbeddedDocumentListField, IntField, URLField
)
import datetime

class Publication(EmbeddedDocument):
    title = StringField(required=True)
    year = IntField(default=0)
    paper_type = StringField()  # e.g., "Conference Paper", "Journal Article"
    venue = StringField()
    citations = IntField(default=0)
    topics = ListField(StringField())
    links = ListField(URLField())
    
    # Example of storing authors (besides the main author):
    coauthors = ListField(StringField())  # or embed references if you want

class Author(Document):
    pid = StringField(required=True, unique=True)
    name = StringField(required=True)
    dblp_url = URLField()
    affiliations = ListField(StringField())
    abstract = StringField()
    
    # Array of embedded Publication documents
    publications = EmbeddedDocumentListField(Publication)
    
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'authors'  # Name of the MongoDB collection
    }

    def save(self, *args, **kwargs):
        """Override save to update `updated_at`."""
        self.updated_at = datetime.datetime.utcnow()
        return super(Author, self).save(*args, **kwargs)
