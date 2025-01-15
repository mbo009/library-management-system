FROM python:3.13-slim

WORKDIR /app

COPY . /app

COPY ../requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN chmod +x wait-for-it.sh

CMD ["python", "manage.py", "start_inventory_consumer"]
