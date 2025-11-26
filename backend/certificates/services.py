import base64
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.mail import EmailMessage
from .utils import generate_certificate


class CertificateService:

    @staticmethod
    def generate(attendance):
        """
        Generates certificate using the template system from utils.py.
        Returns dict with base64 data URL for frontend display.
        
        Note: generate_certificate() already sends the email automatically.
        """
        # Use the actual template-based certificate generation
        certificate_data_url = generate_certificate(attendance)
        
        # certificate_data_url is already in format: "data:image/png;base64,..."
        # Perfect for frontend <img src={certificate_base64} />
        
        return {
            "base64": certificate_data_url
        }

    @staticmethod
    def email_certificate(cert, email):
        """
        Sends the certificate via email.
        
        NOTE: This is kept for backward compatibility but is typically
        not needed since generate_certificate() already sends the email.
        """
        # Extract base64 part (remove "data:image/png;base64," prefix if present)
        base64_str = cert["base64"]
        if base64_str.startswith("data:image/png;base64,"):
            base64_str = base64_str.split(",", 1)[1]
        
        # Convert base64 back to image bytes
        image_data = base64.b64decode(base64_str)
        
        message = EmailMessage(
            subject="Your Seminar Certificate",
            body="Attached is your certificate.",
            to=[email],
        )
        message.attach("certificate.png", image_data, "image/png")
        message.send(fail_silently=False)