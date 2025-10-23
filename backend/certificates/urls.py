# certificates/urls.py
from rest_framework.routers import DefaultRouter
from .views import CertificateTemplateViewSet
from django.urls import path, include

router = DefaultRouter()
router.register(r"certificate-templates", CertificateTemplateViewSet, basename="certificate-template")

urlpatterns = [
    path("", include(router.urls))
]
