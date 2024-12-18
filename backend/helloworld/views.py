from django.http import JsonResponse
from elasticsearch_dsl.query import MultiMatch
from helloworld.documents import BookDocument


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
                "page_count",
                "published_date",
                "description",
                "genre",
                "authors.name",
            ],
            fuzziness="AUTO",
        )
        # print(m_query)
        try:
            books = BookDocument.search().query(m_query).to_queryset()
            return JsonResponse(books)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    else:
        return JsonResponse({"message": "No search query provided."}, status=400)


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
