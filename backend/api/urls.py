# api/urls.py
from django.urls import path
from users.views import CurrentUserView
from seminars.views import SeminarListCreateAPIView, SeminarDetailAPIView, PlannedSeminarAPIView, PlannedSeminarDetailAPIView

urlpatterns = [
    path('user/', CurrentUserView.as_view(), name='current-user'),
    path('seminars/', SeminarListCreateAPIView.as_view(), name='seminars-list-create'),
    path('seminars/<int:pk>/', SeminarDetailAPIView.as_view(), name='seminars-detail'),  # PUT, DELETE, GET by id
    path('planned-seminars/', PlannedSeminarAPIView.as_view(), name='planned-seminars'),
    path('planned-seminars/<int:pk>/', PlannedSeminarDetailAPIView.as_view(), name='planned-seminars-detail'),
]
