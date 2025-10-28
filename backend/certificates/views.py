# from io import BytesIO
# from PIL import Image, ImageDraw, ImageFont
# from django.core.files.base import ContentFile
# from django.core.mail import EmailMessage
# from rest_framework import viewsets, status
# from rest_framework.response import Response
# from django.conf import settings
# import requests
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.decorators import action

# from .models import CertificateTemplate, Certificate
# from .serializers import CertificateTemplateSerializer
# from seminars.models import Seminar


# from io import BytesIO
# from PIL import Image, ImageDraw, ImageFont
# from django.core.files.base import ContentFile
# from django.core.mail import EmailMessage
# from django.conf import settings
# import requests

# from .models import CertificateTemplate, Certificate


# def generate_certificate(attendance):
#     seminar = attendance.seminar
#     user = attendance.user
#     full_name = f"{user.first_name} {user.last_name}"

#     # ✅ Safely get template, fallback to default
#     template = getattr(seminar, "certificate_template", None)

#     if not template:
#         default_url = getattr(
#             settings,
#             "DEFAULT_CERTIFICATE_TEMPLATE_URL",
#             "https://res.cloudinary.com/dcoc9jepl/image/upload/v1761304008/default_certificate_h09vbq.png"
#         )

#         # Create in-memory fallback template
#         template = CertificateTemplate(
#             seminar=seminar,
#             template_image=default_url,
#             text_x=290,
#             text_y=180,
#             default_used=True,
#         )

#     # ✅ Load template image (URL or file)
#     if isinstance(template.template_image, str):
#         response = requests.get(template.template_image)
#         response.raise_for_status()
#         img = Image.open(BytesIO(response.content))
#     else:
#         img = Image.open(template.template_image.path)

#     draw = ImageDraw.Draw(img)

#     # ✅ Load font (with fallback)
#     try:
#         font = ImageFont.truetype(
#             getattr(template, "font_path", "arial.ttf"),
#             getattr(template, "font_size", 48),
#         )
#     except OSError:
#         font = ImageFont.load_default()

#     # ✅ Draw name
#     draw.text(
#         (template.text_x, template.text_y),
#         full_name,
#         font=font,
#         fill=getattr(template, "font_color", "black"),
#     )

#     # ✅ Save to BytesIO
#     buffer = BytesIO()
#     img.save(buffer, format="PNG")
#     buffer.seek(0)

#     file_name = f"certificate_{user.username}_{seminar.id}.png"

#     # ✅ Avoid duplicate certificates
#     cert, _ = Certificate.objects.get_or_create(seminar=seminar, user=user)
#     cert.file.save(file_name, ContentFile(buffer.getvalue()), save=True)

#     attendance.certificate_generated = True
#     attendance.save(update_fields=["certificate_generated"])

#     send_certificate_email(cert)
#     return cert


# def send_certificate_email(certificate):
#     """Send the generated certificate to the user via email."""
#     user = certificate.user
#     seminar = certificate.seminar

#     email = EmailMessage(
#         subject=f"Your Certificate for {seminar.title}",
#         body=(
#             f"Good day {user.first_name},\n\n"
#             f"Congratulations! Here is your certificate for attending {seminar.title}."
#         ),
#         to=[user.email],
#     )

#     if certificate.file and hasattr(certificate.file, "path"):
#         email.attach_file(certificate.file.path)

#     email.send()



# class CertificateTemplateViewSet(viewsets.ModelViewSet):
#     queryset = CertificateTemplate.objects.all()
#     serializer_class = CertificateTemplateSerializer
#     permission_classes = [IsAuthenticated]

#     def create(self, request, *args, **kwargs):
#         """Create or update certificate template"""
#         seminar_id = request.data.get("seminar_id")
        
#         if not seminar_id:
#             return Response(
#                 {"error": "seminar_id is required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             seminar = Seminar.objects.get(id=seminar_id)
#         except Seminar.DoesNotExist:
#             return Response(
#                 {"error": "Seminar not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )

#         # Get or create template
#         try:
#             template = seminar.certificate_template
#             # Update existing template
#             serializer = self.get_serializer(template, data=request.data, partial=True)
#         except CertificateTemplate.DoesNotExist:
#             # Create new template
#             serializer = self.get_serializer(data=request.data)

#         serializer.is_valid(raise_exception=True)
#         template = serializer.save()

#         # If new image uploaded, update dimensions
#         if 'template_image' in request.FILES:
#             try:
#                 img = Image.open(template.template_image)
#                 template.template_width = img.width
#                 template.template_height = img.height
#                 template.default_used = False
#                 template.save()
#             except Exception as e:
#                 print(f"Error reading image dimensions: {e}")

#         return Response(
#             self.get_serializer(template).data,
#             status=status.HTTP_201_CREATED
#         )

#     def update(self, request, *args, **kwargs):
#         """Update existing template"""
#         partial = kwargs.pop('partial', True)
#         instance = self.get_object()
        
#         serializer = self.get_serializer(
#             instance,
#             data=request.data,
#             partial=partial
#         )
#         serializer.is_valid(raise_exception=True)
#         template = serializer.save()

#         # If new image uploaded, update dimensions
#         if 'template_image' in request.FILES:
#             try:
#                 img = Image.open(template.template_image)
#                 template.template_width = img.width
#                 template.template_height = img.height
#                 template.default_used = False
#                 template.save()
#             except Exception as e:
#                 print(f"Error reading image dimensions: {e}")

#         return Response(serializer.data)

