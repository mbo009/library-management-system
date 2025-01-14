from django.urls import path, include
from . import views

urlpatterns = [
    path('create-book/', views.CreateBookView.as_view(), name='create-book'),
    path('create-author/', views.CreateAuthorView.as_view(), name='create-author'),
    path('books/<int:book_id>/', views.DeleteBookView.as_view(), name='delete-book'),

]

