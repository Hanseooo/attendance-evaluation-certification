from rest_framework import serializers
from .models import Evaluation
from seminars.serializers import SeminarSerializer
from users.serializers import UserSerializer

#NOTE: seminar_id is used on write so frontend sends { seminar_id: 2, content_and_relevance: 5, ... }

class EvaluationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    seminar = SeminarSerializer(read_only=True)  # may be nested; you can change to PrimaryKeyRelatedField if preferred
    seminar_id = serializers.PrimaryKeyRelatedField(
        queryset=__import__("seminars.models", fromlist=["Seminar"]).Seminar.objects.all(),
        write_only=True,
        source="seminar"
    )

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
        ]
        read_only_fields = ["id", "user", "seminar", "created_at"]

    def validate_rating_field(self, value, field_name):
        if value is None:
            raise serializers.ValidationError(f"{field_name} is required.")
        if not 1 <= value <= 5:
            raise serializers.ValidationError(f"{field_name} must be between 1 and 5.")
        return value

    def validate(self, attrs):
        # validate each rating field present and in 1..5
        rating_fields = {
            "content_and_relevance": "Content and relevance",
            "presenters_effectiveness": "Presenter's effectiveness",
            "organization_and_structure": "Organization and structure",
            "materials_usefulness": "Usefulness of materials/resources",
            "overall_satisfaction": "Overall satisfaction",
        }

        for field, label in rating_fields.items():
            # value may be nested inside attrs or coming from instance when partial updates,
            # so use self.initial_data to check presence on create
            value = attrs.get(field, None)
            # If creating, require fields; if partial update, only validate provided ones
            if not self.partial and value is None:
                raise serializers.ValidationError({field: f"{label} is required."})
            if value is not None:
                if not 1 <= int(value) <= 5:
                    raise serializers.ValidationError({field: f"{label} must be between 1 and 5."})

        return attrs

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user
        validated_data["user"] = user
        eval_obj = super().create(validated_data)
        return eval_obj

    def update(self, instance, validated_data):
        # allow partial updates
        return super().update(instance, validated_data)


