from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Book, Author, Genre


@registry.register_document
class BookDocument(Document):
    """
    Elasticsearch document for Book.
    """

    authors = fields.ObjectField(
        properties={
            "id": fields.IntegerField(),
            "name": fields.TextField(),
            "bio": fields.TextField(),
        }
    )

    genre = fields.ObjectField(
        properties={
            "name": fields.TextField(),
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
        fields = [
            "title",
            "description",
            "isbn",
        ]

    def prepare_authors(self, instance):
        return [
            {"id": author.id, "name": author.name, "bio": author.bio}
            for author in instance.authors.all()
        ]

    def prepare_genre(self, instance):
        return {
            "name": instance.genre.name,
        } if instance.genre else None

    def get_id(self, instance):
        return instance.isbn