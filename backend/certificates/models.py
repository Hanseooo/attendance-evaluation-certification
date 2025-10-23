# seminars/models.py (or certificates/models.py)
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

# certificates/models.py
from django.db import models
from django.conf import settings

class CertificateTemplate(models.Model):
    seminar = models.OneToOneField(
        "seminars.Seminar",
        on_delete=models.CASCADE,
        related_name="certificate_template"
    )
    template_image = models.ImageField(upload_to="certificate_templates/")
    text_x = models.PositiveIntegerField(default=0)
    text_y = models.PositiveIntegerField(default=0)
    centered = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Template for {self.seminar.title}"


class CertificateRecord(models.Model):
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True)
    email = models.EmailField()

    class Meta:
        unique_together = ("seminar", "user")


class Certificate(models.Model):
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to="certificates/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.seminar.title}"