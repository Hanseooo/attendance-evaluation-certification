# certificates/models.py
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL


class CertificateTemplate(models.Model):
    seminar = models.OneToOneField("seminars.Seminar", on_delete=models.CASCADE, related_name="certificate_template")
    template_image = models.ImageField(upload_to="certificates/templates/", blank=True, null=True)
    text_x = models.IntegerField(default=290)
    text_y = models.IntegerField(default=180)
    centered = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    default_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Certificate Template for {self.seminar.title if self.seminar else 'No Seminar'}"


# ✅ You can remove Certificate and CertificateRecord models if you're not storing certificates
# But keep them if you want to track who received certificates (without storing the file)

class CertificateRecord(models.Model):
    """Track who received certificates without storing the actual file"""
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True)
    email = models.EmailField()

    class Meta:
        unique_together = ("seminar", "user")

    def __str__(self):
        return f"{self.user.username} - {self.seminar.title}"

class Certificate(models.Model):
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to="certificates/")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.seminar.title}"