from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from elasticsearch_dsl.query import MultiMatch
from api.documents import BookDocument, UserDocument
from django.contrib.auth import authenticate, login
from api.serializers import (
    BookSerializer,
    AuthorSerializer,
    BookQueueSerializer,
    LanguageSerializer,
    GenreSerializer,
    UserSerializer,
)
from api.serializers import CreateUpdateBookSerializer, BorrowedBookSerializer
from .utils.kafka_producer import send_kafka_message
from django.db import transaction
from django.contrib.auth.hashers import make_password
from api.models import User, LibrarianKeys, Book, Author, Language, Genre, BookQueue, BorrowedBook
from rest_framework.generics import (
    ListAPIView,
    RetrieveAPIView,
    CreateAPIView,
    UpdateAPIView,
)
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.conf import settings
from django.db.models import Q
from datetime import timedelta, date
from .reservation_logic import verify_inventory, create_reservation, calculate_penalty
import json
import logging
import urllib.parse
from api.utils.media import get_cover_path
from django.core.files.storage import default_storage
import os


logger = logging.getLogger(__name__)


class BookListView(ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer


class AuthorListView(ListAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


class BookDetailView(RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer


class AuthorDetailView(RetrieveAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


class LanguageViewSet(viewsets.ModelViewSet):
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer


class BookQueueView(ListAPIView):
    serializer_class = BookQueueSerializer

    def get_queryset(self):
        book_id = self.kwargs["book_id"]  # Get the book_id from the URL
        return BookQueue.objects.filter(book_id=book_id)

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        if not queryset.exists():
            return Response(
                {"message": "No entries found for the given book ID."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return super().get(request, *args, **kwargs)


class BookCreateView(CreateAPIView):
    queryset = Book.objects.all()
    serializer_class = CreateUpdateBookSerializer


class BookUpdateView(UpdateAPIView):
    queryset = Book.objects.all()
    serializer_class = CreateUpdateBookSerializer


class AuthorCreateView(CreateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


class AuthorUpdateView(UpdateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer


class CreateBookView(APIView):
    def post(self, request, *args, **kwargs):
        # Deserialize the incoming data
        serializer = CreateUpdateBookSerializer(data=request.data)
        if serializer.is_valid():
            # Save the book
            book = serializer.save()

            # Send a Kafka event
            event_data = {
                "id": book.bookID,
                "title": book.title,
                "author": book.author.full_name if book.author else None,
                "genre": book.genre.name if book.genre else None,
                "language": book.language.name if book.language else None,
                "published_date": str(book.published_date),
            }
            send_kafka_message(
                topic=settings.KAFKA_CONFIG["topics"].get("book_created"),
                key=str(book.bookID),
                value=event_data,
            )

            # Return response
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteBookView(APIView):
    def delete(self, request, book_id, *args, **kwargs):
        try:
            book = Book.objects.get(pk=book_id)
            book.delete()

            event_data = {
                "id": book_id,
                "action": "deleted",
            }
            send_kafka_message(
                topic=settings.KAFKA_CONFIG["topics"].get("book_deleted"),
                key=str(book_id),
                value=event_data,
            )

            return Response(
                {"message": "Book deleted successfully."}, status=status.HTTP_200_OK
            )
        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found."}, status=status.HTTP_404_NOT_FOUND
            )


class CreateAuthorView(APIView):
    def post(self, request, *args, **kwargs):
        logger.info("Received request to create author: %s", request.data)

        serializer = AuthorSerializer(data=request.data)

        if serializer.is_valid():
            # Save the author
            author = serializer.save()

            # Send a Kafka event
            event_data = {"name": author.name, "bio": author.bio}
            send_kafka_message(
                topic=settings.KAFKA_CONFIG["topics"].get("author_created"),
                key=str(author.name),
                value=event_data,
            )

            logger.info("Author created successfully: %s", author.name)

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Log validation errors
        logger.error("Author creation failed, validation errors: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReserveBook(APIView):
    def post(self, request, *args, **kwargs):
        logger.info("ReserveBook POST request received")

        try:
            book_id = request.data["book_id"]
            user_id = request.user.user_id
            logger.info(f"Received data: book_id={book_id}, user_id={user_id}")
        except Exception as e:
            logger.error(f"Bad request: {e}")
            return Response(f"Bad request: {e}", status=status.HTTP_400_BAD_REQUEST)

        try:
            queued = BookQueue.objects.filter(book_id=book_id).order_by('queue_date')
            if queued.filter(user_id=user_id).exists():
                logger.info(f"User {user_id} is already in the queue for book_id={book_id}")
                return Response(
                    {"status": "reserved", "message": "User is already in the queue"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            logger.info(f"Queue for book_id={book_id} fetched: {len(queued)} entries")

            queue_date, turn, reservation_status = create_reservation(book_id, user_id, queued)


            return Response({"available_date": queue_date, "status": reservation_status,"turn": turn}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Reservation failed for book_id={book_id}, user_id={user_id}. Error: {e}")
            return Response(
                {"error": "Reservation could not be completed.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get(self, request, *args, **kwargs):
        logger.info("ReserveBook GET request received")
        try:
            book_id = kwargs.get("book_id")
            user_id = request.user.user_id
            logger.info(f"Extracted data: book_id={book_id}, user_id={user_id}")
        except Exception as e:
            logger.error(f"Failed to extract data from request: {e}")
            return Response(f"Bad request: {e}", status=status.HTTP_400_BAD_REQUEST)

        try:
            logger.info(f"Fetching reservation for book_id={book_id} and user_id={user_id}")
            reserved = BookQueue.objects.filter(book_id=book_id, user_id=user_id).first()

            if reserved is None:
                logger.info(f"No reservation found for book_id={book_id}, user_id={user_id}")
                return Response(
                    {"status": "not_reserved", "message": "No reservation found"},
                    status=status.HTTP_200_OK,
                )

            logger.info(f"Reservation found for user_id={user_id}: {reserved}")
            return Response(
                {
                    "status": reserved.status,
                    "available_date": reserved.queue_date,
                    "message": "User has a reservation"
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(f"Error fetching reservation data for book_id={book_id}, user_id={user_id}. Error: {e}")
            return Response(
                {"error": "Reservation data could not be fetched.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

@method_decorator(csrf_exempt, name='dispatch')
class BorrowBook(APIView):
    @csrf_exempt
    def post(self, request, *args, **kwargs):
        logger.info(f"Request user: {request.user}")

        logger.info("BorrowBook POST request received")
        logger.info(request.data)

        try:
            book_id = request.data["book_id"]
            user_id = request.data["user_id"]
            logger.info(f"Received data: book_id={book_id}, user_id={user_id}")
        except Exception as e:
            logger.error(f"Bad request: {e}")
            return Response(f"Bad request: {e}", status=status.HTTP_400_BAD_REQUEST)

        try:
            borrowed = BorrowedBook.objects.filter(book_id=book_id, user_id=user_id).first()
            if borrowed:
                logger.info(f"User {user_id} has already borrowed book_id={book_id}")
                return Response(
                    {"status": "borrowed", "message": "User has already borrowed the book"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            logger.info(f"User {user_id} has not borrowed book_id={book_id} yet")
            book = Book.objects.get(bookID=book_id)
            borrowed = BorrowedBook(
                user=User.objects.get(user_id=user_id),
                book=book,
                borrowed_date=date.today(),
                expected_return_date=date.today() + timedelta(days=14),
                status = "Picked up"
            )
            borrowed.save()
            BookQueue.objects.filter(book_id=book_id, user_id=user_id).delete()
            logger.info(f"Book borrowed successfully: {borrowed}")

            return Response(
                {"status": "borrowed", "message": "Book borrowed successfully"},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Borrowing failed for book_id={book_id}, user_id={user_id}. Error: {e}")
            return Response(
                {"error": "Borrowing could not be completed.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ReturnBook(APIView):
    def post(self, request):
        logger.info("ReturnBook POST request received")

        try:
            book_id = request.data["book_id"]
            user_id = request.data["user_id"]
            logger.info(f"Received data: book_id={book_id}, user_id={user_id}")
        except Exception as e:
            logger.error(f"Bad request: {e}")
            return Response(f"Bad request: {e}", status=status.HTTP_400_BAD_REQUEST)

        try:
            borrowed = BorrowedBook.objects.filter(book_id=book_id, user_id=user_id).first()
            if not borrowed:
                logger.info(f"User {user_id} has not borrowed book_id={book_id}")
                return Response(
                    {"status": "not_borrowed", "message": "User has not borrowed the book"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            logger.info(f"User {user_id} has borrowed book_id={book_id}")
            borrowed.returned_date = date.today()
            borrowed.status = "Returned"
            borrowed.save()
            logger.info(f"Book returned successfully: {borrowed}")
            event_data = {
                "book_id": book_id,
                "user_id": user_id,
            }
            send_kafka_message(
                topic=settings.KAFKA_CONFIG["topics"].get(
                    "borrowing_returned"
                ),
                key=str(book_id) + ";" + str(user_id),
                value=event_data,
            )
            penalty = calculate_penalty(borrowed)
            return Response(
                {"status": "returned", "message": "Book returned successfully", "penalty": penalty},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Returning failed for book_id={book_id}, user_id={user_id}. Error: {e}")
            return Response(
                {"error": "Returning could not be completed.", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def get(self, request, *args, **kwargs):
        logger.info("BorrowBook POST request received")
        try:
            user_id = request.user.user_id
            logger.info(f"Received data: user_id={user_id}")
        except Exception as e:
            logger.error(f"Bad request: {e}")
            return Response(f"Bad request: {e}", status=status.HTTP_400_BAD_REQUEST)

        borrowed_books = BorrowedBook.objects.filter(user_id=user_id, status="Returned")
        serializer = BorrowedBookSerializer(borrowed_books, many=True)
        return Response(serializer.data)


def find_book(request):
    logger.info("Received request to find_book")
    query = request.GET.get("query")
    logger.debug(f"Query parameter received: {query}")

    if query:
        m_query = MultiMatch(
            query=query,
            fields=[
                "title",
                "isbn",
                "description",
                "genre.name",
                "authors.name",
            ],
            fuzziness="AUTO",
        )
        logger.debug(f"Constructed MultiMatch query: {m_query}")

        try:
            books = BookDocument.search().query(m_query).to_queryset()
            logger.info(f"Found {len(books)} books matching the query")
            serializer = BookSerializer(books, many=True)
            logger.debug(f"Serialized books data: {serializer.data}")
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            logger.error(f"Error occurred while searching for books: {e}", exc_info=True)
            return JsonResponse(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    else:
        logger.warning("No search query provided in the request")
        return JsonResponse(
            {"message": "No search query provided."}, status=status.HTTP_400_BAD_REQUEST
        )

def find_user(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"}, status=401)

    user = User.objects.get(pk=request.user.user_id)
    if not user:
        return JsonResponse(
            "error: User sending request not found in the system", status=404
        )
    if not user.is_librarian:
        return JsonResponse(
            "error: User sending request is not a librarian", status=403
        )


    try:
        query = request.GET.get("query")
        m_query = MultiMatch(
            query=query,
            fields=[
                "first_name",
                "last_name",
                "email",
                "phone_number",
                "borrowed_books.title",
            ],
            fuzziness="AUTO",
        )
        users = UserDocument.search().query(m_query).to_queryset()

        seralizer = UserSerializer(users, many=True)
        logger.info("halo")
        logger.info(seralizer.data)
        return JsonResponse(seralizer.data, safe=False)
    except Exception as e:
        logger.exception("Unexpected error occurred during get user")
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
def sign_in(request):
    logger.info("Received sign-in request")
    if request.method != "POST":
        logger.warning("Non-POST request made to sign_up endpoint")
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))
        email = data.get("email")
        password = data.get("password_hash")

        logger.info(f"Received sign-in request for email/phone: {email}")

        user = User.objects.filter(email=email).first()
        if not user:
            logger.warning(
                f"User not found with email: {email}. Trying phone number..."
            )
            user = User.objects.filter(phone_number=email).first()

        if user:
            logger.info(f"User found: {user.email}. Attempting authentication...")
            user = authenticate(request, email=user.email, password=password)

        if user:
            logger.info(
                f"Authentication successful for user: {user.email}. Logging in..."
            )
            login(request, user)

            response_body = {
                "user_id": str(user.user_id),
                "is_librarian": user.is_librarian,
            }

            logger.info(f"Login successful. Responding with user data: {response_body}")
            return JsonResponse(response_body, status=status.HTTP_200_OK)

        logger.warning(f"Authentication failed for email/phone: {email}")
        return JsonResponse({"error": "Invalid username or password"}, status=402)

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        return JsonResponse(
            {"error": "Invalid JSON payload"}, status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return JsonResponse(
            {"error": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def validate_phone_number(phone_number):
    if phone_number[:3] != "+48":
        return JsonResponse(
            {"error": "Only polish phone numbers are supported!"}, status=422
        )
    if not (
        len(phone_number) == 12
        and phone_number[1:].isdigit()
        and phone_number[0] == "+"
    ):
        return JsonResponse(
            {"error": "Phone numbers can only consist of + and numbers!"}, status=400
        )

    return JsonResponse(
        {"message": "Phone number is valid!"}, status=status.HTTP_200_OK
    )


@csrf_exempt
def sign_up(request):
    if request.method != "POST":
        logger.warning("Non-POST request made to sign_up endpoint")
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        logger.info("Processing sign-up request")
        data = json.loads(request.body.decode("utf-8"))

        email = data.get("e_mail")
        phone_number = data.get("phone_number")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        password_hash = data.get("password_hash")
        provided_librarian_key = data.get("librarian_key")

        logger.debug(f"Sign-up data: {data}")

        if (
            User.objects.filter(email=email).exists()
            or User.objects.filter(phone_number=phone_number).exists()
        ):
            logger.info("Account already exists for provided email or phone number")
            return JsonResponse({"error": "Account already exists!"}, status=409)

        if not all([email, phone_number, first_name, last_name, password_hash]):
            logger.warning("Missing required fields in request")
            return JsonResponse(
                {"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST
            )

        phone_validation_response = validate_phone_number(phone_number)
        if phone_validation_response.status_code != 200:
            logger.warning(
                f"Phone validation failed: {phone_validation_response.content}"
            )
            return phone_validation_response

        is_librarian = False
        with transaction.atomic():
            if provided_librarian_key:
                logger.info("Checking provided librarian key")
                librarian_key = LibrarianKeys.objects.filter(
                    librarianKey=provided_librarian_key, used=False
                ).first()
                if librarian_key:
                    librarian_key.used = True
                    librarian_key.save()
                    is_librarian = True
                else:
                    logger.warning("Invalid admin token provided")
                    return JsonResponse({"error": "Invalid admin token"}, status=403)

        new_user = User.objects.create_user(
            email=email,
            phone_number=phone_number,
            first_name=first_name,
            last_name=last_name,
            password=password_hash,
            is_librarian=is_librarian,
        )
        logger.info("User created successfully")
        return JsonResponse(
            {"message": "User created successfully"}, status=status.HTTP_200_OK
        )

    except json.JSONDecodeError as json_error:
        logger.error(f"JSON decoding error: {json_error}")
        return JsonResponse(
            {"error": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.exception("Unexpected error occurred during sign-up")
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


def get_user_books(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed"}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"}, status=401)

    try:
        user = request.user
        books = {
            "currently_borrowed_books": user.currently_borrowed_books.all(),
            "previously_borrowed_books": user.previously_borrowed_books.all(),
            "queued_books": user.queued_books.all(),
        }

        data = {
            key: BookSerializer(value, many=True).data for key, value in books.items()
        }
        return JsonResponse(data, safe=False, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("Unexpected error occurred during get user books")
        return JsonResponse(
            {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@csrf_exempt
def upload_cover(request):
    """
    Handle a POST request to upload cover photo.

    Parameters:
        request (HttpRequest): The HTTP request containing task ID and media file in the body.

    Returns:
        JsonResponse: JSON response with the saved media path (status 200) or an error message
        (status 400, 404, 405, or 500).
    """
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        data = json.loads(request.POST.get("data"))
        logger.info(f"Received cover upload request for book ID: {data.get('bookID')}")
        book_id = int(data.get("bookID"))
        if "cover" not in request.FILES:
            return JsonResponse({"error": "No cover file provided"}, status=400)
        cover = request.FILES["cover"]
    except (ValueError, KeyError, json.JSONDecodeError) as e:
        return JsonResponse({"error": str(e)}, status=400)

    try:
        book = Book.objects.get(bookID=book_id)
    except Book.DoesNotExist:
        return JsonResponse({"error": "Book not found"}, status=404)

    response = {}
    try:
        with transaction.atomic():
            logger.info(f"Saving cover for book ID: {book_id}")
            saved_path = default_storage.save(get_cover_path(book_id), cover)
            cover_file_name = os.path.basename(saved_path)
            book.cover_path = cover_file_name
            book.save()
            response = {"coverPath": cover_file_name}
    except Exception as e:
        logger.error(f"Error saving cover for book ID {book_id}: {e}")
        return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse(response, status=200)


# KAFKA_BOOTSTRAP_SERVERS = os.environ.get('KAFKA_BOOTSTRAP_SERVERS', 'kafka:9092')

# producer = KafkaProducer(
#     bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
#     value_serializer=lambda v: json.dumps(v).encode('utf-8')
# )

# consumer = KafkaConsumer(
#     'my_topic',
#     bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
#     value_deserializer=lambda x: json.loads(x.decode('utf-8'))
# )

# def produce_message(request):
#     message = "Hello World from Kafka"
#     producer.send('my_topic', {'message': message})
#     return HttpResponse("Message sent to Kafka")

# def consume_message(request):
#     # Poll Kafka to get a batch of messages (with a timeout of 1 second)
#     records = consumer.poll(timeout_ms=1000)

#     messages_consumed = []

#     for tp, messages in records.items():
#         for msg in messages:
#             message_content = msg.value.get('message')

#             # Store message in the database
#             Message.objects.create(content=message_content)

#             # Store message in Elasticsearch
#             es.index(index='messages', body={'content': message_content})

#             messages_consumed.append(message_content)

#     if messages_consumed:
#         return HttpResponse(f"Messages consumed and stored: {messages_consumed}")
#     else:
#         return HttpResponse("No new messages found in Kafka")
