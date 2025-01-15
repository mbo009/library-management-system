from django.core.management.base import BaseCommand
from api.reservation_logic import start_reservation_consumer

class Command(BaseCommand):
    help = 'Start the Kafka consumer for inventory updates'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Starting Kafka consumer for inventory updates..."))
        start_reservation_consumer()
