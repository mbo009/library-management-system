from django.urls import path, include
from . import views

urlpatterns = [
    path('hello_world/', views.hello_world_endpoint, name='hello_world'),
    path('produce/', views.produce_message, name='produce_message'),
    path('consume/', views.consume_message, name='consume_message')
]

