from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.conf import settings
import requests

from .models import CertificateTemplate, Certificate
from .serializers import CertificateTemplateSerializer
from seminars.models import Seminar


from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.files.base import ContentFile
from django.core.mail import EmailMessage
from django.conf import settings
import requests

from .models import CertificateTemplate, Certificate


def generate_certificate(attendance):
    seminar = attendance.seminar
    user = attendance.user
    full_name = f"{user.first_name} {user.last_name}"

    # ✅ Safely get template, fallback to default
    template = getattr(seminar, "certificate_template", None)

    if not template:
        default_url = getattr(
            settings,
            "DEFAULT_CERTIFICATE_TEMPLATE_URL",
            "https://res.cloudinary.com/dcoc9jepl/image/upload/v1761304008/default_certificate_h09vbq.png"
        )

        # Create in-memory fallback template
        template = CertificateTemplate(
            seminar=seminar,
            template_image=default_url,
            text_x=290,
            text_y=180,
            default_used=True,
        )

    # ✅ Load template image (URL or file)
    if isinstance(template.template_image, str):
        response = requests.get(template.template_image)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
    else:
        img = Image.open(template.template_image.path)

    draw = ImageDraw.Draw(img)

    # ✅ Load font (with fallback)
    try:
        font = ImageFont.truetype(
            getattr(template, "font_path", "arial.ttf"),
            getattr(template, "font_size", 48),
        )
    except OSError:
        font = ImageFont.load_default()

    # ✅ Draw name
    draw.text(
        (template.text_x, template.text_y),
        full_name,
        font=font,
        fill=getattr(template, "font_color", "black"),
    )

    # ✅ Save to BytesIO
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    file_name = f"certificate_{user.username}_{seminar.id}.png"

    # ✅ Avoid duplicate certificates
    cert, _ = Certificate.objects.get_or_create(seminar=seminar, user=user)
    cert.file.save(file_name, ContentFile(buffer.getvalue()), save=True)

    attendance.certificate_generated = True
    attendance.save(update_fields=["certificate_generated"])

    send_certificate_email(cert)
    return cert


def send_certificate_email(certificate):
    """Send the generated certificate to the user via email."""
    user = certificate.user
    seminar = certificate.seminar

    email = EmailMessage(
        subject=f"Your Certificate for {seminar.title}",
        body=(
            f"Good day {user.first_name},\n\n"
            f"Congratulations! Here is your certificate for attending {seminar.title}."
        ),
        to=[user.email],
    )

    if certificate.file and hasattr(certificate.file, "path"):
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

        existing = CertificateTemplate.objects.filter(seminar=seminar).first()
        if existing:
            existing.delete()

        has_image = "template_image" in request.FILES and request.FILES["template_image"]
        data = request.data.copy()

        if not has_image:
            data["template_image"] = None
            data["default_used"] = True

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        template = serializer.save()

        if not has_image:
            default_url = getattr(settings, "DEFAULT_CERTIFICATE_TEMPLATE_URL",
                      "https://res.cloudinary.com/dcoc9jepl/image/upload/v1761304008/default_certificate_h09vbq.png")
            template.template_image = default_url
            template.save(update_fields=["template_image"])

        return Response(self.get_serializer(template).data, status=status.HTTP_201_CREATED)

    def get_default_template(self, request):
        """Return default template data, optionally overriding coords from frontend."""
        text_x = int(request.query_params.get("text_x", 100))
        text_y = int(request.query_params.get("text_y", 100))
        centered = request.query_params.get("centered", "true").lower() == "true"

        default = {
            "template_url": "https://res.cloudinary.com/dcoc9jepl/image/upload/v1761304008/default_certificate_h09vbq.png",
            "text_x": text_x,
            "text_y": text_y,
            "centered": centered,
        }
        return Response(default)
