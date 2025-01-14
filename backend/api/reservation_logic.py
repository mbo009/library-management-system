from .models import Book, Inventory
from django.db import transaction
from .utils.kafka_consumer import KafkaConsumer
from django.conf import settings


def verify_inventory(book_id):
    book = Book.objects.get(pk=book_id)
    inventory = Inventory.objects.get(book=book)
    return inventory.available_copies > 0


def process_inventory_update(event):
    try:
        book_id = event.get("book")
        with transaction.atomic():
            book = Book.objects.get(pk=book_id)
            inventory = Inventory.objects.get(book=book)
            if event.get("action") == "created":
                inventory.total_copies += 1
            elif event.get("action") == "deleted":
                inventory.total_copies -= 1
            inventory.save()
    except Exception as e:
        print(f"Error processing inventory update: {e}")


def start_inventory_consumer():
    consumer = KafkaConsumer("reservation_created", "inventory_group", settings.KAFKA_CONFIG["bootstrap.servers"])
    consumer.start_in_thread(process_inventory_update)