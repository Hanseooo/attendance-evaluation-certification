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
from django.utils import timezone
from datetime import timedelta
from .models import EmailChangeRequest


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
    

class RequestEmailChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_email = request.data.get('new_email', '').strip().lower()
        
        if not new_email:
            return Response(
                {'error': 'New email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate email format
        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError as DjangoValidationError
        try:
            validate_email(new_email)
        except DjangoValidationError:
            return Response(
                {'error': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if new email is same as current
        if new_email == request.user.email:
            return Response(
                {'error': 'New email must be different from current email'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email is already taken by another user
        if CustomUser.objects.filter(email=new_email).exclude(pk=request.user.pk).exists():
            return Response(
                {'error': 'This email is already in use by another account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Rate limiting: Check for recent requests (60 seconds cooldown)
        recent_request = EmailChangeRequest.objects.filter(
            user=request.user,
            created_at__gte=timezone.now() - timedelta(seconds=60)
        ).first()
        
        if recent_request:
            seconds_remaining = 60 - (timezone.now() - recent_request.created_at).seconds
            return Response(
                {'error': f'Please wait {seconds_remaining} seconds before requesting a new code'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        # Invalidate any previous unused requests for this user
        EmailChangeRequest.objects.filter(
            user=request.user,
            is_used=False
        ).update(is_used=True)
        
        # Create new verification request
        email_change_request = EmailChangeRequest.objects.create(
            user=request.user,
            new_email=new_email
        )
        
        # Render HTML email template
        html_message = render_to_string('emails/email_change_verification.html', {
            'user': request.user,
            'new_email': new_email,
            'verification_code': email_change_request.verification_code,
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
        to = [{"email": new_email, "name": f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username}]
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            sender=sender,
            subject='Verify Your New Email - The Podium',
            html_content=html_message
        )
        
        try:
            api_response = api_instance.send_transac_email(send_smtp_email)
            print(f"Email verification code sent successfully to {new_email}")
            print(f"   Brevo Message ID: {api_response.message_id}")
            print(f"   Verification Code: {email_change_request.verification_code}")  # For testing
        except ApiException as e:
            print(f"Failed to send verification email to {new_email}")
            print(f" Error: {e}")
            # Clean up the failed request
            email_change_request.delete()
            return Response(
                {'error': 'Failed to send verification email. Please try again later.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {
                'message': 'Verification code sent to your new email address',
                'expires_in': 3600  # expiration
            },
            status=status.HTTP_200_OK
        )


class VerifyEmailChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        new_email = request.data.get('new_email', '').strip().lower()
        code = request.data.get('code', '').strip()
        
        if not new_email or not code:
            return Response(
                {'error': 'Both new email and verification code are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find the most recent valid request
        try:
            email_change_request = EmailChangeRequest.objects.filter(
                user=request.user,
                new_email=new_email,
                is_used=False
            ).latest('created_at')
        except EmailChangeRequest.DoesNotExist:
            return Response(
                {'error': 'No pending email change request found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if expired
        if email_change_request.is_expired():
            return Response(
                {'error': 'Verification code has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check attempts limit
        if email_change_request.attempts >= 5:
            return Response(
                {'error': 'Maximum verification attempts exceeded. Please request a new code.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Increment attempts
        email_change_request.attempts += 1
        email_change_request.save()
        
        # Verify code
        if email_change_request.verification_code != code:
            remaining_attempts = 5 - email_change_request.attempts
            return Response(
                {
                    'error': 'Invalid verification code',
                    'remaining_attempts': remaining_attempts
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Double-check email is still available
        if CustomUser.objects.filter(email=new_email).exclude(pk=request.user.pk).exists():
            return Response(
                {'error': 'This email is already in use by another account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Store old email for notification
        old_email = request.user.email
        
        # Update user email
        request.user.email = new_email
        request.user.save()
        
        # Mark request as used
        email_change_request.is_used = True
        email_change_request.save()
        
        # Send notification to old email
        html_notification = render_to_string('emails/email_change_notification.html', {
            'user': request.user,
            'new_email': new_email,
        })
        
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = settings.BREVO_API_KEY
        
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        
        sender = {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL
        }
        to = [{"email": old_email, "name": f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username}]
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            sender=sender,
            subject='Your Email Address Has Been Changed - The Podium',
            html_content=html_notification
        )
        
        try:
            api_instance.send_transac_email(send_smtp_email)
            print(f"Email change notification sent to old email: {old_email}")
        except ApiException as e:
            print(f"Failed to send notification to old email: {old_email}")
            print(f"Error: {e}")
            # Don't fail the request if notification fails
        
        # Return updated user data
        serializer = UserSerializer(request.user)
        return Response(
            {
                'message': 'Email address updated successfully',
                'user': serializer.data
            },
            status=status.HTTP_200_OK
        )