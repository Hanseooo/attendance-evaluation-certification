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
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    seminar = serializers.PrimaryKeyRelatedField(queryset=Seminar.objects.all())

    class Meta:
        model = PlannedSeminar
        fields = ["id", "user", "seminar", "created_at"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['seminar'] = SeminarSerializer(instance.seminar).data
        return rep


