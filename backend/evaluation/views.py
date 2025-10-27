# evaluation/views.py
from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.decorators import action

from attendance.models import Attendance
from .models import Evaluation
from .serializers import EvaluationSerializer
from certificates.utils import generate_certificate
from seminars.serializers import SeminarSerializer
from seminars.models import Seminar
from users.serializers import UserSerializer
from django.db.models import Avg


class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Evaluation.objects.filter(user=self.request.user).select_related("seminar")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        seminar = serializer.validated_data.get("seminar")
        user = request.user

        attendance = Attendance.objects.filter(user=user, seminar=seminar, is_present=True).first()
        if not attendance:
            raise serializers.ValidationError({"detail": "You must have attended this seminar to evaluate it."})

        existing_eval = Evaluation.objects.filter(user=user, seminar=seminar).first()

        if existing_eval:
            if existing_eval.is_completed:
                raise serializers.ValidationError({"detail": "You have already completed this evaluation."})
            else:
                for field, value in serializer.validated_data.items():
                    setattr(existing_eval, field, value)
                existing_eval.is_completed = True
                existing_eval.save()

                # ✅ Generate certificate (returns base64 data URL)
                certificate_url = generate_certificate(attendance)
                response_data = EvaluationSerializer(existing_eval, context={"request": request}).data
                response_data["certificate_url"] = certificate_url
                return Response(response_data, status=status.HTTP_200_OK)

        evaluation = serializer.save(user=user, is_completed=True)

        

        # ✅ Generate certificate (returns base64 data URL)
        certificate_url = generate_certificate(attendance)
        response_data = EvaluationSerializer(evaluation, context={"request": request}).data
        response_data["certificate_url"] = certificate_url
        return Response(response_data, status=status.HTTP_201_CREATED)


class AvailableEvaluationsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        attendances = Attendance.objects.filter(user=user, is_present=True).select_related("seminar")
        evaluations_data = []

        for att in attendances:
            seminar = att.seminar
            evaluation = Evaluation.objects.filter(user=user, seminar=seminar).first()

            # ✅ Since we're not storing certificates, no certificate_url for available evaluations
            # They'll get it when they submit the evaluation

            # ✅ Serialize user and seminar
            seminar_data = SeminarSerializer(seminar, context={"request": request}).data
            user_data = UserSerializer(user, context={"request": request}).data

            if evaluation:
                eval_data = {
                    "id": evaluation.id,
                    "seminar": seminar_data,
                    "user": user_data,
                    "content_and_relevance": evaluation.content_and_relevance,
                    "presenters_effectiveness": evaluation.presenters_effectiveness,
                    "organization_and_structure": evaluation.organization_and_structure,
                    "materials_usefulness": evaluation.materials_usefulness,
                    "overall_satisfaction": evaluation.overall_satisfaction,
                    "suggestions": evaluation.suggestions,
                    "is_completed": evaluation.is_completed,
                    "created_at": evaluation.created_at.isoformat(),
                    "certificate_url": "",  # Empty since certificates are ephemeral
                }
            else:
                # Default placeholder for not-yet-started evaluation
                eval_data = {
                    "id": None,
                    "seminar": seminar_data,
                    "user": user_data,
                    "content_and_relevance": 0,
                    "presenters_effectiveness": 0,
                    "organization_and_structure": 0,
                    "materials_usefulness": 0,
                    "overall_satisfaction": 0,
                    "suggestions": "",
                    "is_completed": False,
                    "created_at": "",
                    "certificate_url": "",  # Empty since not yet generated
                }

            # Only include if evaluation is not completed
            if not evaluation or not evaluation.is_completed:
                evaluations_data.append(eval_data)

        return Response(evaluations_data, status=status.HTTP_200_OK)
    
class SeminarEvaluationAnalyticsAPIView(APIView):
    """
    Returns analytics for a seminar — includes:
    - Raw evaluations (for frontend rendering)
    - Average ratings per category
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, seminar_id):
        seminar = get_object_or_404(Seminar, id=seminar_id)
        evaluations = Evaluation.objects.filter(seminar=seminar, is_completed=True)

        serializer = EvaluationSerializer(evaluations, many=True)

        # Compute category averages
        averages = evaluations.aggregate(
            avg_content_and_relevance=Avg("content_and_relevance"),
            avg_presenters_effectiveness=Avg("presenters_effectiveness"),
            avg_organization_and_structure=Avg("organization_and_structure"),
            avg_materials_usefulness=Avg("materials_usefulness"),
            avg_overall_satisfaction=Avg("overall_satisfaction"),
        )

        # Clean out any binary/base64 fields if present
        cleaned_evaluations = []
        for e in serializer.data:
            e.pop("certificate_url", None)  # Remove large binary data
            cleaned_evaluations.append(e)

        return Response({
            "seminar_id": seminar.id,
            "seminar_title": seminar.title,
            "total_responses": evaluations.count(),
            "averages": averages,
            "evaluations": cleaned_evaluations,
        }, status=status.HTTP_200_OK)