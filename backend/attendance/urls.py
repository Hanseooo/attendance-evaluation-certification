from django.urls import path
from .views import get_present_users, AttendedSeminarViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'attended-seminars', AttendedSeminarViewSet, basename='attended-seminars')

urlpatterns = [
    path("present-users/<int:seminar_id>/", get_present_users, name="present-users"),
]
