from rest_framework import serializers
from backend.certificates.serializers import CertificateSerializer
from backend.evaluation.serializers import EvaluationSerializer
from backend.seminars.serializers import PlannedSeminarSerializer
from backend.users.models import CustomUser


class UserDashboardSerializer(serializers.ModelSerializer):
    attendances = serializers.AttendanceSerializer(many=True, read_only=True)
    planned_seminars = PlannedSeminarSerializer(many=True, read_only=True)
    evaluations = EvaluationSerializer(many=True, read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "id", "username", "first_name", "last_name", "email",
            "role", "is_email_verified",
            "attendances", "planned_seminars", "evaluations", "certificates"
        ]
