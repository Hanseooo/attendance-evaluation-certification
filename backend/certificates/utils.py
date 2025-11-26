# certificates/utils.py
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.mail import EmailMessage
from django.conf import settings
import requests
import base64

from .models import CertificateTemplate, CertificateRecord


def generate_certificate(attendance):
    """Generate certificate WITHOUT saving to Cloudinary."""
    seminar = attendance.seminar
    user = attendance.user
    full_name = f"{user.first_name} {user.last_name}".strip() or user.username

    # ✅ Try to get the seminar's custom template
    try:
        template = seminar.certificate_template
        use_default = False
    except CertificateTemplate.DoesNotExist:
        template = None
        use_default = True

    # ✅ Load image
    if use_default or not template or not template.template_image:
        # Use default template
        default_url = getattr(
            settings,
            "DEFAULT_CERTIFICATE_TEMPLATE_URL",
            "https://res.cloudinary.com/dcoc9jepl/image/upload/v1761304008/default_certificate_h09vbq.png"
        )
        response = requests.get(default_url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        
        # Default settings (percentages converted to pixels)
        img_width, img_height = img.size
        
        if template:
            # Use saved percentages
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
            # Absolute defaults
            name_config = {
                'x': img_width // 2,
                'y': int(img_height * 0.39),  # 39%
                'font_size': 128,
                'font_path': 'arial.ttf',
                'color': '#000000',
            }
            title_config = {
                'x': img_width // 2,
                'y': int(img_height * 0.60),  # 60%
                'font_size': 80,
                'font_path': 'arial.ttf',
                'color': '#1a1a1a',
            }
    else:
        # Use custom template with saved percentages
        response = requests.get(template.template_image.url)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content))
        
        img_width, img_height = img.size
        
        # Convert percentages to actual pixels
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
    img_width, img_height = img.size

    # ✅ Draw seminar title (centered horizontally around x position)
    title_font = _load_font(title_config['font_path'], title_config['font_size'])
    title_text = seminar.title
    
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x_centered = title_config['x'] - (title_width // 2)
    
    draw.text(
        (title_x_centered, title_config['y']),
        title_text,
        font=title_font,
        fill=title_config['color']
    )

    # ✅ Draw participant name (centered horizontally around x position)
    name_font = _load_font(name_config['font_path'], name_config['font_size'])
    
    name_bbox = draw.textbbox((0, 0), full_name, font=name_font)
    name_width = name_bbox[2] - name_bbox[0]
    name_x_centered = name_config['x'] - (name_width // 2)
    
    draw.text(
        (name_x_centered, name_config['y']),
        full_name,
        font=name_font,
        fill=name_config['color']
    )

    # ✅ Save to BytesIO (in memory only)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    # ✅ Convert to base64 for frontend
    certificate_bytes = buffer.getvalue()
    certificate_base64 = base64.b64encode(certificate_bytes).decode('utf-8')
    certificate_data_url = f"data:image/png;base64,{certificate_base64}"

    # ✅ Track certificate generation
    CertificateRecord.objects.get_or_create(
        seminar=attendance.seminar,
        user=attendance.user,
        defaults={'email': attendance.user.email}
    )

    # ✅ Send email with attachment
    send_certificate_email(user, seminar, certificate_bytes)
    
    return certificate_data_url


def _load_font(font_path, font_size):
    """Helper to load font with fallback"""
    try:
        return ImageFont.truetype(font_path, font_size)
    except (OSError, IOError):
        # Try without .ttf extension
        try:
            font_name = font_path.replace('.ttf', '')
            return ImageFont.truetype(font_name, font_size)
        except (OSError, IOError):
            # Final fallback to default font
            print(f"Warning: Could not load font {font_path}, using default")
            return ImageFont.load_default()


def send_certificate_email(user, seminar, certificate_bytes):
    """Send the generated certificate via email."""
    email = EmailMessage(
        subject=f"Your Certificate for {seminar.title}",
        body=(
            f"Good day {user.first_name or user.username},\n\n"
            f"Congratulations! Here is your certificate for attending '{seminar.title}'.\n\n"
            f"Best regards,\n"
            f"The Podium"
        ),
        to=[user.email],
    )

    email.attach(
        filename=f"{seminar.title}_Certificate.png",
        content=certificate_bytes,
        mimetype="image/png"
    )

    try:
        email.send()
    except Exception as e:
        print(f"Failed to send certificate email to {user.email}: {e}")