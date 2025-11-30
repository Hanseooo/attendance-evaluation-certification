from rest_framework import serializers
from .models import Attendance, AttendedSeminar
from seminars.serializers import SeminarSerializer
from users.serializers import UserSerializer
from users.models import CustomUser

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


class AttendanceUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "first_name", "last_name", "email"]


class AttendedSeminarSerializer(serializers.ModelSerializer):
    """Serializer for AttendedSeminar model"""
    seminar = SeminarSerializer(read_only=True)
    user_name = serializers.SerializerMethodField()
    duration_display = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendedSeminar
        fields = [
            'id',
            'user',
            'user_name',
            'seminar',
            'check_in_time',
            'check_out_time',
            'attended_at',
            'duration_minutes',
            'duration_display',
            'certificate_issued',
            'certificate_issued_at',
        ]
        read_only_fields = [
            'id', 'attended_at', 'duration_minutes', 
            'certificate_issued_at'
        ]
    
    def get_user_name(self, obj):
        """Get full name or username"""
        if obj.user.first_name and obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}"
        return obj.user.username
    
    def get_duration_display(self, obj):
        """Human-readable duration"""
        if not obj.duration_minutes:
            return "N/A"
        
        hours = obj.duration_minutes // 60
        minutes = obj.duration_minutes % 60
        
        if hours > 0:
            return f"{hours}h {minutes}m"
        return f"{minutes}m"