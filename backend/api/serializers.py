from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import Book, Author, BookQueue, User, Language, Genre
from django.db.models import Max


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
        exclude = ['created_at', 'updated_at', 'reserved_copies', 'borrowed_copies']
    
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



class UserSerializer(serializers.ModelSerializer):
    borrowed_books = BookSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = "__all__"


def get_max_turn_for_book(book_id):
    result = BookQueue.objects.filter(book_id=book_id).aggregate(max_turn=Max('turn'))
    return result['max_turn'] if result['max_turn'] is not None else 0

class CreateBookQueueSerializer(serializers.ModelSerializer):
    book_id = serializers.IntegerField(write_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = BookQueue
        fields = ['book_queue_id', 'user_id', 'book_id', 'queue_date', 'turn']
        read_only_fields = ['book_queue_id', 'queue_date', 'turn']

    def create(self, validated_data):
        book_id = validated_data.pop('book_id')
        user_id = validated_data.pop('user_id')

        book = Book.objects.get(pk=book_id)
        user = User.objects.get(pk=user_id)
        
        turn = get_max_turn_for_book(book_id) + 1
        return BookQueue.objects.create(user=user, book=book, turn=turn, **validated_data)


class BookQueueSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    phone_number = serializers.CharField(source='user.phone_number', read_only=True)

    class Meta:
        model = BookQueue
        fields = ['book_queue_id', 'user_id', 'book_id', 'queue_date', 'turn', 'first_name', 'last_name', 'email', 'phone_number']
        extra_kwargs = {'book_queue_id': {'read_only': True}}

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['languageID', 'name', 'shortcut']
        extra_kwargs = {'languageID': {'read_only': True}}


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['genreID', 'name']
        extra_kwargs = {'genreID': {'read_only': True}}