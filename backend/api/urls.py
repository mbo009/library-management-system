from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register(r'genres', views.GenreViewSet)
# router.register(r'languages', views.LanguageViewSet)


urlpatterns = [
    path("find_book/", views.find_book, name="find_book"),
    path("find_user/", views.find_user, name="find_user"),
    path("sign_in/", views.sign_in, name="sign_in"),
    path("sign_up/", views.sign_up, name="sign_up"),
    path("get_user_books/", views.get_user_books, name="get_user_books"),
    path("books", views.BookListView.as_view(), name="book_list"),
    path("authors", views.AuthorListView.as_view(), name="author_list"),
    path("book/<int:pk>", views.BookDetailView.as_view(), name="book_detail"),
    path("author/<int:pk>", views.AuthorDetailView.as_view(), name="author_detail"),
    path("create-author/", views.CreateAuthorView.as_view(), name="create_author"),
    path("reserve-book/", views.ReserveBook.as_view(), name="reserve_book"),
    path("create_book/", views.BookCreateView.as_view(), name="create_book"),
    path("update_book/<int:pk>/", views.BookUpdateView.as_view(), name="update_book"),
    path("create_author/", views.AuthorCreateView.as_view(), name="create_author"),
    path(
        "update_author/<int:pk>/",
        views.AuthorUpdateView.as_view(),
        name="update_author",
    ),
    path(
        "genres/",
        views.GenreViewSet.as_view({"get": "list", "post": "create"}),
        name="genre-list",
    ),
    path(
        "genres/<int:pk>/",
        views.GenreViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="genre-detail",
    ),
    path(
        "languages/",
        views.LanguageViewSet.as_view({"get": "list", "post": "create"}),
        name="language-list",
    ),
    path(
        "languages/<int:pk>/",
        views.LanguageViewSet.as_view(
            {"get": "retrieve", "put": "update", "delete": "destroy"}
        ),
        name="language-detail",
    ),
    path("book_queue/<int:book_id>/", views.BookQueueView.as_view(), name="book-queue"),
    path("upload_cover/", views.upload_cover, name="upload_cover"),
    path('reserve-book/<int:book_id>/', views.ReserveBook.as_view(), name='check-reservation'),
]
