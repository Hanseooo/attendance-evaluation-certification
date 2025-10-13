from rest_framework import serializers
from .models import Attendance
from seminars.serializers import SeminarSerializer
from users.serializers import UserSerializer

class AttendanceSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    seminar = SeminarSerializer(read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id", "user", "seminar", "check_in", "check_out",
            "is_present", "qr_token", "created_at", "updated_at"
        ]

class AttendanceUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = ["check_in", "check_out"]
