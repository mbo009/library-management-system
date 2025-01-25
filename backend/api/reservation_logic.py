from .models import Book, Inventory, BookQueue
from django.db import transaction
from .utils.kafka_consumer import KafkaConsumer
from django.conf import settings
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
            inventory.available_copies -=1
            inventory.save()
            logger.info(f"Inventory updated for book: {book.title}")
    except Exception as e:
        print(f"Error processing inventory update: {e}")



def process_reservations(event):
    try:
        book_id = event.get('book_id')
        user_id = event.get('user_id')
        logger.info(f">>>> Reservation {book_id} {user_id}")

        if BookQueue.objects.filter(user_id=user_id, book_id=book_id).exists():
            logger.info("Reservation already exists")
            return

        serializer = CreateBookQueueSerializer(data=event)
        if serializer.is_valid():
            book_queue = serializer.save()

    except Exception as e:
        logger.info(f"Error processing reservations: {e}")


def process_author_creation(event):
    try:
        author_name= event.get("name")
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
    consumer = KafkaConsumer("author_created", "author_group", settings.KAFKA_CONFIG["bootstrap.servers"])
    consumer.start_in_thread(process_author_creation)

def start_reservation_consumer():
    consumer = KafkaConsumer("reservation_created", "reservation_group", settings.KAFKA_CONFIG["bootstrap.servers"])
    #consumer.start_in_thread(process_inventory_update)
    consumer.start_in_thread(process_inventory_update)