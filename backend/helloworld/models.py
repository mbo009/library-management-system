from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=255, unique=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Book(models.Model):
    title = models.CharField(max_length=255) 
    description = models.TextField(blank=True, null=True)
    isbn = models.CharField(max_length=13, unique=True)
    published_date = models.DateField(blank=True, null=True)
    page_count = models.PositiveIntegerField(blank=True, null=True)
    authors = models.ManyToManyField(Author, related_name='books')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
