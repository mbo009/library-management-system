from confluent_kafka import Producer
from django.conf import settings
import json
import os
import logging

logger = logging.getLogger(__name__)


if os.getenv("SERVICE_ROLE") == "backend":
    producer = Producer({
        'bootstrap.servers': settings.KAFKA_CONFIG['bootstrap.servers']
    })

    def delivery_report(err, msg):
        """
        Callback for confirming message delivery.
        """
        if err is not None:
            print(f"Message delivery failed: {err}")
        else:
            print(f"Message delivered to {msg.topic()} [{msg.partition()}]")


    def send_kafka_message(topic, key, value):
        """
        Send a message to a Kafka topic using the Confluent Kafka producer.
        :param topic: Kafka topic name
        :param key: Message key
        :param value: Message value
        """
        try:
            producer.produce(
                topic,
                key=key.encode('utf-8') if key else None,
                value=json.dumps(value).encode('utf-8'),
                callback=delivery_report
            )
            producer.flush()  # Ensure the message is delivered before returning
            logger.info(f"Message sent to Kafka topic '{topic}': {value}")
        except Exception as e:
            logger.info(f"Error sending message to Kafka topic '{topic}': {e}")

else:
    producer = None
    def send_kafka_message(*args, **kwargs):
        print("Kafka producer is not initialized in this service.")