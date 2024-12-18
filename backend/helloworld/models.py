from django.db import models
from datetime import date


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
    genre = models.CharField(max_length=255)
    authors = models.ManyToManyField(Author, related_name="books")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class User(models.Model):
    username = models.CharField(max_length=255, default="player")
    name = models.CharField(max_length=255)
    surname = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)
    borrowed_books = models.ManyToManyField(
        Book, through="BorrowedBook", related_name="borrowers"
    )

    def __str__(self):
        return f"{self.name} {self.surname}"

    @property
    def currently_borrowed_books(self):
        return Book.objects.filter(
            borrowedbook__user=self, borrowedbook__returned_date__isnull=True
        )

    @property
    def previously_borrowed_books(self):
        return Book.objects.filter(
            borrowedbook__user=self, borrowedbook__returned_date__isnull=False
        )


class BorrowedBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrowed_date = models.DateField(default=date.today)
    returned_date = models.DateField(blank=True, null=True)

    def is_returned(self):
        return self.returned_date is not None

    def __str__(self):
        status = "Returned" if self.is_returned() else "Borrowed"
        return f"{self.book.title} ({status}) by {self.user.name} {self.user.surname}"


# class Message(models.Model):
#     content = models.TextField()
#     timestamp = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.content
