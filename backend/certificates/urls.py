# certificates/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CertificateTemplateViewSet, ResendCertificateAPIView

router = DefaultRouter()
router.register(r'certificate-templates', CertificateTemplateViewSet, basename='certificate-template')

urlpatterns = [
    path('', include(router.urls)),
    path("resend-certificate/<int:seminar_id>/<int:user_id>/", ResendCertificateAPIView.as_view(), name="resend-certificate"),
]