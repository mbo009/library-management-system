from django.shortcuts import render
from django.http import JsonResponse
from elasticsearch import Elasticsearch

# Create your views here.
def hello_world_endpoint(request):
    data = {
        "message": "Hello World"
    }
    return JsonResponse(data)

def search_for_book(request):
    pass

