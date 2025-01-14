from django.apps import AppConfig
from .utils.kafka_producer import producer

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    def ready(self):
        print("Kafka producer initialized.")

