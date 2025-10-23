from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from rest_framework import viewsets, status
from rest_framework.response import Response

from .models import CertificateTemplate, Certificate
from .serializers import CertificateTemplateSerializer
from seminars.models import Seminar


def generate_certificate(attendance):
    template = attendance.seminar.certificate_template
    user = attendance.user
    full_name = f"{user.first_name} {user.last_name}"

    # Load image
    img = Image.open(template.background_image.path)
    draw = ImageDraw.Draw(img)
    font = ImageFont.truetype(template.font_path, template.font_size)

    # Draw text
    draw.text(
        (template.text_x, template.text_y),
        full_name,
        font=font,
        fill=template.font_color
    )

    # Save to memory
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    file_name = f"certificate_{user.username}_{attendance.seminar.id}.png"

    # Create Certificate object
    cert = Certificate.objects.create(
        seminar=attendance.seminar,
        user=user,
    )
    cert.file.save(file_name, ContentFile(buffer.getvalue()))
    attendance.certificate_generated = True
    attendance.save()

    return cert


def send_certificate_email(certificate):
    user = certificate.user
    seminar = certificate.seminar

    email = EmailMessage(
        subject=f"Your Certificate for {seminar.title}",
        body=f"Good day {user.first_name},\n\nCongratulations! Here is your certificate for attending {seminar.title}.",
        to=[user.email],
    )
    email.attach_file(certificate.file.path)
    email.send()

class CertificateTemplateViewSet(viewsets.ModelViewSet):
    queryset = CertificateTemplate.objects.all()
    serializer_class = CertificateTemplateSerializer

    def create(self, request, *args, **kwargs):
        seminar_id = request.data.get("seminar")
        seminar = Seminar.objects.filter(id=seminar_id).first()
        if not seminar:
            return Response({"error": "Seminar not found"}, status=status.HTTP_404_NOT_FOUND)

        # If a template already exists, replace it
        existing = CertificateTemplate.objects.filter(seminar=seminar).first()
        if existing:
            existing.delete()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_default_template(self):
        """Return a placeholder if no template is uploaded."""
        default = {
            "template_url": "/static/default_certificate.png",
            "text_x": 100,
            "text_y": 100,
            "centered": True,
        }
        return Response(default)

