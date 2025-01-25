from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import (
    Book,
    Author,
    BookQueue,
    User,
    Language,
    Genre,
    LibrarianKeys,
    InventoryManager,
)
from django.db.models import Max
from django.db import transaction
from django.core.files.storage import default_storage
import os
from api.utils.media import get_cover_path
import logging
import ast
from django.conf import settings

logger = logging.getLogger(__name__)


class LibrarianKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = LibrarianKeys
        fields = "__all__"


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = "__all__"


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = "__all__"


class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = "__all__"


class BookSerializer(serializers.ModelSerializer):
    authors = AuthorSerializer(many=True)
    genre_name = serializers.CharField(source="genre.name", read_only=True)
    language_name = serializers.CharField(source="language.name", read_only=True)
    language_shortcut = serializers.CharField(
        source="language.shortcut", read_only=True
    )
    cover_url = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = "__all__"

    def get_cover_url(self, obj):
        if obj.cover_path:
            return f"{settings.MEDIA_URL}{obj.cover_path.lstrip('/')}"
        return None


class CreateUpdateBookSerializer(serializers.ModelSerializer):
    authors = serializers.CharField()
    cover = serializers.ImageField(required=False)
    total_copies = serializers.IntegerField(required=False)

    class Meta:
        model = Book
        exclude = ["created_at", "updated_at"]

    def validate_authors(self, value):
        try:
            authors_data = ast.literal_eval(value)
            if not isinstance(authors_data, list):
                raise serializers.ValidationError("Authors must be a list.")
            if not all(isinstance(author, int) for author in authors_data):
                raise serializers.ValidationError("All author IDs must be integers.")
            return authors_data
        except (ValueError, SyntaxError):
            raise serializers.ValidationError("Invalid list format for authors.")

    def create(self, validated_data):
        logger.info(f"Data: {validated_data}")
        authors_data = validated_data.pop("authors")
        cover = validated_data.pop("cover", None)
        total_copies = validated_data.pop("total_copies", None)

        with transaction.atomic():
            book = Book.objects.create(**validated_data)
            if total_copies:
                InventoryManager().create_inventory(book, total_copies)
            logger.info(f"authors: {authors_data}")
            authors = Author.objects.filter(id__in=authors_data)
            book.authors.set(authors)

            if cover:
                saved_path = default_storage.save(get_cover_path(book.bookID), cover)
                cover_file_name = os.path.basename(saved_path)
                book.cover_path = cover_file_name
                book.save()

        return book

    def update(self, instance, validated_data):
        logger.info(f"Data: {validated_data}")
        authors_data = validated_data.pop("authors", None)
        cover = validated_data.pop("cover", None)
        total_copies = validated_data.pop("total_copies", None)

        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            if authors_data is not None:
                authors = Author.objects.filter(id__in=authors_data)
                instance.authors.set(authors)
            if total_copies is not None:
                InventoryManager().update_total_copies(instance, total_copies)

            if cover:
                if instance.cover_path:
                    cover_path = os.path.join(settings.MEDIA_ROOT, instance.cover_path)
                    if os.path.exists(cover_path):
                        os.remove(cover_path)

                saved_path = default_storage.save(
                    get_cover_path(instance.bookID), cover
                )
                cover_file_name = os.path.basename(saved_path)
                instance.cover_path = cover_file_name
            instance.save()

        return instance


def get_max_turn_for_book(book_id):
    result = BookQueue.objects.filter(book_id=book_id).aggregate(max_turn=Max("turn"))
    return result["max_turn"] if result["max_turn"] is not None else 0


class CreateBookQueueSerializer(serializers.ModelSerializer):
    book_id = serializers.IntegerField(write_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = BookQueue
        fields = ["book_queue_id", "user_id", "book_id", "queue_date", "turn"]
        read_only_fields = ["book_queue_id", "queue_date", "turn"]

    def create(self, validated_data):
        book_id = validated_data.pop("book_id")
        user_id = validated_data.pop("user_id")

        book = Book.objects.get(pk=book_id)
        user = User.objects.get(pk=user_id)

        turn = get_max_turn_for_book(book_id) + 1
        return BookQueue.objects.create(
            user=user, book=book, turn=turn, **validated_data
        )


class BookQueueSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)

    class Meta:
        model = BookQueue
        fields = [
            "book_queue_id",
            "user_id",
            "book_id",
            "queue_date",
            "turn",
            "first_name",
            "last_name",
            "email",
            "phone_number",
        ]
        extra_kwargs = {"book_queue_id": {"read_only": True}}


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ["languageID", "name", "shortcut"]
        extra_kwargs = {"languageID": {"read_only": True}}


class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["genreID", "name"]
        extra_kwargs = {"genreID": {"read_only": True}}
