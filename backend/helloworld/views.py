from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from elasticsearch_dsl.query import MultiMatch
from helloworld.documents import BookDocument
from django.contrib.auth import authenticate, login
from helloworld.serializers import BookSerializer
from django.db import transaction
from helloworld.models import User, LibrarianKeys
import json


def hello_world_endpoint(request):
    data = {"message": "Hello World"}
    return JsonResponse(data)


def find_book(request):
    query = request.GET.get("query")
    print(query)
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
            return JsonResponse({"error": str(e)}, status=500)

    else:
        return JsonResponse({"message": "No search query provided."}, status=400)


@csrf_exempt
def sign_in(request):
    """
    Handle a POST request for user login.

    Parameters:
        request (HttpRequest): The HTTP request containing username and password in the body.

    Returns:
        JsonResponse: JSON response with user details and game information (status 200) on successful login,
        or an error message (status 402, 403, or 405) on failure.
    """
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))
        email = data.get("email")
        password = data.get("password_hash")

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.filter(phone_number=email).first()

        if user:
            user = authenticate(request, e_mail=user.email, password=password)

        if user:
            login(request, user)

            response_body = {
                "user_id": str(user.user_id),
                "is_librarian": user.is_librarian,
            }

            return JsonResponse(response_body, status=200)

        return JsonResponse({"error": "Invalid username or password"}, status=402)

    return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

def validate_phone_number(phone_number):
    if phone_number[:3] != "+48":
        return JsonResponse({"error": "Only polish phone numbers are supported!"}, status=422)
    if not (len(phone_number) == 12 and phone_number[1:].isdigit() and phone_number[0] == "+"):
        return JsonResponse({"error": "Phone numbers can only consist of + and numbers!"}, status=400)
    
    return JsonResponse({"message": "Phone number is valid!"}, status=200)


@csrf_exempt
def sign_up(request):
    """
    Handle a POST request to register a new user account.

    Parameters:
        request (HttpRequest): The HTTP request containing user details (e_mail, username, password_hash,
        and optional admin_key) in the body.

    Returns:
        JsonResponse: JSON response with a success message (status 200) if the user is created successfully,
        or an error message (status 400, 403, 409, or 500) if registration fails.
    """
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests are allowed"}, status=405)

    try:
        data = json.loads(request.body.decode("utf-8"))

        e_mail = data.get("e_mail")
        phone_number = data.get("phone_number")
        first_name = data.get("first_name")
        last_name = data.get("last_name")
        password_hash = data.get("password_hash")
        provided_librarian_key = data.get("librarian_key")

        if (
            User.objects.filter(e_mail=e_mail).exists()
            or User.objects.filter(phone_number=phone_number).exists()
        ):
            return JsonResponse({"error": "Account already exists!"}, status=409)
        
        if not all(e_mail, phone_number, first_name, last_name, password_hash):
            return JsonResponse({"error": "Missing required fields"}, status=400)
        
        phone_validation_response = validate_phone_number(phone_number)
        if phone_validation_response.status_code != 200:
            return phone_validation_response

        with transaction.atomic():
            is_librarian = False
            if provided_librarian_key:
                librarian_key = LibrarianKeys.objects.filter(
                    librarianKey=provided_librarian_key, used=False
                ).first()
                if librarian_key:
                    librarian_key.used = True
                    librarian_key.save()
                    is_librarian = True
                else:
                    return JsonResponse(
                        {"error": "Invalid admin token"}, status=403
                    )

        new_user = User.objects.create_user(
            e_mail=e_mail,
            phone_number=phone_number,
            first_name=first_name,
            last_name=last_name,
            password=password_hash,
            is_librarian=is_librarian,
        )

        return JsonResponse({"message": "User created successfully"}, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


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
