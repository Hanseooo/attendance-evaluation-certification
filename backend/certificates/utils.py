from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.mail import EmailMessage
from django.conf import settings
import requests
import base64

from .models import CertificateTemplate


def generate_certificate(attendance):
    """Generate certificate WITHOUT saving to Cloudinary."""
    seminar = attendance.seminar
    user = attendance.user
    full_name = f"{user.first_name} {user.last_name}"

    # ✅ Try to get the seminar's custom template
    try:
        template = seminar.certificate_template
        use_default = False
    except CertificateTemplate.DoesNotExist:
        template = None
        use_default = True

    # ✅ Load image based on whether we're using default or custom template
    if use_default or not template:
        default_url = getattr(
            settings,
            "DEFAULT_CERTIFICATE_TEMPLATE_URL",
            "https://res.cloudinary.com/dcoc9jepl/image/upload/v1761304008/default_certificate_h09vbq.png"
        )
        response = requests.get(default_url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        
        # Default positioning - will be calculated for centering
        text_y = 550
        font_color = "black"
        font_size = 128
        font_path = "arial.ttf"
        center_text = True
    else:
        if template.template_image:
            response = requests.get(template.template_image.url)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content))
        else:
            default_url = getattr(settings, "DEFAULT_CERTIFICATE_TEMPLATE_URL",
                "https://res.cloudinary.com/dcoc9jepl/image/upload/v1761304008/default_certificate_h09vbq.png")
            response = requests.get(default_url)
            response.raise_for_status()
            img = Image.open(BytesIO(response.content))
        
        text_y = template.text_y
        font_color = getattr(template, "font_color", "black")
        font_size = getattr(template, "font_size", 128)
        font_path = getattr(template, "font_path", "arial.ttf")
        center_text = getattr(template, "centered", True)

    draw = ImageDraw.Draw(img)

    # ✅ Load font (with fallback)
    try:
        font = ImageFont.truetype(font_path, font_size)
    except OSError:
        font = ImageFont.load_default()

    # ✅ Calculate text position for centering
    if center_text:
        # Get the bounding box of the text
        bbox = draw.textbbox((0, 0), full_name, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Calculate centered x position
        img_width, img_height = img.size
        text_x = (img_width - text_width) // 2
        
        # If using custom template, respect the text_y from template
        if not use_default and hasattr(template, 'text_x'):
            # For custom templates, use the specified position
            text_x = template.text_x
    else:
        # Use fixed position from template
        text_x = template.text_x if hasattr(template, 'text_x') else 1000

    # ✅ Draw name (centered)
    draw.text((text_x, text_y), full_name, font=font, fill=font_color)

    # ✅ Save to BytesIO (in memory only)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    # ✅ Convert to base64 for frontend
    certificate_bytes = buffer.getvalue()
    certificate_base64 = base64.b64encode(certificate_bytes).decode('utf-8')
    certificate_data_url = f"data:image/png;base64,{certificate_base64}"

    # ✅ Track certificate generation without storing the file
    from .models import CertificateRecord
    CertificateRecord.objects.get_or_create(
        seminar=attendance.seminar,
        user=attendance.user,
        defaults={'email': attendance.user.email}
    )

    # ✅ Send email with attachment
    send_certificate_email(user, seminar, certificate_bytes)
    
    # ✅ Return base64 data URL (no storage used)
    return certificate_data_url


def send_certificate_email(user, seminar, certificate_bytes):
    """Send the generated certificate via email."""
    email = EmailMessage(
        subject=f"Your Certificate for {seminar.title}",
        body=(
            f"Good day {user.first_name},\n\n"
            f"Congratulations! Here is your certificate for attending {seminar.title}."
        ),
        to=[user.email],
    )

    # ✅ Attach the certificate bytes directly
    email.attach(
        filename=f"{seminar.title}_certificate.png",
        content=certificate_bytes,
        mimetype="image/png"
    )

    try:
        email.send()
    except Exception as e:
        print(f"Failed to send certificate email: {e}")