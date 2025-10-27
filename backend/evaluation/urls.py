# backend/evaluation/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationViewSet, AvailableEvaluationsAPIView, SeminarEvaluationAnalyticsAPIView

router = DefaultRouter()
router.register(r'', EvaluationViewSet, basename='evaluation')

urlpatterns = [
    path('available-evaluations/', AvailableEvaluationsAPIView.as_view(), name='available-evaluations'),
    path('seminar/<int:seminar_id>/analytics/', SeminarEvaluationAnalyticsAPIView.as_view(), name='seminar-evaluation-analytics'),
    path('', include(router.urls)),
]
