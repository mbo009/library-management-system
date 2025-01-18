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
    path('author/<int:pk>', views.AuthorDetailView.as_view(), name='author_detail'),
    path('create-author/', views.CreateAuthorView.as_view(), name='create_author'),
    path('reserve-book/', views.ReserveBook.as_view(), name='reserve_book'),
    path('languages', views.LanguageListView.as_view(), name='language_list'),
    path('genres', views.GenreListView.as_view(), name='genre_list'),
    path('create_book/', views.BookCreateView.as_view(), name='create_book'),
    path('update_book/<int:pk>/', views.BookUpdateView.as_view(), name='update_book'),
    path('create_author/', views.AuthorCreateView.as_view(), name='create_author'),
    path('update_author/<int:pk>/', views.AuthorUpdateView.as_view(), name='update_author'),
]
