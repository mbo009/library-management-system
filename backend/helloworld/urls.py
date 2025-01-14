from django.urls import path
from . import views

urlpatterns = [
    path("find_book/", views.find_book, name="find_book"),
    path("sign_in/", views.sign_in, name="sign_in"),
    path("sign_up/", views.sign_up, name="sign_up"),
    path("get_user_books/", views.get_user_books, name="get_user_books"),
    path('books', views.BookListView.as_view(), name='book_list'),
    path('authors', views.AuthorListView.as_view(), name='author_list'),
    path('book/<int:pk>', views.BookDetailView.as_view(), name='book_detail'),
    path('author/<int:pk>', views.AuthorDetailView.as_view(), name='author_detail')
]
