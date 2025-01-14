FROM python:3.9-slim

WORKDIR /app

COPY . /app

COPY ../requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

CMD ["python", "manage.py", "start_inventory_consumer"]
