from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Book, Author, Genre, User


@registry.register_document
class UserDocument(Document):
    """
    Elasticsearch document for User.
    """

    borrowed_books = fields.ObjectField(
        properties={
            "isbn": fields.TextField(),
            "title": fields.TextField(),
            "description": fields.TextField(),
        }
    )

    class Index:
        name = "users"

        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 0,
        }

    class Django:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "phone_number",
        ]

    def get_id(self, instance):
        return instance


@registry.register_document
class BookDocument(Document):
    """
    Elasticsearch document for Book.
    """

    authors = fields.ObjectField(
        properties={
            "name": fields.TextField(analyzer="standard"),
            "bio": fields.TextField(),
        }
    )

    genre = fields.ObjectField(
        properties={
            "name": fields.TextField(analyzer="standard"),
        }
    )

    class Index:
        name = "books"

        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 0,
        }

    class Django:
        model = Book
        fields = ["title", "description", "isbn"]

    def prepare(self, instance):
        data = super().prepare(instance)
        data["authors"] = self.prepare_authors(instance)
        data["genre"] = self.prepare_genre(instance)
        return data

    def prepare_authors(self, instance):
        return [
            {"name": author.name, "bio": author.bio}
            for author in instance.authors.all()
        ]

    def prepare_genre(self, instance):
        return (
            {
                "name": instance.genre.name,
            }
            if instance.genre
            else None
        )

    def get_id(self, instance):
        return instance.isbn
