from django.urls import path
from . import views

urlpatterns = [
    path("find_book/", views.find_book, name="find_book"),
    path("sign_in/", views.sign_in, name="sign_in"),
    path("sign_up/", views.sign_up, name="sign_up"),
    path("get_user_books/", views.get_user_books, name="get_user_books"),
]
