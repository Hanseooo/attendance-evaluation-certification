from rest_framework import serializers
from .models import Seminar, CertificateTemplate, PlannedSeminar
from users.serializers import UserSerializer

class CertificateTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertificateTemplate
        fields = ["id", "name", "file", "created_at"]

class SeminarSerializer(serializers.ModelSerializer):
    certificate_template = CertificateTemplateSerializer(read_only=True)

    class Meta:
        model = Seminar
        fields = [
            "id", "title", "description", "speaker", "venue",
            "date_start", "date_end", "duration_minutes", 
            "is_done", "certificate_template", "created_at"
        ]

class PlannedSeminarSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    seminar = SeminarSerializer(read_only=True)

    class Meta:
        model = PlannedSeminar
        fields = ["id", "user", "seminar", "created_at"]
