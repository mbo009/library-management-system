from django.urls import path
from . import views

urlpatterns = [
    path('hello_world/', views.hello_world_endpoint, name='hello_world')
]