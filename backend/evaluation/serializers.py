from rest_framework import serializers
from .models import Evaluation
from seminars.serializers import SeminarSerializer
from users.serializers import UserSerializer

class EvaluationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    seminar = SeminarSerializer(read_only=True)

    class Meta:
        model = Evaluation
        fields = [
            "id", "seminar", "user", "rating", "comments",
            "completed", "created_at"
        ]

    def validate_rating(self, value):
        if not 1 <= value <= 10:
            raise serializers.ValidationError("Rating must be between 1 and 10.")
        return value
