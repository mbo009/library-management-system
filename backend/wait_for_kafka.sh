#!/bin/sh

KAFKA_HOST=${KAFKA_HOST:-kafka}
KAFKA_PORT=${KAFKA_PORT:-9092}

echo "Waiting for Kafka at $KAFKA_HOST:$KAFKA_PORT..."

# Loop until Kafka is ready
while ! nc -z $KAFKA_HOST $KAFKA_PORT; do
  sleep 1
done

echo "Kafka is up - executing command"

exec "$@"