#     @action(detail=False, methods=['get'])
#     def default_config(self, request):
#         """Return default template configuration"""
#         # Get dimensions of default template
#         default_url = settings.DEFAULT_CERTIFICATE_TEMPLATE_URL
#         try:
#             response = requests.get(default_url)
#             img = Image.open(BytesIO(response.content))
#             width, height = img.size
#         except:
#             width, height = 2000, 1414

#         return Response({
#             "template_url": default_url,
#             "template_width": width,
#             "template_height": height,
#             "name_x_percent": 50.0,
#             "name_y_percent": 38.9,
#             "name_font_size": 128,
#             "name_font": "arial.ttf",
#             "name_color": "#000000",
#             "title_x_percent": 50.0,
#             "title_y_percent": 28.3,
#             "title_font_size": 80,
#             "title_font": "arial.ttf",
#             "title_color": "#1a1a1a",
#         })

#     @action(detail=False, methods=['get'])
#     def by_seminar(self, request):
#         """Get template by seminar ID"""
#         seminar_id = request.query_params.get('seminar_id')
        
#         if not seminar_id:
#             return Response(
#                 {"error": "seminar_id parameter is required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         try:
#             seminar = Seminar.objects.get(id=seminar_id)
#             template = seminar.certificate_template
#             serializer = self.get_serializer(template)
#             return Response(serializer.data)
#         except Seminar.DoesNotExist:
#             return Response(
#                 {"error": "Seminar not found"},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#         except CertificateTemplate.DoesNotExist:
#             # Return default config if no template exists
#             return self.default_config(request)


# certificates/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from PIL import Image
from io import BytesIO
import requests

from .models import CertificateTemplate
from .serializers import CertificateTemplateSerializer
from seminars.models import Seminar


class CertificateTemplateViewSet(viewsets.ModelViewSet):
    queryset = CertificateTemplate.objects.all()
    serializer_class = CertificateTemplateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create or update certificate template"""
        seminar_id = request.data.get("seminar_id")
        
        if not seminar_id:
            return Response(
                {"error": "seminar_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            seminar = Seminar.objects.get(id=seminar_id)
        except Seminar.DoesNotExist:
            return Response(
                {"error": "Seminar not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get or create template
        try:
            template = seminar.certificate_template
            # Update existing template
            serializer = self.get_serializer(template, data=request.data, partial=True)
        except CertificateTemplate.DoesNotExist:
            # Create new template
            serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        template = serializer.save()

        # ✅ If new image uploaded, get dimensions from Cloudinary URL
        if 'template_image' in request.FILES or template.template_image:
            try:
                # Get the Cloudinary URL
                image_url = template.template_image.url
                
                # Download and read image dimensions
                response = requests.get(image_url)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
                
                template.template_width = img.width
                template.template_height = img.height
                template.default_used = False
                template.save(update_fields=['template_width', 'template_height', 'default_used'])
                
                print(f"✅ Image uploaded to Cloudinary: {image_url}")
                print(f"✅ Dimensions: {img.width}x{img.height}px")
            except Exception as e:
                print(f"❌ Error reading image dimensions: {e}")
                # Don't fail the request, just use defaults
                template.template_width = 2000
                template.template_height = 1414
                template.save(update_fields=['template_width', 'template_height'])

        return Response(
            self.get_serializer(template).data,
            status=status.HTTP_201_CREATED
        )

    def update(self, request, *args, **kwargs):
        """Update existing template"""
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial
        )
        serializer.is_valid(raise_exception=True)
        template = serializer.save()

        # ✅ If new image uploaded, update dimensions
        if 'template_image' in request.FILES or template.template_image:
            try:
                image_url = template.template_image.url
                response = requests.get(image_url)
                response.raise_for_status()
                img = Image.open(BytesIO(response.content))
                
                template.template_width = img.width
                template.template_height = img.height
                template.default_used = False
                template.save(update_fields=['template_width', 'template_height', 'default_used'])
                
                print(f"✅ Image updated in Cloudinary: {image_url}")
                print(f"✅ Dimensions: {img.width}x{img.height}px")
            except Exception as e:
                print(f"❌ Error reading image dimensions: {e}")

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def default_config(self, request):
        """Return default template configuration"""
        # Get dimensions of default template
        default_url = settings.DEFAULT_CERTIFICATE_TEMPLATE_URL
        try:
            response = requests.get(default_url)
            img = Image.open(BytesIO(response.content))
            width, height = img.size
        except:
            width, height = 2000, 1414

        return Response({
            "template_url": default_url,
            "template_width": width,
            "template_height": height,
            "name_x_percent": 50.0,
            "name_y_percent": 38.9,
            "name_font_size": 128,
            "name_font": "arial.ttf",
            "name_color": "#000000",
            "title_x_percent": 50.0,
            "title_y_percent": 28.3,
            "title_font_size": 80,
            "title_font": "arial.ttf",
            "title_color": "#1a1a1a",
        })

    @action(detail=False, methods=['get'])
    def by_seminar(self, request):
        """Get template by seminar ID"""
        seminar_id = request.query_params.get('seminar_id')
        
        if not seminar_id:
            return Response(
                {"error": "seminar_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            seminar = Seminar.objects.get(id=seminar_id)
            template = seminar.certificate_template
            serializer = self.get_serializer(template)
            return Response(serializer.data)
        except Seminar.DoesNotExist:
            return Response(
                {"error": "Seminar not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except CertificateTemplate.DoesNotExist:
            # Return default config if no template exists
            return self.default_config(request)