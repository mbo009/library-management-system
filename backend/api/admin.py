from django.contrib import admin
from .models import Book, User, Author, BorrowedBook, BookQueue, LibrarianKeys

# Register your models here.
admin.site.register(Book)
admin.site.register(User)
admin.site.register(Author)
admin.site.register(BorrowedBook)
admin.site.register(BookQueue)
admin.site.register(LibrarianKeys)