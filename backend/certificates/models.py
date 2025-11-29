# certificates/models.py
from django.db import models
from django.conf import settings
from cloudinary.models import CloudinaryField

User = settings.AUTH_USER_MODEL

# Web-safe fonts
FONT_CHOICES = [
    ('Arial.ttf', 'Arial'),
    ('Poppins-Regular.ttf', 'Poppins'),
    ('Poppins-Bold.ttf', 'Poppins Bold'),
    ('Roboto-Regular.ttf', 'Roboto'),
    ('Roboto-Bold.ttf', 'Roboto Bold'),
    ('Helvetica.ttf', 'Helvetica'),
    ('Helvetica-Bold.ttf', 'Helvetica Bold'),
    ('Calibri.ttf', 'Calibri'),
    ('Calibri-Bold.ttf', 'Calibri Bold'),
    ('EBGaramond-Regular.ttf', 'EB Garamond'),
    ('Baskervville-Regular.ttf', 'Baskervville'),
    ('Times-New-Roman.ttf', 'Times New Roman'),
    ('Georgia.ttf', 'Georgia'),
    ('GreatVibes-Regular.ttf', 'Great Vibes'),
    ('AlexBrush-Regular.ttf', 'Alex Brush'),
]


class CertificateTemplate(models.Model):
    seminar = models.OneToOneField(
        "seminars.Seminar", 
        on_delete=models.CASCADE, 
        related_name="certificate_template"
    )
    
    # ✅ Use CloudinaryField instead of ImageField
    template_image = CloudinaryField(
        'image',
        folder='certificates/templates',
        blank=True,
        null=True,
        resource_type='image',
    )
    
    # Template dimensions
    template_width = models.IntegerField(default=2000)
    template_height = models.IntegerField(default=1414)
    
    # Name placeholder settings (percentages)
    name_x_percent = models.FloatField(default=50.0)
    name_y_percent = models.FloatField(default=38.9)
    name_font_size = models.IntegerField(default=128)
    name_font = models.CharField(max_length=50, choices=FONT_CHOICES, default='arial.ttf')
    name_color = models.CharField(max_length=20, default='#000000')
    
    # Title placeholder settings (percentages)
    title_x_percent = models.FloatField(default=50.0)
    title_y_percent = models.FloatField(default=28.3)
    title_font_size = models.IntegerField(default=80)
    title_font = models.CharField(max_length=50, choices=FONT_CHOICES, default='arial.ttf')
    title_color = models.CharField(max_length=20, default='#1a1a1a')
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    default_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Certificate Template for {self.seminar.title if self.seminar else 'No Seminar'}"

    @property
    def template_image_url(self):
        """Get the Cloudinary URL"""
        if self.template_image:
            return self.template_image.url
        return settings.DEFAULT_CERTIFICATE_TEMPLATE_URL

    class Meta:
        verbose_name = "Certificate Template"
        verbose_name_plural = "Certificate Templates"


class CertificateRecord(models.Model):
    """Track who received certificates without storing the actual file"""
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True)
    email = models.EmailField()

    class Meta:
        unique_together = ("seminar", "user")
        verbose_name = "Certificate Record"
        verbose_name_plural = "Certificate Records"

    def __str__(self):
        return f"{self.user.username} - {self.seminar.title}"
    

class Certificate(models.Model):
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = CloudinaryField('image', folder='certificates/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('seminar', 'user')
        verbose_name = "Certificate"
        verbose_name_plural = "Certificates"

    def __str__(self):
        return f"{self.user} - {self.seminar.title}"
