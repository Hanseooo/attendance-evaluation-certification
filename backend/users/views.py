from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import EmailMessage
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from .models import CustomUser
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

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


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()

        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # Don't reveal if email exists or not (security)
            return Response(
                {'message': 'If an account exists with this email, a password reset link has been sent.'},
                status=status.HTTP_200_OK
            )

        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        # Build reset URL
        reset_url = f"{settings.BASE_URL}/reset-password?uid={uid}&token={token}"

        # Render HTML email template
        html_message = render_to_string('emails/password_reset.html', {
            'user': user,
            'reset_url': reset_url,
            'site_name': 'The Podium',
        })

        # Configure Brevo API
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = settings.BREVO_API_KEY
        
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        
        # Prepare email
        sender = {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL
        }
        to = [{"email": user.email, "name": f"{user.first_name} {user.last_name}".strip() or user.username}]
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            sender=sender,
            subject='Reset Your Password - The Podium',
            html_content=html_message
        )

        try:
            api_response = api_instance.send_transac_email(send_smtp_email)
            print(f"✅ Password reset email sent successfully to {user.email}")
            print(f"   Brevo Message ID: {api_response.message_id}")
        except ApiException as e:
            print(f"   Failed to send password reset email to {user.email}")
            print(f"   Error: {e}")
            print(f"   Status: {e.status}")
            print(f"   Reason: {e.reason}")
            print(f"   Body: {e.body}")
            return Response(
                {'error': 'Failed to send reset email. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {'message': 'If an account exists with this email, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        if not all([uid, token, new_password]):
            return Response(
                {'error': 'All fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate password length
        if len(new_password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters long'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = CustomUser.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            return Response(
                {'error': 'Invalid reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate token
        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Invalid or expired reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password has been reset successfully'},
            status=status.HTTP_200_OK
        )