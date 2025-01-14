from django.urls import path
from . import views

urlpatterns = [
    path("hello_world/", views.hello_world_endpoint, name="hello_world"),
    path("find_book/", views.find_book, name="find_book"),
    path("sign_in/", views.sign_in, name="sign_in"),
    path("sign_up/", views.sign_up, name="sign_up"),
]
