# certificates/utils.py
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
from django.core.mail import EmailMessage
from django.conf import settings

def generate_and_send_certificate(user, seminar):
    template = seminar.certificate_template
    image = Image.open(template.template_image.path)
    draw = ImageDraw.Draw(image)

    # name to display
    name = f"{user.first_name} {user.last_name}"
    font = ImageFont.truetype("arial.ttf", 80)  # adjust font or path

    text_w, text_h = draw.textsize(name, font=font)
    x = template.text_x - (text_w // 2 if template.centered else 0)
    y = template.text_y
    draw.text((x, y), name, fill="black", font=font)

    output = BytesIO()
    image.save(output, format="PNG")
    output.seek(0)

    # send email or print to console
    subject = f"Certificate for {seminar.title}"
    message = f"Hello {user.first_name}, here’s your seminar certificate!"
    email = EmailMessage(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
    email.attach(f"{seminar.title}_certificate.png", output.getvalue(), "image/png")

    try:
        email.send()
    except Exception:
        print(f"[DEV] Certificate sent to console for {user.email}")
