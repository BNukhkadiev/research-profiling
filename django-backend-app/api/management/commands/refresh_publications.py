from django.core.management.base import BaseCommand
from api.models import Author
from api.services.profile_fetcher import ProfileFetcher
from utils.keybert import KeywordExtractor

class Command(BaseCommand):
    help = "Refreshes researcher publication data from DBLP."

    def handle(self, *args, **options):
        extractor = KeywordExtractor()
        authors = Author.objects.all()
        
        for author in authors:
            self.stdout.write(f"Refreshing publications for {author.name} (PID: {author.pid})")
            
            try:
                fetcher = ProfileFetcher(author.pid, extractor)
                # This call now always fetches fresh data and merges with existing publications.
                new_data = fetcher.fetch_profile()
                self.stdout.write(f"Successfully updated publications for {author.name}")
            except Exception as e:
                self.stdout.write(f"Error updating {author.name}: {e}")
