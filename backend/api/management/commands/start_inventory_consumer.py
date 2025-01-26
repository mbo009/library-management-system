from django.core.management.base import BaseCommand
from api.reservation_logic import start_reservation_consumer, start_return_consumer, ensure_kafka_topics_exist

class Command(BaseCommand):
    help = 'Start the Kafka consumer for inventory updates'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Starting Kafka consumer for inventory updates..."))
        ensure_kafka_topics_exist("kafka:9092", ["reservation_created", "borrowing_returned"])
        start_reservation_consumer()
        start_return_consumer()
