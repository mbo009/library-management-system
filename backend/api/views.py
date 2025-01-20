from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from elasticsearch_dsl.query import MultiMatch
from api.documents import BookDocument, UserDocument
from django.contrib.auth import authenticate, login
from api.serializers import BookSerializer, AuthorSerializer, BookQueueSerializer, LanguageSerializer, GenreSerializer, UserSerializer
from api.serializers import CreateUpdateBookSerializer
from .utils.kafka_producer import send_kafka_message
from django.db import transaction
from django.contrib.auth.hashers import make_password
from api.models import User, LibrarianKeys, Book, Author, Language, Genre
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, UpdateAPIView
from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings 
import json
import logging

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

            return Response({"message": "Book deleted successfully."}, status=status.HTTP_200_OK)
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
            event_data = {
                "name": author.name,
                "bio": author.bio
            }
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
        serializer = BookQueueSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    book_queue = serializer.save()
                    event_data = {
                        "id": book_queue.book_queue_id,
                        "user": book_queue.user.user_id,
                        "book": book_queue.book.bookID,
                        "queue_date": str(book_queue.queue_date),
                        "turn": book_queue.turn,
                    }
                    if int(book_queue.turn) == 0:
                        send_kafka_message(
                            topic=settings.KAFKA_CONFIG["topics"].get("reservation_created"),
                            key=str(book_queue.book_queue_id),
                            value=event_data,
                        )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": "Reservation could not be completed.", "details": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def find_book(request):
    query = request.GET.get("query")
    if query:
        m_query = MultiMatch(
            query=query,
            fields=[
                "title",
                "isbn",
                "description",
                "genre",
                "authors.name",
            ],
            fuzziness="AUTO",
        )
        try:
            books = BookDocument.search().query(m_query).to_queryset()
            serializer = BookSerializer(books, many=True)
            return JsonResponse(serializer.data, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    else:
        return JsonResponse({"message": "No search query provided."}, status=status.HTTP_400_BAD_REQUEST)


def find_user(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests are allowed"}, status=405)
    if not request.user.is_authenticated:
        return JsonResponse({"error": "User is not authenticated"}, status=401)
    
    user = User.objects.get(pk=request.user.user_id)
    if not user:
        return JsonResponse("error: User sending request not found in the system", status=404)
    if not user.is_librarian:
        return JsonResponse("error: User sending request is not a librarian", status=403)

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
        return JsonResponse(seralizer.data, safe=False)
    except Exception as e:
        logger.exception("Unexpected error occurred during get user")
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            logger.warning(f"User not found with email: {email}. Trying phone number...")
            user = User.objects.filter(phone_number=email).first()

        if user:
            logger.info(f"User found: {user.email}. Attempting authentication...")
            user = authenticate(request, email=user.email, password=password)

        if user:
            logger.info(f"Authentication successful for user: {user.email}. Logging in...")
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
        return JsonResponse({"error": "Invalid JSON payload"}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        return JsonResponse({"error": "An error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def validate_phone_number(phone_number):
    if phone_number[:3] != "+48":
        return JsonResponse({"error": "Only polish phone numbers are supported!"}, status=422)
    if not (len(phone_number) == 12 and phone_number[1:].isdigit() and phone_number[0] == "+"):
        return JsonResponse({"error": "Phone numbers can only consist of + and numbers!"}, status=400)

    return JsonResponse({"message": "Phone number is valid!"}, status=status.HTTP_200_OK)

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
            return JsonResponse({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        phone_validation_response = validate_phone_number(phone_number)
        if phone_validation_response.status_code != 200:
            logger.warning(f"Phone validation failed: {phone_validation_response.content}")
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
        return JsonResponse({"message": "User created successfully"}, status=status.HTTP_200_OK)

    except json.JSONDecodeError as json_error:
        logger.error(f"JSON decoding error: {json_error}")
        return JsonResponse({"error": "Invalid JSON"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Unexpected error occurred during sign-up")
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

        data = {key: BookSerializer(value, many=True).data for key, value in books.items()}
        return JsonResponse(data, safe=False, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("Unexpected error occurred during get user books")
        return JsonResponse({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
