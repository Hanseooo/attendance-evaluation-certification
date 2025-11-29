# certificates/services.py
import base64
from io import BytesIO
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings
from .utils import generate_certificate


class CertificateService:

    @staticmethod
    def generate(attendance):
        """
        Generates certificate using the template system from utils.py.
        Returns dict with base64 data URL for frontend display.
        
        Note: generate_certificate() already sends the email automatically.
        """
        certificate_data_url = generate_certificate(attendance)
        
        return {
            "base64": certificate_data_url
        }

    @staticmethod
    def email_certificate(cert, email, seminar_title, user_name):
        """
        Sends the certificate via email using Brevo API.
        
        NOTE: This is kept for backward compatibility but is typically
        not needed since generate_certificate() already sends the email.
        """
        # Configure Brevo API
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = settings.BREVO_API_KEY
        
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        
        # Extract base64 part (remove "data:image/png;base64," prefix if present)
        base64_str = cert["base64"]
        if base64_str.startswith("data:image/png;base64,"):
            base64_str = base64_str.split(",", 1)[1]
        
        # Prepare email
        sender = {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL
        }
        to = [{"email": email, "name": user_name}]
        
        html_content = f"""
        <p>Good day {user_name},</p>
        <p>Congratulations! Here is your certificate for attending '{seminar_title}'.</p>
        <p>Best regards,<br>The Podium</p>
        """
        
        attachment = [{
            "content": base64_str,
            "name": f"{seminar_title}_Certificate.png"
        }]
        
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=to,
            sender=sender,
            subject=f"Your Certificate for {seminar_title}",
            html_content=html_content,
            attachment=attachment
        )
        
        try:
            api_response = api_instance.send_transac_email(send_smtp_email)
            print(f"✅ Certificate email sent successfully to {email}")
            print(f"   Brevo Message ID: {api_response.message_id}")
        except ApiException as e:
            print(f"❌ Failed to send certificate email to {email}")
            print(f"   Error: {e}")
            print(f"   Status: {e.status}")
            print(f"   Reason: {e.reason}")
            print(f"   Body: {e.body}")
            raise