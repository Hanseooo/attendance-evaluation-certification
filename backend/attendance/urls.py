from django.urls import path
from .views import get_present_users

urlpatterns = [
    path("present-users/<int:seminar_id>/", get_present_users, name="present-users"),
]
