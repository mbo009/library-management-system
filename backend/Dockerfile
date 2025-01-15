FROM python:3.13-slim

WORKDIR /app

COPY . /app
USER root
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY ./wait-for-it.sh ./wait-for-it.sh
RUN chmod +x /app/wait-for-it.sh

EXPOSE 8000

# Run migrations and then start the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]