# api/urls.py
from django.urls import path
from users.views import CurrentUserView

urlpatterns = [
    path('user/', CurrentUserView.as_view(), name='current-user'),
]
