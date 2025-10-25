from rest_framework import serializers
from django.conf import settings
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
    template_image_url = serializers.SerializerMethodField()

    class Meta:
        model = CertificateTemplate
        fields = [
            "id",
            "seminar",
            "seminar_id",
            "template_image",
            "template_image_url",
            "text_x",
            "text_y",
            "centered",
            "default_used",        
            "uploaded_at",
        ]
        read_only_fields = ["id", "uploaded_at"]

    def get_template_image_url(self, obj):
        """Return absolute URL for image (Cloudinary or local)."""
        if not obj.template_image:
            return None
        try:
            return obj.template_image.url
        except ValueError:
            # If already a string (e.g., Cloudinary URL)
            return str(obj.template_image)
