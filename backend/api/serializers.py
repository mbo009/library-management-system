from rest_framework import serializers
from .models import Book, Author, BookQueue, Language, Genre


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = "__all__"


class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True)
    genre_name = serializers.CharField(source='genre.name', read_only=True)
    language_name = serializers.CharField(source='language.name', read_only=True)
    language_shortcut = serializers.CharField(source='language.shortcut', read_only=True)
    
    class Meta:
        model = Book
        fields = "__all__"


class CreateUpdateBookSerializer(serializers.ModelSerializer):
    authors = serializers.PrimaryKeyRelatedField(many=True, queryset=Author.objects.all())

    class Meta:
        model = Book
        # Exclude auto-generated fields since they are handled automatically
        exclude = ['created_at', 'updated_at']
    
    def create(self, validated_data):
        authors_data = validated_data.pop('authors')
        book = Book.objects.create(**validated_data)
        book.authors.set(authors_data)  # Set the authors many-to-many relationship
        return book

    def update(self, instance, validated_data):
        authors_data = validated_data.pop('authors', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if authors_data is not None:
            instance.authors.set(authors_data)
        instance.save()
        return instance


class BookQueueSerializer(serializers.ModelSerializer): 
    class Meta:
        model = BookQueue
        fields = "__all__"


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = "__all__"


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = "__all__"