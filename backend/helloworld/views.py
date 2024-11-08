from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
def hello_world_endpoint(request):
    data = {
        "message": "Hello World"
    }
    return JsonResponse(data)