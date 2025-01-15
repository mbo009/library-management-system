from rest_framework import serializers
from .models import Book, Author, BookQueue, User


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True)
    
    class Meta:
        model = Book
        fields = "__all__"


class BookQueueSerializer(serializers.ModelSerializer): 
    class Meta:
        model = BookQueue
        fields = "__all__"