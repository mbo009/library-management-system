from kafka import KafkaProducer
from django.conf import settings
import json
import os


if os.getenv("SERVICE_ROLE") == "backend":
    producer = KafkaProducer(
        bootstrap_servers=settings.KAFKA_CONFIG['bootstrap.servers'],
        value_serializer=lambda v: json.dumps(v).encode('utf-8'),
        key_serializer=lambda v: v.encode('utf-8'),
    )

    def send_kafka_message(topic, key, value):
        """
        Send a message to a Kafka topic.
        :param topic: Kafka topic name
        :param key: Message key
        :param value: Message value
        """
        try:
            producer.send(topic, key=key, value=value)
            producer.flush()
            print(f"Message sent to Kafka topic '{topic}': {value}")
        except Exception as e:
            print(f"Error sending message to Kafka topic '{topic}': {e}")
else:
    producer = None
    def send_kafka_message(*args, **kwargs):
        print("Kafka producer is not initialized in this service.")