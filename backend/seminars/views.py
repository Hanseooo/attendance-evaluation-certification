# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Seminar, PlannedSeminar
from .serializers import SeminarSerializer, PlannedSeminarSerializer

# GET all seminars / POST new seminar
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Seminar
from .serializers import SeminarSerializer
from django.shortcuts import get_object_or_404

# List and create seminars
class SeminarListCreateAPIView(APIView):
    def get(self, request):
        seminars = Seminar.objects.all()
        serializer = SeminarSerializer(seminars, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SeminarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Retrieve, update, delete a specific seminar by ID
class SeminarDetailAPIView(APIView):
    def get_object(self, pk):               #helper function
        return get_object_or_404(Seminar, pk=pk) 

    def get(self, request, pk):
        seminar = self.get_object(pk)
        serializer = SeminarSerializer(seminar)
        return Response(serializer.data)

    def put(self, request, pk):
        seminar = self.get_object(pk)
        serializer = SeminarSerializer(seminar, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        seminar = self.get_object(pk)
        seminar.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# GET all planned seminars / POST new planned seminar
class PlannedSeminarAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        planned_seminars = PlannedSeminar.objects.filter(user=request.user)
        serializer = PlannedSeminarSerializer(planned_seminars, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PlannedSeminarSerializer(data=request.data)
        if serializer.is_valid():
            # pass user explicitly
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlannedSeminarDetailAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, pk, user):
        # ensures user can only access their own planned seminars
        return get_object_or_404(PlannedSeminar, pk=pk, user=user)

    def delete(self, request, pk):
        planned_seminar = self.get_object(pk, request.user)
        planned_seminar.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)