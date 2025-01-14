from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    userID = models.AutoField(primary_key=True, db_column="userid")
    full_name = models.CharField(max_length=255, unique=False)
    email = models.EmailField(max_length=255, unique=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]


    def __str__(self):
        return self.full_name

    class Meta:
        db_table = "users"

class Author(models.Model):
    authorID = models.AutoField(primary_key=True, db_column="authorid")
    full_name = models.CharField(max_length=255, unique=False)


class Genre(models.Model):
    genreID = models.AutoField(primary_key=True, db_column="genreid")
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "genres"


class Language(models.Model):
    languageID = models.AutoField(primary_key=True, db_column="languageid")
    name = models.CharField(max_length=100, unique=True)
    shortcut = models.CharField(max_length=10, unique=True)

    class Meta:
        db_table = "languages"


class Book(models.Model):
    FORMATS = [
    ('H', 'Hardcover'),
    ('P', 'Paperback'),
    ('e', 'e-book')
    ]

    bookID = models.AutoField(primary_key=True, db_column="bookid")
    isbn = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255, unique=False)
    author = models.ForeignKey(Author, on_delete=models.SET_NULL, null=True, blank=True)
    published_date = models.DateField()
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True)
    language = models.ForeignKey(Language, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    page_count = models.IntegerField()
    format = models.CharField(max_length=50, choices=FORMATS)
    cover_image = models.CharField(max_length=255)

    class Meta:
        db_table = "books"


class Borrowing(models.Model):
    borrowingID = models.AutoField(primary_key=True, db_column="borrowingid")
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Who borrowed the book
    book = models.ForeignKey(Book, on_delete=models.CASCADE)  # Which book was borrowed
    borrow_date = models.DateField(auto_now_add=True)  # When the book was borrowed
    due_date = models.DateField()  # When the book is due to be returned
    return_date = models.DateField(null=True, blank=True)  # When the book was returned (if returned)
    fine = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)  # Fine for late returns (if applicable)

    class Meta:
        db_table = "borrowing"


class Reservation(models.Model):
    reservationID = models.AutoField(primary_key=True, db_column="reservationid")
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Who reserved the book
    book = models.ForeignKey(Book, on_delete=models.CASCADE)  # Which book was reserved
    reservation_date = models.DateTimeField(auto_now_add=True)  # When the reservation was made
    status = models.CharField(max_length=50, choices=[
        ('Pending', 'Pending'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ], default='Pending')  # Status of the reservation

    class Meta:
        db_table = "reservations"


class Inventory(models.Model):
    inventoryID = models.AutoField(primary_key=True, db_column="inventoryid")
    book = models.ForeignKey(Book, on_delete=models.CASCADE)  # Linked book
    total_copies = models.IntegerField(default=0)  # Total number of copies in the library
    available_copies = models.IntegerField(default=0)  # Number of copies currently available

    class Meta:
        db_table = "inventory"
