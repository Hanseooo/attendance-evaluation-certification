from django.urls import path, router
from .views import get_present_users, AttendedSeminarViewSet

router.register(r'attended-seminars', AttendedSeminarViewSet, basename='attended-seminars')

urlpatterns = [
    path("present-users/<int:seminar_id>/", get_present_users, name="present-users"),
]
