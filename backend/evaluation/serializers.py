from rest_framework import serializers
from .models import Evaluation
from seminars.serializers import SeminarSerializer
from users.serializers import UserSerializer
from seminars.models import Seminar
from certificates.models import Certificate


class EvaluationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    seminar = SeminarSerializer(read_only=True)
    seminar_id = serializers.PrimaryKeyRelatedField(
        queryset=Seminar.objects.all(),
        write_only=True,
        source="seminar"
    )
    certificate_url = serializers.SerializerMethodField()  # 👈 Add this

    class Meta:
        model = Evaluation
        fields = [
            "id",
            "seminar",
            "seminar_id",
            "user",
            "content_and_relevance",
            "presenters_effectiveness",
            "organization_and_structure",
            "materials_usefulness",
            "overall_satisfaction",
            "suggestions",
            "is_completed",
            "created_at",
            "certificate_url",  # 👈 Added here
        ]
        read_only_fields = ["id", "user", "seminar", "created_at", "certificate_url"]

    def get_certificate_url(self, obj):
        """Return the Cloudinary certificate URL if it exists."""
        cert = Certificate.objects.filter(user=obj.user, seminar=obj.seminar).first()
        return cert.file if cert else None

    def validate(self, attrs):
        """Ensure all rating fields are between 1 and 5."""
        rating_fields = [
            "content_and_relevance",
            "presenters_effectiveness",
            "organization_and_structure",
            "materials_usefulness",
            "overall_satisfaction",
        ]
        for field in rating_fields:
            value = attrs.get(field)
            if value is None:
                raise serializers.ValidationError({field: "This field is required."})
            if not (1 <= int(value) <= 5):
                raise serializers.ValidationError({field: "Must be between 1 and 5."})
        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        validated_data["user"] = request.user
        return super().create(validated_data)
