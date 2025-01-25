from django.db import models, transaction
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from datetime import date
from api.utils.generate_key import generate_key
from django.core.exceptions import ObjectDoesNotExist


class Author(models.Model):
    name = models.CharField(max_length=255, unique=True)
    bio = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


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
    bookID = models.AutoField(primary_key=True, db_column="bookid")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    isbn = models.CharField(max_length=13, unique=True)
    published_date = models.DateField(blank=True, null=True)
    cover_path = models.CharField(max_length=255, blank=True, null=True, default="null")
    page_count = models.PositiveIntegerField(blank=True, null=True)
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True)
    language = models.ForeignKey(
        Language, on_delete=models.SET_NULL, null=True, blank=True
    )
    authors = models.ManyToManyField(Author, related_name="books")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def available_copies(self):
        return Inventory.objects.get(book=self).available_copies

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        with transaction.atomic():
            super().save(*args, **kwargs)
            if is_new:
                Inventory.objects.create_inventory(book=self, total_copies=0)


class UserManager(BaseUserManager):
    def create_user(
        self, email, phone_number, first_name, last_name, password, is_librarian=False
    ):
        if not all([email, phone_number, first_name, last_name, password]):
            raise ValueError("Required fields are missing")
        user = self.model(
            email=self.normalize_email(email),
            phone_number=phone_number,
            first_name=first_name,
            last_name=last_name,
            is_librarian=is_librarian,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, phone_number, first_name, last_name, password):
        user = self.create_user(
            email, phone_number, first_name, last_name, password, is_librarian=True
        )
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
    librarian_key = models.CharField(
        max_length=32, primary_key=True, default=generate_key, editable=False
    )
    librarian_id = models.ForeignKey(
        User, on_delete=models.CASCADE, blank=True, null=True
    )

    def __str__(self):
        return self.librarian_key


class BorrowedBook(models.Model):
    borrowed_id = models.AutoField(primary_key=True, db_column="borrowedid")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrowed_date = models.DateField(default=date.today)
    expected_return_date = models.DateField()
    returned_date = models.DateField(blank=True, null=True)

    status = models.CharField(
        max_length=50,
        choices=[
            ("Reserved", "Resevered"),
            ("Picked up", "Picked up"),
            ("Returned", "Returned"),
            ("Cancelled", "Cancelled"),
        ],
        default="Reserved",
    )


    def is_returned(self):
        return self.returned_date is not None

    def __str__(self):
        status = "Returned" if self.is_returned() else "Borrowed"
        return f"{self.book.title} ({status}) by {self.user.first_name} {self.user.last_name}"


class BookQueue(models.Model):
    book_queue_id = models.AutoField(primary_key=True, db_column="book_queueid")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    queue_date = models.DateField(default=date.today)
    turn = models.IntegerField()

    def __str__(self):
        return f"{self.book.title} by {self.user.first_name} {self.user.last_name}"


class InventoryManager(models.Manager):
    def create_inventory(self, book, total_copies):
        inventory = self.create(
            book=book, total_copies=total_copies, available_copies=total_copies
        )
        return inventory

    def update_total_copies(self, book, total_copies):
        try:
            if total_copies < 0:
                raise ValueError("Total copies cannot be negative.")
            inventory = Inventory.objects.filter(book=book).first()
            used_copies = inventory.total_copies - inventory.available_copies
            if total_copies < used_copies:
                raise ValueError("Total copies cannot be less than available copies.")
            inventory.available_copies += total_copies - inventory.total_copies
            inventory.total_copies = total_copies

            inventory.save()
            return inventory
        except ObjectDoesNotExist:
            raise ValueError("Inventory for the specified book does not exist.")


class Inventory(models.Model):
    id = models.AutoField(primary_key=True, default=0)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    total_copies = models.IntegerField(default=0)
    available_copies = models.IntegerField(default=0)

    objects = InventoryManager()

    class Meta:
        db_table = "inventory"
