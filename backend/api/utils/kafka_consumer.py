from confluent_kafka import Consumer, KafkaException
from threading import Thread
import json
import time
import logging

logger = logging.getLogger(__name__)

class KafkaConsumer:
    def __init__(self, topic, group_id, bootstrap_servers):
        self.topic = topic
        self.group_id = group_id
        self.bootstrap_servers = bootstrap_servers
        self.consumer = Consumer({
            'bootstrap.servers': self.bootstrap_servers,
            'group.id': self.group_id,
            'auto.offset.reset': 'earliest',
        })

    def start(self, message_processor):
        self.consumer.subscribe([self.topic])
        print(f"Started Confluent Kafka consumer for topic: {self.topic}")

        while True:
            msg = self.consumer.poll(timeout=1.0)
            if msg is None:
                continue
            if msg.error():
                print(f"Error: {msg.error()}")
                break
            print("Received message: {msg.value().decode('utf-8')}")
            decoded_message = json.loads(msg.value().decode('utf-8'))
            logger.info("test", decoded_message)
            message_processor(decoded_message)



    def start_in_thread(self, message_processor):
        thread = Thread(target=self.start, args=(message_processor,))
        thread.start()
        # self.start(message_processor)
        print(f"Kafka consumer thread started for topic: {self.topic}")