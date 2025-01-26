from .models import Book, Inventory, BookQueue, BorrowedBook, User
from django.db import transaction
from .utils.kafka_consumer import KafkaConsumer
from .utils.kafka_producer import send_kafka_message
from django.conf import settings
from datetime import timedelta, date
from confluent_kafka.admin import AdminClient, NewTopic
import logging
from api.serializers import (
    CreateBookQueueSerializer,
)

logger = logging.getLogger(__name__)


def verify_inventory(book_id):
    book = Book.objects.get(pk=book_id)
    inventory = Inventory.objects.get(book=book)
    return inventory.available_copies > 0


def process_inventory_update(event):
    try:
        book_id = event.get("book_id")
        with transaction.atomic():
            book = Book.objects.get(pk=book_id)
            inventory = Inventory.objects.get(book=book)
            inventory.available_copies -= 1
            inventory.save()
            logger.info(f"Inventory updated for book: {book.title}")
    except Exception as e:
        print(f"Error processing inventory update: {e}")


def create_reservation(book_id, user_id, queued):
    status = "Waiting"
    if verify_inventory(book_id):
        logger.info(f"No queue found for book_id={book_id}, checking inventory")
        # if len(queued) == 0:
        logger.info(f"Inventory available for book_id={book_id}")
        event_data = {
            "book_id": book_id,
            "user_id": user_id,
        }
        send_kafka_message(
            topic=settings.KAFKA_CONFIG["topics"].get("reservation_created"),
            key=str(book_id) + ";" + str(user_id),
            value=event_data,
        )
        logger.info(f"Kafka message sent for book_id={book_id}, user_id={user_id}")
        queue_date = date.today()
        status = "Ready"
        # else:
        #     logger.warning(f"No inventory available for book_id={book_id}")
        #     queue_date = (
        #         BorrowedBook.objects.filter(book_id=book_id)
        #         .order_by("expected_return_date")
        #         .first()
        #         .expected_return_date
        #     )
        turn = 0
    else:
        turn = queued.last().turn + 1
        queue_date = queued.last().queue_date + timedelta(days=14)
        logger.info(
            f"Queue updated for book_id={book_id}: turn={turn}, queue_date={queue_date}"
        )
    book_queue = BookQueue(
        user=User.objects.get(user_id=user_id),
        book=Book.objects.get(bookID=book_id),
        queue_date=queue_date,
        turn=turn,
        status=status,
    )
    book_queue.save()
    return queue_date, turn, status


def process_return_update(event):
    try:
        book_id = event.get("book_id")
        book = Book.objects.get(pk=book_id)
        logger.info(f"Starting return transaction: {book.title}")
        with transaction.atomic():
            book_queue = (
                BookQueue.objects.filter(book=book, status="Waiting")
                .order_by("queue_date")
                .first()
            )
            if book_queue:
                book_queue.status = "Ready"
                book_queue.save()
                logger.info(f"Queue updated for book: {book.title}")
            else:
                inventory = Inventory.objects.get(book=book)
                inventory.available_copies += 1
                inventory.save()
            logger.info(f"Inventory updated for book: {book.title}")
    except Exception as e:
        logger.error(f"Error processing return update: {e}")
        print(f"Error processing return update: {e}")


def calculate_penalty(borrowed_book):
    expected_return_date = borrowed_book.expected_return_date
    returned_date = borrowed_book.returned_date
    if returned_date > expected_return_date:
        days_overdue = (returned_date - expected_return_date).days
        return days_overdue * 10
    return 0


def process_author_creation(event):
    try:
        author_name = event.get("name")
        with transaction.atomic():
            logger.info(f"xdd: {author_name}")
    except Exception as e:
        logger.error(f"Error processing author creation: {e}")
        print(f"Error processing inventory update: {e}")


def verify_inventory(book_id):
    book = Book.objects.get(pk=book_id)
    inventory = Inventory.objects.get(book=book)
    return inventory.available_copies > 0


def start_author_consumer():
    consumer = KafkaConsumer(
        "author_created", "author_group", settings.KAFKA_CONFIG["bootstrap.servers"]
    )
    consumer.start_in_thread(process_author_creation)


def start_reservation_consumer():
    consumer = KafkaConsumer(
        "reservation_created",
        "reservation_group",
        settings.KAFKA_CONFIG["bootstrap.servers"],
    )
    consumer.start_in_thread(process_inventory_update)


def start_return_consumer():
    consumer = KafkaConsumer(
        "borrowing_returned", "return_group", settings.KAFKA_CONFIG["bootstrap.servers"]
    )
    consumer.start_in_thread(process_return_update)


def ensure_kafka_topics_exist(bootstrap_servers, topics):
    admin_client = AdminClient({"bootstrap.servers": bootstrap_servers})
    existing_topics = admin_client.list_topics(timeout=10).topics

    for topic in topics:
        if topic not in existing_topics:
            try:
                admin_client.create_topics(
                    [NewTopic(topic, num_partitions=1, replication_factor=1)]
                )
                print(f"Created topic: {topic}")
            except Exception as e:
                print(f"Failed to create topic {topic}: {e}")
