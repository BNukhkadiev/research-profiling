from django.db import models
from mongoengine import (
    Document, StringField, ListField, DateTimeField,
    EmbeddedDocument, EmbeddedDocumentListField, IntField, URLField
)
import datetime


class CoAuthor(EmbeddedDocument):
    name = StringField(required=True)
    pid = StringField()  # PID can be optional, but you can make it required if needed

class Publication(EmbeddedDocument):
    """
    Embedded document representing a research publication.
    """
    title = StringField(required=True)
    year = IntField(default=0)
    paper_type = StringField()  # e.g., "Conference Paper", "Journal Article"
    venue = StringField()
    core_rank = StringField(default="Unknown")  # New field for CORE rank
    citations = IntField(default=0)
    topics = ListField(StringField())
    links = ListField(URLField())
    abstract = StringField()
    
    # List of coauthors (names only)
    coauthors = EmbeddedDocumentListField(CoAuthor)  # ✅ Use CoAuthor embedded documents


class Author(Document):
    """
    MongoDB document representing an author with their research publications.
    """
    pid = StringField(required=True, unique=True)
    name = StringField(required=True)
    dblp_url = URLField()
    affiliations = ListField(StringField())
    abstract = StringField()

    # List of publications (Embedded)
    publications = EmbeddedDocumentListField(Publication)

    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'authors',  # Name of the MongoDB collection
        'indexes': ['pid'],  # Indexing for faster retrieval
    }

    def save(self, *args, **kwargs):
        """Override save to update `updated_at` before saving."""
        self.updated_at = datetime.datetime.utcnow()
        return super(Author, self).save(*args, **kwargs)
