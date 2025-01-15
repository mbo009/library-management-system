from django.apps import AppConfig
from .utils.kafka_producer import producer

class APIConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "api"
    def read(self):
        print("Kafka producer initialized")