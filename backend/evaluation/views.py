from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Evaluation
from .serializers import EvaluationSerializer
from attendance.models import Attendance
from seminars.serializers import Seminar
from seminars.serializers import SeminarSerializer

class EvaluationViewSet(viewsets.ModelViewSet):
    """
    list: list evaluations for current user
    create: create evaluation for a seminar (user is taken from request)
    retrieve/update/partial_update/destroy allowed for owner only
    """
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # restrict to current user's evaluations
        return Evaluation.objects.filter(user=self.request.user).select_related("seminar")

    def perform_create(self, serializer):
        # ensure the user is eligible before creating (attendance.is_present must be true)
        seminar = serializer.validated_data.get("seminar")
        user = self.request.user

        attendance = Attendance.objects.filter(user=user, seminar=seminar, is_present=True).first()
        if not attendance:
            raise serializers.ValidationError({"detail": "User not eligible to evaluate this seminar (not present)."})
        # Make sure no existing completed evaluation exists (unique_together prevents duplicates but we want to allow update)
        existing = Evaluation.objects.filter(user=user, seminar=seminar).first()
        if existing:
            raise serializers.ValidationError({"detail": "Evaluation for this seminar already exists. Use update instead."})
        serializer.save(user=user)

    def perform_update(self, serializer):
        # allow update normally
        serializer.save()

# Endpoint to list seminars eligible for evaluation by current user
from rest_framework.views import APIView

class AvailableEvaluationsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get seminars the user attended
        attendances = Attendance.objects.filter(user=user, is_present=True).select_related("seminar")
        eligible = []

        for att in attendances:
            seminar = att.seminar
            evaluation = Evaluation.objects.filter(user=user, seminar=seminar).first()

            # Eligible if user hasn't completed evaluation
            if not evaluation or not evaluation.is_completed:
                seminar_data = SeminarSerializer(seminar).data
                eligible.append({
                    "seminar": seminar_data,
                    "evaluation_exists": evaluation is not None,
                    "evaluation_id": evaluation.id if evaluation else None,
                    "is_completed": evaluation.is_completed if evaluation else False,
                })

        return Response(eligible, status=200)
