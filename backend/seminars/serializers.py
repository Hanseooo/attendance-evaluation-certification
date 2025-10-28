# seminars/serializers.py
from rest_framework import serializers
from .models import Seminar, PlannedSeminar
from users.serializers import UserSerializer
from certificates.models import CertificateTemplate


class CertificateTemplateSerializer(serializers.ModelSerializer):
    """Simple serializer for certificate template in seminar list"""
    from certificates.models import CertificateTemplate
    
    class Meta:
        model = CertificateTemplate
        fields = [
            "id",
            "template_image_url",
            "name_font_size",
            "title_font_size",
            "default_used",
        ]
    
    template_image_url = serializers.SerializerMethodField()
    
    def get_template_image_url(self, obj):
        """Return absolute URL for image"""
        from django.conf import settings
        if not obj.template_image:
            return settings.DEFAULT_CERTIFICATE_TEMPLATE_URL
        try:
            return obj.template_image.url
        except (ValueError, AttributeError):
            return str(obj.template_image)


class SeminarSerializer(serializers.ModelSerializer):
    certificate_template = CertificateTemplateSerializer(read_only=True)

    class Meta:
        model = Seminar
        fields = [
            "id", "title", "description", "speaker", "venue",
            "date_start", "date_end", "duration_minutes", 
            "is_done", "certificate_template", "created_at", 
        ]


class PlannedSeminarSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    seminar = serializers.PrimaryKeyRelatedField(queryset=Seminar.objects.all())

    class Meta:
        model = PlannedSeminar
        fields = ["id", "user", "seminar", "created_at"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['seminar'] = SeminarSerializer(instance.seminar).data
        return rep