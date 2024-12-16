from django.contrib import admin
from .models import Book, User, Author, BorrowedBook

# Register your models here.
admin.site.register(Book)
admin.site.register(User)
admin.site.register(Author)
admin.site.register(BorrowedBook)
