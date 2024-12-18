FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . /app/

# Expose port 8000 for the Django app
EXPOSE 8000

# Run migrations and then start the Django development server
CMD ["bash", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]