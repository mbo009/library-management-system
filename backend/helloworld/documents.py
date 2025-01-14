from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Book, Author


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
            "genre",
        ]

        related_models = [Author]

    def prepare_authors(self, instance):
        return [
            {"name": author.name, "bio": author.bio}
            for author in instance.authors.all()
        ]

    def get_id(self, instance):
        return instance.isbn
