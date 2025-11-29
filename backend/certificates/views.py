
# certificates/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from PIL import Image
from io import BytesIO
import requests
import cloudinary.uploader

from .models import CertificateTemplate
from .serializers import CertificateTemplateSerializer
from seminars.models import Seminar


# certificates/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from PIL import Image, ImageFont
from io import BytesIO
import requests
import cloudinary.uploader

from .models import CertificateTemplate
from .serializers import CertificateTemplateSerializer
from seminars.models import Seminar
import os

FONT_DIR = os.path.join(settings.BASE_DIR, "certificates", "fonts")

def load_font(font_name, size):
    try:
        return ImageFont.truetype(os.path.join(FONT_DIR, font_name), size)
    except Exception as e:
        print("⚠ Could not load font, using default:", font_name, e)
        return ImageFont.load_default()

class CertificateTemplateViewSet(viewsets.ModelViewSet):
    queryset = CertificateTemplate.objects.all()
    serializer_class = CertificateTemplateSerializer
    permission_classes = [IsAuthenticated]

    def _delete_old_cloudinary_image(self, template):
        """Delete old image from Cloudinary to save storage"""
        if template.template_image:
            try:
                # Extract public_id from Cloudinary URL
                # CloudinaryField has a public_id attribute
                if hasattr(template.template_image, 'public_id'):
                    public_id = template.template_image.public_id
                    result = cloudinary.uploader.destroy(public_id)
                    print(f"🗑️ Deleted old image from Cloudinary: {public_id}")
                    print(f"   Result: {result}")
                else:
                    print(f"⚠️ Could not extract public_id from template_image")
            except Exception as e:
                print(f"❌ Error deleting old image from Cloudinary: {e}")

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
            
            # ✅ If new image is being uploaded, delete the old one from Cloudinary
            if 'template_image' in request.FILES and template.template_image:
                self._delete_old_cloudinary_image(template)
            
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
                
                # Download and read image dimensions (into memory only)
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
        
        # ✅ If new image is being uploaded, delete the old one from Cloudinary
        if 'template_image' in request.FILES and instance.template_image:
            self._delete_old_cloudinary_image(instance)
        
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

    def destroy(self, request, *args, **kwargs):
        """Delete template and its Cloudinary image"""
        instance = self.get_object()
        
        # ✅ Delete image from Cloudinary before deleting template
        self._delete_old_cloudinary_image(instance)
        
        return super().destroy(request, *args, **kwargs)

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
            "name_font": "Arial.ttf",
            "name_color": "#000000",
            "title_x_percent": 50.0,
            "title_y_percent": 28.3,
            "title_font_size": 80,
            "title_font": "Arial.ttf",
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
            "name_font": "Arial.ttf",
            "name_color": "#000000",
            "title_x_percent": 50.0,
            "title_y_percent": 28.3,
            "title_font_size": 80,
            "title_font": "Arial.ttf",
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
        
# certificates/api.py (or certificates/views.py)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from attendance.models import Attendance
from evaluation.models import Evaluation
from certificates.services import CertificateService  # you will create this


# certificates/views.py (add this to your existing views)



from attendance.models import Attendance
from evaluation.models import Evaluation
from certificates.services import CertificateService


class ResendCertificateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, seminar_id, user_id):
        try:
            attendance = Attendance.objects.get(seminar_id=seminar_id, user_id=user_id)
        except Attendance.DoesNotExist:
            return Response(
                {"status": "error", "message": "Attendance not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        evaluation_done = Evaluation.objects.filter(
            seminar_id=seminar_id,
            user_id=user_id,
            is_completed=True
        ).exists()

        if not evaluation_done:
            return Response(
                {
                    "status": "error",
                    "message": "Cannot send certificate. Evaluation is not completed."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate certificate (automatically sends email)
        cert = CertificateService.generate(attendance)

        return Response({
            "status": "success",
            "message": f"Certificate sent to {attendance.user.email}",
            "certificate_base64": cert["base64"],
        })