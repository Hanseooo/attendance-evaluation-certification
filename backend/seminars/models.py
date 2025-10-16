from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class CertificateTemplate(models.Model):
    name = models.CharField(max_length=120)
    file = models.FileField(upload_to="certificate_templates/")  # html/pdf/image
    # optionally store template metadata
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Seminar(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    speaker = models.CharField(max_length=255, blank=True)
    venue = models.CharField(max_length=255, blank=True)
    date_start = models.DateTimeField()
    date_end = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    is_done = models.BooleanField(default=False)   # your 'isdone'
    certificate_template = models.ForeignKey(CertificateTemplate, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_start']

    def __str__(self):
        return self.title
    

class PlannedSeminar(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="planned_seminars")
    seminar = models.ForeignKey(Seminar, on_delete=models.CASCADE, related_name="planned_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "seminar")

    def __str__(self):
        return f"{self.user} plans to attend {self.seminar}"

