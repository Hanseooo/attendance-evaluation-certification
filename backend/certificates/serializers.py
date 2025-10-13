from rest_framework import serializers
from .models import Certificate
from seminars.serializers import SeminarSerializer
from users.serializers import UserSerializer

class CertificateSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    seminar = SeminarSerializer(read_only=True)

    class Meta:
        model = Certificate
        fields = [
            "id", "seminar", "user", "pdf", "sent",
            "sent_at", "created_at"
        ]
