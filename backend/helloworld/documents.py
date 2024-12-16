from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Book


@registry.register_document
class BookDocument(Document):
    # Możesz dodać dynamiczne pola lub relacje (np. autorzy)
    authors = fields.ObjectField(
        properties={
            'name': fields.TextField(),
            'bio': fields.TextField(),
        }
    )

    class Index:
        # Nazwa indeksu w Elasticsearch
        name = 'books'

        # Ustawienia indeksu
        settings = {
            "number_of_shards": 1,  # Liczba shardów (przy małych danych 1 wystarczy)
            "number_of_replicas": 0  # Liczba replik (w środowisku testowym 0)
        }

    class Django:
        # Powiązanie z modelem Django
        model = Book

        # Pola, które będą indeksowane
        fields = [
            'id',  # Klucz główny
            'title',  # Tytuł książki
            'description',  # Opis książki
            'isbn',  # Numer ISBN
            'published_date',  # Data wydania
            'page_count',  # Liczba stron
        ]

        # Pola relacyjne, które chcesz uwzględnić w wyszukiwaniu
        related_models = ['Author']

    def prepare_authors(self, instance):
        """
        Przygotowanie danych dla pola 'authors' - relacja do modelu Author.
        """
        return [
            {"name": author.name, "bio": author.bio}
            for author in instance.authors.all()
        ]
