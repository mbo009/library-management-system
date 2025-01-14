from kafka import KafkaConsumer
from threading import Thread
import json
import time

class KafkaConsumer:
    def __init__(self, topic, group_id, bootstrap_servers):
        self.topic = topic
        self.group_id = group_id
        self.bootstrap_servers = bootstrap_servers

    def start(self, message_processor):
        consumer = KafkaConsumer(
            self.topic,
            group_id=self.group_id,
            bootstrap_servers=self.bootstrap_servers,
        )
        print(f"Started Kafka consumer for topic: {self.topic}")
        for message in consumer:
            decoded_message = json.loads(message.value.decode('utf-8'))
            message_processor(decoded_message)

    def start_in_thread(self, message_processor):
        time.sleep(10)
        thread = Thread(target=self.start, args=(message_processor,))
        thread.start()
        print(f"Kafka consumer thread started for topic: {self.topic}")