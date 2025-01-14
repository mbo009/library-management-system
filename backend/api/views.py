import json
import os
from django.http import JsonResponse
from .utils.kafka_producer import send_kafka_message
from elasticsearch import Elasticsearch
from django.shortcuts import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Book
from .serializers import BookSerializer, AuthorSerializer, ReservationSerializer, BorrowingSerializer
from django.conf import settings
from .reservation_logic import verify_inventory
from django.db import transaction


class CreateBookView(APIView):
    def post(self, request, *args, **kwargs):
        # Deserialize the incoming data
        serializer = BookSerializer(data=request.data)
        if serializer.is_valid():
            # Save the book
            book = serializer.save()

            # Send a Kafka event
            event_data = {
                "id": book.bookID,
                "title": book.title,
                "author": book.author.full_name if book.author else None,
                "genre": book.genre.name if book.genre else None,
                "language": book.language.name if book.language else None,
                "published_date": str(book.published_date),
            }
            send_kafka_message(
                topic=settings.KAFKA_CONFIG["topics"].get("book_created"),
                key=str(book.bookID),
                value=event_data,
            )

            # Return response
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CreateAuthorView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = AuthorSerializer(data=request.data)
        if serializer.is_valid():
            # Save the author
            author = serializer.save()

            # Send a Kafka event
            event_data = {
                "id": author.authorID,
                "name": author.full_name
            }
            send_kafka_message(
                topic=settings.KAFKA_CONFIG["topics"].get("author_created"),
                key=str(author.authorID),
                value=event_data,
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteBookView(APIView):
    def delete(self, request, book_id, *args, **kwargs):
        try:
            book = Book.objects.get(pk=book_id)
            book.delete()

            event_data = {
                "id": book_id,
                "action": "deleted",
            }
            send_kafka_message(
                topic=settings.KAFKA_CONFIG["topics"].get("book_deleted"),
                key=str(book_id),
                value=event_data,
            )

            return Response({"message": "Book deleted successfully."}, status=status.HTTP_200_OK)
        except Book.DoesNotExist:
            return Response(
                {"error": "Book not found."}, status=status.HTTP_404_NOT_FOUND
            )


class ReserveBook(APIView):
    def post(self, request, *args, **kwargs):
        serializer = ReservationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    validated_data = serializer.validated_data
                    validated_data["status"] = "Completed" if verify_inventory(serializer.validated_data["book"]) else "Pending"
                    reservation = serializer.save(status=validated_data["status"])
                    event_data = {
                        "id": reservation.reservationID,
                        "user": reservation.user.userID,
                        "book": reservation.book.bookID,
                        "reservation_date": str(reservation.reservation_date),
                        "status": validated_data["status"],
                    }
                    send_kafka_message(
                        topic=settings.KAFKA_CONFIG["topics"].get("reservation_created"),
                        key=str(reservation.reservationID),
                        value=event_data,
                    )
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {"error": "Reservation could not be completed.", "details": str(e)},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BorrowBook(APIView):
    def post(self, request, *args, **kwargs):
        serializer = BorrowingSerializer(data=request.data)
        if serializer.is_valid():
            validated_data = serializer.validated_data
            validated_data["fine"] = 0
            borrowing = serializer.save(fine=validated_data["fine"])
            event_data = {
                "id": borrowing.borrowingID,
                "user": borrowing.user.userID,
                "book": borrowing.book.bookID,
                "borrow_date": str(borrowing.borrow_date),
                "due_date": borrowing.due_date,
                "return_date": borrowing.return_date,
                "fine": 0,
            }
            send_kafka_message(
                topic=settings.KAFKA_CONFIG["topics"].get("borrowing_created"),
                key=str(borrowing.borrowingID),
                value=event_data,
            )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
