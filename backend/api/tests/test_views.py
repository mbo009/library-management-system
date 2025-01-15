import pytest
from django.urls import reverse


def test_hello_world_endpoint(client):
    url = reverse('hello_world')
    response = client.get(url)
    expected_data = {"message": "Hello World"}
    
    assert response.status_code == 200
    assert response.json() == expected_data
