from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import UserSerializer

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the current user's profile info."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """
        Allow partial updates of the authenticated user's info.
        Supports:
        - Profile field updates
        - Password change (via 'new_password1' and 'new_password2')
        """
        user = request.user
        data = request.data.copy()

        # 🟦 Handle password change if provided
        new_password1 = data.get("new_password1")
        new_password2 = data.get("new_password2")

        if new_password1 or new_password2:
            if new_password1 != new_password2:
                return Response(
                    {"new_password2": ["Passwords do not match."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                validate_password(new_password1, user)
            except ValidationError as e:
                return Response(
                    {"new_password2": list(e.messages)},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(new_password1)
            user.save()

            return Response(
                {"message": "Password updated successfully."},
                status=status.HTTP_200_OK,
            )

        # 🟩 Otherwise, update profile fields
        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {
                    "message": "Profile updated successfully.",
                    "user": serializer.data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        return self.patch(request)
