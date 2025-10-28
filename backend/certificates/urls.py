# certificates/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CertificateTemplateViewSet

router = DefaultRouter()
router.register(r'certificate-templates', CertificateTemplateViewSet, basename='certificate-template')

urlpatterns = [
    path('', include(router.urls)),
]