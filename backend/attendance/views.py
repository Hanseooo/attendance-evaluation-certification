import uuid
import qrcode
from io import BytesIO
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from .models import Attendance, SeminarQRCode
from seminars.models import Seminar
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from PIL import Image, ImageDraw, ImageFont
from django.conf import settings
import base64
from attendance.serializers import AttendanceUserSerializer


base_url = settings.BASE_URL


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_present_users(request, seminar_id):
    """
    Returns users who are marked as present for a specific seminar.
    Only includes participants (not admins).
    """
    attendances = Attendance.objects.filter(
        seminar_id=seminar_id,
        is_present=True,
        user__role="participant"  # ✅ filters only participants
    ).select_related("user")

    users = [a.user for a in attendances]
    serializer = AttendanceUserSerializer(users, many=True)
    return Response(serializer.data, status=200)

# Helper function to generate QR code image with label
def generate_image_with_label(qr_img, label_text):
    try:
        font = ImageFont.truetype("arial.ttf", size=20)
    except IOError:
        font = ImageFont.load_default()

    label_text = label_text.replace(" ", "_")
    
    # Use textbbox instead of textsize
    draw = ImageDraw.Draw(qr_img)
    bbox = draw.textbbox((0, 0), label_text, font=font)  # Bounding box for text
    label_width = bbox[2] - bbox[0]  # width = right - left
    label_height = bbox[3] - bbox[1]  # height = bottom - top

    total_height = qr_img.height + label_height + 10
    new_img = Image.new("RGBA", (qr_img.width, total_height), "white")
    new_img.paste(qr_img, (0, 0))

    draw = ImageDraw.Draw(new_img)
    text_x = (qr_img.width - label_width) // 2
    text_y = qr_img.height + 5
    draw.text((text_x, text_y), label_text, fill="black", font=font)

    buffer = BytesIO()
    new_img.save(buffer, format="PNG")
    buffer.seek(0)

    return buffer

# Helper function to generate QR code image in memory
def generate_qr_code_image(url):
    qr_img = qrcode.make(url).convert("RGBA")
    
    # Save QR code image to a BytesIO buffer instead of saving it to a file
    buffer = BytesIO()
    qr_img.save(buffer, format="PNG")
    buffer.seek(0)
    
    return buffer

# API view to generate QR code and serve it directly as an image


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_qr_code(request, seminar_id):
    """
    Generate both check-in and check-out QR codes and return
    Base64 image data for display + downloadable URLs.
    """
    seminar = get_object_or_404(Seminar, id=seminar_id)

    # Generate or get existing QR tokens
    seminar_qr, created = SeminarQRCode.objects.get_or_create(seminar=seminar)

    if not seminar_qr.qr_token_check_in:
        seminar_qr.qr_token_check_in = str(uuid.uuid4())
    if not seminar_qr.qr_token_check_out:
        seminar_qr.qr_token_check_out = str(uuid.uuid4())

    seminar_qr.save()

    # Construct the full URLs for check-in and check-out
    check_in_url = f"{settings.BASE_URL}/attendance?action=check_in&seminar={seminar.id}&token={seminar_qr.qr_token_check_in}"
    check_out_url = f"{settings.BASE_URL}/attendance?action=check_out&seminar={seminar.id}&token={seminar_qr.qr_token_check_out}"

    # Helper: generate base64 QR image
    def make_qr_base64(url):
        qr_img = qrcode.make(url).convert("RGBA")
        buffer = BytesIO()
        qr_img.save(buffer, format="PNG")
        qr_bytes = buffer.getvalue()
        qr_b64 = base64.b64encode(qr_bytes).decode("utf-8")
        return f"data:image/png;base64,{qr_b64}"

    # Base64 images for inline rendering
    check_in_base64 = make_qr_base64(check_in_url)
    check_out_base64 = make_qr_base64(check_out_url)

    # Downloadable image URLs
    check_in_image_url = f"{settings.BASE_URL}/api/download-qr/{seminar.id}/check_in/"
    check_out_image_url = f"{settings.BASE_URL}/api/download-qr/{seminar.id}/check_out/"

    return Response({
        "seminar_id": seminar.id,
        "check_in": {
            "token": seminar_qr.qr_token_check_in,
            "url": check_in_url,
            "qr_image": check_in_base64,  # Base64 for rendering
            "download_url": check_in_image_url,  # for download
        },
        "check_out": {
            "token": seminar_qr.qr_token_check_out,
            "url": check_out_url,
            "qr_image": check_out_base64,
            "download_url": check_out_image_url,
        },
    })



def download_qr_code(request, seminar_id, action):
    seminar = get_object_or_404(Seminar, id=seminar_id)
    qr_codes, created = SeminarQRCode.objects.get_or_create(seminar=seminar)

    if action == "check_in":
        qr_token = qr_codes.qr_token_check_in
    elif action == "check_out":
        qr_token = qr_codes.qr_token_check_out
    else:
        return HttpResponse("Invalid action", status=400)

    url = f"{base_url}/attendance?action={action}&seminar={seminar.id}&token={qr_token}"
    qr_img = qrcode.make(url).convert("RGBA")

    qr_img_buffer = generate_image_with_label(qr_img, f"{seminar.title}_{action}")
    
    # Set the response with QR image
    response = HttpResponse(qr_img_buffer.getvalue(), content_type="image/png")
    response['Content-Disposition'] = f'attachment; filename="{seminar.title}_{action}.png"'
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_attendance(request, seminar_id, action):
    qr_token = request.data.get("qr_token")
    if not qr_token:
        return Response({"error": "QR token is required."}, status=400)

    seminar = get_object_or_404(Seminar, id=seminar_id)

    # Check if QR code is expired (1 hour after seminar end + 15 minutes grace period)
    grace_period = timedelta(minutes=15)
    expiration_time = seminar.date_end + timedelta(hours=1) + grace_period
    if timezone.now() > expiration_time:
        return Response({"error": "QR code expired."}, status=400)

    seminar_qr = get_object_or_404(SeminarQRCode, seminar=seminar)

    # Token validation
    if action == "check_in":
        if seminar_qr.qr_token_check_in != qr_token:
            return Response({"error": "Invalid QR token for check-in."}, status=400)
    elif action == "check_out":
        if seminar_qr.qr_token_check_out != qr_token:
            return Response({"error": "Invalid QR token for check-out."}, status=400)
    else:
        return Response({"error": "Invalid action."}, status=400)

    attendance, created = Attendance.objects.get_or_create(user=request.user, seminar=seminar)

    if action == "check_in":
        if attendance.check_in:
            return Response({"error": "Already checked in."}, status=400)
        attendance.check_in = timezone.now()
        attendance.save()
        return Response({"success": "Check-in successful."})

    elif action == "check_out":
        if attendance.check_out:
            return Response({"error": "Already checked out."}, status=400)
        attendance.check_out = timezone.now()
        attendance.save()
        return Response({"success": "Check-out successful."})
