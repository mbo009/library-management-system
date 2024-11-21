FROM python:3.9-slim

WORKDIR /app
RUN apt-get update && apt-get install -y netcat-openbsd

COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app/
COPY wait_for_kafka.sh /app/
EXPOSE 8000
ENTRYPOINT ["/app/wait_for_kafka.sh"]
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
