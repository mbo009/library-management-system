import random
from datetime import date
from faker import Faker
from api.models import Author, Genre, Language, Book

# Inicjalizacja obiektu Faker do generowania danych
fake = Faker()


# Funkcja do tworzenia przykładowych danych dla autorów
def create_authors(n=100):
    authors = []
    for _ in range(n):
        author = Author.objects.create(
            name=fake.name(), bio=fake.text(max_nb_chars=200)
        )
        authors.append(author)
    return authors


# Funkcja do tworzenia przykładowych danych dla gatunków
def create_genres():
    genres = [
        "Fiction",
        "Non-Fiction",
        "Fantasy",
        "Science Fiction",
        "Romance",
        "Thriller",
        "Horror",
        "Mystery",
        "Biography",
        "Self-Help",
        "History",
    ]
    genre_objects = []
    for genre in genres:
        genre_object = Genre.objects.filter(name=genre).first()
        if not genre_object:
            genre_object = Genre.objects.create(name=genre)
        genre_objects.append(genre_object)
    return genre_objects


# Funkcja do tworzenia przykładowych danych dla języków
def create_languages():
    languages = [
        # ("English", "EN"),
        ("Polish", "PL"),
        ("Spanish", "ES"),
        ("French", "FR"),
        ("German", "DE"),
        ("Italian", "IT"),
    ]
    language_objects = []
    for name, shortcut in languages:
        language_object = Language.objects.filter(shortcut=shortcut).first()
        if not language_object:
            language_object = Language.objects.create(name=name, shortcut=shortcut)
        language_objects.append(language_object)
    return language_objects


# Funkcja do tworzenia przykładowych danych dla książek
def create_books(authors, genres, languages, n=100):
    for _ in range(n):
        title = fake.sentence(nb_words=4)
        isbn = fake.isbn13()[:13]
        published_date = fake.date_this_century()
        page_count = random.randint(100, 600)
        description = fake.text(max_nb_chars=10)

        book = Book.objects.create(
            title=title,
            description=description,
            isbn=isbn,
            published_date=published_date,
            page_count=page_count,
            genre=random.choice(genres),
            language=random.choice(languages),
        )

        # Przypisz losowych autorów do książki
        book.authors.set(
            random.sample(authors, random.randint(1, 3))
        )  # książka ma od 1 do 3 autorów
        book.save()


languages = create_languages()
genres = create_genres()
authors = create_authors()
create_books(authors, genres, languages)
