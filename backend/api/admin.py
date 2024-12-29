from django.contrib import admin
from .models import Researcher, Award, Publication, Repository

admin.site.register(Researcher)
admin.site.register(Award)
admin.site.register(Publication)
admin.site.register(Repository)
