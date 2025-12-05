# certificates/utils.py
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.mail import EmailMessage
from django.conf import settings
import requests
import base64

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException

from .models import CertificateTemplate, CertificateRecord


from django.conf import settings
import os

FONT_DIR = os.path.join(settings.BASE_DIR, "certificates", "fonts")

from pathlib import Path
from PIL import ImageFont

def _load_font(font_name, font_size):
    # Move up 2 levels: utils.py → certificates → backend
    project_root = Path(__file__).resolve().parent.parent   # /backend

    # Correct path: /backend/certificates/fonts/<font_name>
    font_path = project_root / "certificates" / "fonts" / font_name

    if not font_path.exists():
        print(f"[ERROR] Font not found: {font_path}")
        return ImageFont.load_default()

    try:
        return ImageFont.truetype(str(font_path), font_size)
    except Exception as e:
        print(f"[ERROR] Failed to load font {font_path}: {e}")
        return ImageFont.load_default()

def generate_certificate(attendance):
    """Generate certificate WITHOUT saving to Cloudinary."""
    seminar = attendance.seminar
    user = attendance.user
    full_name = f"{user.first_name} {user.last_name}".strip() or user.username

    # Try to get the seminar's custom template
    try:
        template = seminar.certificate_template
        use_default = False
    except CertificateTemplate.DoesNotExist:
        template = None
        use_default = True

    # Load image
    if use_default or not template or not template.template_image:
        default_url = getattr(
            settings,
            "DEFAULT_CERTIFICATE_TEMPLATE_URL",
            "https://res.cloudinary.com/dcoc9jepl/image/upload/v1761304008/default_certificate_h09vbq.png"
        )
        response = requests.get(default_url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        img_width, img_height = img.size

        if template:
            name_x = int((template.name_x_percent / 100) * img_width)
            name_y = int((template.name_y_percent / 100) * img_height)
            title_x = int((template.title_x_percent / 100) * img_width)
            title_y = int((template.title_y_percent / 100) * img_height)

            name_config = {
                'x': name_x,
                'y': name_y,
                'font_size': template.name_font_size,
                'font_path': template.name_font,
                'color': template.name_color,
            }
            title_config = {
                'x': title_x,
                'y': title_y,
                'font_size': template.title_font_size,
                'font_path': template.title_font,
                'color': template.title_color,
            }
        else:
            name_config = {
                'x': img_width // 2,
                'y': int(img_height * 0.44),
                'font_size': 128,
                'font_path': "Arial.ttf",
                'color': "#000000"
            }
            title_config = {
                'x': img_width // 2,
                'y': int(img_height * 0.65),
                'font_size': 80,
                'font_path': "Arial.ttf",
                'color': "#1a1a1a"
            }
    else:
        response = requests.get(template.template_image.url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        img_width, img_height = img.size
        
        name_x = int((template.name_x_percent / 100) * img_width)
        name_y = int((template.name_y_percent / 100) * img_height)
        title_x = int((template.title_x_percent / 100) * img_width)
        title_y = int((template.title_y_percent / 100) * img_height)
        
        name_config = {
            'x': name_x,
            'y': name_y,
            'font_size': template.name_font_size,
            'font_path': template.name_font,
            'color': template.name_color,
        }
        title_config = {
            'x': title_x,
            'y': title_y,
            'font_size': template.title_font_size,
            'font_path': template.title_font,
            'color': template.title_color,
        }

    draw = ImageDraw.Draw(img)

    # Draw seminar title (if enabled)
    should_show_title = template.show_title if template else True
    
    if should_show_title:
        title_font = _load_font(title_config['font_path'], title_config['font_size'])
        title_text = seminar.title
        
        # ✅ Use anchor='mt' for accurate centering
        draw.text(
            (title_config['x'], title_config['y']),
            title_text,
            font=title_font,
            fill=title_config['color'],
            anchor='mm' 
        )
        
        print(f"Title: '{title_text}' at ({title_config['x']}, {title_config['y']}) [centered]")

    # Draw participant name (always shown)
    name_font = _load_font(name_config['font_path'], name_config['font_size'])
    
    # ✅ Use anchor='mm' for accurate centering
    draw.text(
        (name_config['x'], name_config['y']),
        full_name,
        font=name_font,
        fill=name_config['color'],
        anchor='mm' 
    )
    
    print(f"📍 Name: '{full_name}' at ({name_config['x']}, {name_config['y']}) [centered]")

    # Save to BytesIO
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    certificate_bytes = buffer.getvalue()
    certificate_base64 = base64.b64encode(certificate_bytes).decode('utf-8')
    certificate_data_url = f"data:image/png;base64,{certificate_base64}"

    # Track certificate generation
    CertificateRecord.objects.get_or_create(
        seminar=attendance.seminar,
        user=attendance.user,
        defaults={'email': attendance.user.email}
    )

    # Send email
    send_certificate_email(user, seminar, certificate_bytes)
    
    return certificate_data_url



def send_certificate_email(user, seminar, certificate_bytes):
    """Send the generated certificate via Brevo API."""
    
    # Configure Brevo API
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY
    
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
    
    # Convert bytes to base64 for Brevo API
    certificate_base64 = base64.b64encode(certificate_bytes).decode('utf-8')
    
    # Prepare email
    subject = f"Your Certificate for {seminar.title}"
    sender = {
        "name": settings.BREVO_SENDER_NAME,
        "email": settings.BREVO_SENDER_EMAIL
    }
    to = [{"email": user.email, "name": f"{user.first_name} {user.last_name}".strip() or user.username}]
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            h1 {{ color: #FFFFFF;}}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #800000, #ff0000, #800000); padding: 30px; text-align: center; color: white; }}
            .content {{ padding: 30px; background: #f9f9f9; }}
            .footer {{ padding: 20px; text-align: center; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>HCDC The Podium</h1>
            </div>
            <div class="content">
                <p>Good day {user.first_name or user.username},</p>
                <p>Congratulations! 🎉</p>
                <p>Your certificate for attending <strong>"{seminar.title}"</strong> is now ready and attached to this email.</p>
                <p>Thank you for your participation!</p>
            </div>
            <div class="footer">
                <p>Best regards,<br>The Podium</p>
                <p>This is an automated message, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Attachment
    attachment = [{
        "content": certificate_base64,
        "name": f"{seminar.title}_Certificate.png"
    }]
    
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=to,
        sender=sender,
        subject=subject,
        html_content=html_content,
        attachment=attachment
    )
    
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"   Certificate email sent successfully to {user.email}")
        print(f"   Brevo Message ID: {api_response.message_id}")
    except ApiException as e:
        print(f"   Failed to send certificate email to {user.email}")
        print(f"   Error: {e}")
        print(f"   Status: {e.status}")
        print(f"   Reason: {e.reason}")
        print(f"   Body: {e.body}")
        raise
