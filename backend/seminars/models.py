from django.db import models
from django.conf import settings
from django.utils import timezone
from certificates.models import CertificateTemplate

User = settings.AUTH_USER_MODEL


class Seminar(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    speaker = models.CharField(max_length=255, blank=True)
    venue = models.CharField(max_length=255, blank=True)
    date_start = models.DateTimeField()
    date_end = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    is_done = models.BooleanField(default=False)
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

