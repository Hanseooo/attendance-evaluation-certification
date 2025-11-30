# certificates/serializers.py
from rest_framework import serializers
from django.conf import settings
from .models import CertificateTemplate, FONT_CHOICES, Certificate
from seminars.models import Seminar


class CertificateTemplateSerializer(serializers.ModelSerializer):
    seminar_id = serializers.PrimaryKeyRelatedField(
        queryset=Seminar.objects.all(),
        source="seminar",
        write_only=True
    )
    template_image_url = serializers.SerializerMethodField()
    seminar_title = serializers.CharField(source='seminar.title', read_only=True)
    available_fonts = serializers.SerializerMethodField()

    class Meta:
        model = CertificateTemplate
        fields = [
            "id",
            "seminar_id",
            "seminar_title",
            "template_image",
            "template_image_url",
            "template_width",
            "template_height",
            
            # Name settings
            "name_x_percent",
            "name_y_percent",
            "name_font_size",
            "name_font",
            "name_color",
            
            # Title settings
            "title_x_percent",
            "title_y_percent",
            "title_font_size",
            "title_font",
            "title_color",
            "show_title",
            
            # Metadata
            "default_used",
            "uploaded_at",
            "available_fonts",
        ]
        read_only_fields = ["id", "uploaded_at", "available_fonts"]

    def get_template_image_url(self, obj):
        """Return Cloudinary URL"""
        if obj.template_image:
            # CloudinaryField automatically provides .url
            return obj.template_image.url
        return settings.DEFAULT_CERTIFICATE_TEMPLATE_URL

    def get_available_fonts(self, obj):
        """Return list of available fonts"""
        return [{"value": font[0], "label": font[1]} for font in FONT_CHOICES]

    def validate(self, data):
        """Validate template data"""
        # Validate percentages
        for field in ['name_x_percent', 'name_y_percent', 'title_x_percent', 'title_y_percent']:
            if field in data:
                value = data[field]
                if value < 0 or value > 100:
                    raise serializers.ValidationError({field: "Percentage must be between 0 and 100"})
        
        # Validate font sizes
        for field in ['name_font_size', 'title_font_size']:
            if field in data:
                size = data[field]
                if size < 10 or size > 500:
                    raise serializers.ValidationError({field: "Font size must be between 10 and 500"})
        
        return data
    
class CertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certificate
        fields = ["id", "seminar", "user", "file", "created_at"]
        read_only_fields = ["id", "created_at"]