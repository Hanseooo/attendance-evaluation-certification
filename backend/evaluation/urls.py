from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationViewSet, AvailableEvaluationsAPIView

router = DefaultRouter()
router.register(r"evaluations", EvaluationViewSet, basename="evaluation")

urlpatterns = [
    path("", include(router.urls)),
    path("available-evaluations/", AvailableEvaluationsAPIView.as_view(), name="available-evaluations"),
]
