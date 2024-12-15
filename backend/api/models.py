from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db import models

# Researcher Model
class Researcher(models.Model):
    name = models.CharField(max_length=255)
    photo = models.CharField(max_length=255, blank=True, null=True)
    position = models.CharField(max_length=255, blank=True, null=True)
    papers = models.IntegerField(default=0)
    h_index = models.IntegerField(default=0)
    citations = models.IntegerField(default=0)

    def __str__(self):
        return self.name

# Award Model
class Award(models.Model):
    researcher = models.ForeignKey(
        Researcher, on_delete=models.CASCADE, related_name="awards"
    )
    award_name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.award_name} - {self.researcher.name}"

# Publication Model
class Publication(models.Model):
    researcher = models.ForeignKey(
        Researcher, on_delete=models.CASCADE, related_name="publications"
    )
    title = models.CharField(max_length=255)
    date = models.DateField(blank=True, null=True)
    venue = models.CharField(max_length=255, blank=True, null=True)
    core_ranking = models.CharField(max_length=10, blank=True, null=True)
    topic = models.CharField(max_length=255, blank=True, null=True)
    citations = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.title} ({self.date})"

# Repository Model
class Repository(models.Model):
    researcher = models.ForeignKey(
        Researcher, on_delete=models.CASCADE, related_name="repositories"
    )
    name = models.CharField(max_length=255)
    stars = models.IntegerField(default=0)
    url = models.URLField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.name} (⭐ {self.stars})"
