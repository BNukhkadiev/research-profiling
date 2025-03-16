from django.db import models
from mongoengine import (
    Document, StringField, ListField, DateTimeField,
    EmbeddedDocument, EmbeddedDocumentListField, IntField, URLField
)
import datetime


class CoAuthor(EmbeddedDocument):
    name = StringField(required=True)


class Publication(EmbeddedDocument):
    """
    Embedded document representing enriched fields of a research publication.
    These fields are not directly available in XML and require additional processing.
    """
    title = StringField(required=True)  # Still useful to map/enrich correct paper
    topics = ListField(StringField())  # LLM-generated topics
    abstract = StringField()  # Retrieved/generated abstract
    core_rank = StringField(default="Unknown")  # CORE ranking if added
    citations = IntField(default=0)  # From external citation count sources
    coauthors = EmbeddedDocumentListField(CoAuthor)  # Names only


class Author(Document):
    """
    MongoDB document representing an author with LLM-generated description and enriched publications.
    """
    name = StringField(required=True, unique=True)  # Author name as unique identifier
    description = StringField()  # LLM-generated summary of author

    # Enriched publication data embedded directly under author
    publications = EmbeddedDocumentListField(Publication)

    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'authors',  # MongoDB collection name
        'indexes': ['name'],      # Indexed for fast lookups by name
    }

    def save(self, *args, **kwargs):
        """Override save to update `updated_at` before saving."""
        self.updated_at = datetime.datetime.utcnow()
        return super(Author, self).save(*args, **kwargs)
