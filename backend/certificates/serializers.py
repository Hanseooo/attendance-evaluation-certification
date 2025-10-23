from rest_framework import serializers
from .models import CertificateTemplate
from seminars.models import Seminar
from seminars.serializers import SeminarSerializer

class CertificateTemplateSerializer(serializers.ModelSerializer):
    seminar = SeminarSerializer(read_only=True)
    seminar_id = serializers.PrimaryKeyRelatedField(
        queryset=Seminar.objects.all(),
        source="seminar",
        write_only=True
    )

    class Meta:
        model = CertificateTemplate
        fields = [
            "id",
            "seminar",
            "seminar_id",
            "template_image",
            "text_x",
            "text_y",
            "centered",
            "uploaded_at",
        ]
        read_only_fields = ["id", "uploaded_at"]
