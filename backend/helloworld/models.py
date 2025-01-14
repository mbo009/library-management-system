from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
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


class UserManager(BaseUserManager):
    def create_user(self, email, phone_number, first_name, last_name, password, is_librarian=False):
        if not all([email, phone_number, first_name, last_name, password]):
            raise ValueError("Required fields are missing")
        user = self.model(
            email=self.normalize_email(email), phone_number=phone_number, first_name=first_name, last_name=last_name, is_librarian=is_librarian
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone_number, first_name, last_name, password):
        user = self.create_user(email, phone_number, first_name, last_name, password, is_librarian=True)
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    user_id = models.AutoField(primary_key=True, db_column="id")
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    phone_number = models.CharField(max_length=255, blank=True, null=True)
    borrowed_books = models.ManyToManyField(
        Book, through="BorrowedBook", related_name="borrowers"
    )
    queued_books = models.ManyToManyField(
        Book, through="BookQueue", related_name="queued_users", blank=True
    )
    is_librarian = models.BooleanField(default=False, db_column="is_librarian")

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name", "phone_number"]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

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

    @property
    def queued_books(self):
        return Book.objects.filter(bookqueue__user=self)

class LibrarianKeys(models.Model):
    librarian_key = models.CharField(max_length=32, primary_key=True)
    used = models.BooleanField(default=False)
    librarian_id = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True
    )

    def __str__(self):
        return self.librarian_key


class BorrowedBook(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrowed_date = models.DateField(default=date.today)
    returned_date = models.DateField(blank=True, null=True)

    def is_returned(self):
        return self.returned_date is not None

    def __str__(self):
        status = "Returned" if self.is_returned() else "Borrowed"
        return f"{self.book.title} ({status}) by {self.user.first_name} {self.user.last_name}"


class BookQueue(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    queue_date = models.DateField(default=date.today)

    def __str__(self):
        return f"{self.book.title} by {self.user.first_name} {self.user.last_name}"