from django.db import models
from django.conf import settings
from seminars.models import Seminar
import uuid

User = settings.AUTH_USER_MODEL

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE, related_name="attendances")
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    is_present = models.BooleanField(default=False)
    qr_token_check_in = models.CharField(max_length=128, blank=True, null=True)
    qr_token_check_out = models.CharField(max_length=128, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "seminar")

    def save(self, *args, **kwargs):
        if self.check_in and self.check_out:
            self.is_present = True
        else:
            self.is_present = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} - {self.seminar}"
    

# models.py
class SeminarQRCode(models.Model):
    seminar = models.OneToOneField(Seminar, on_delete=models.CASCADE, related_name="qr_codes")
    qr_token_check_in = models.CharField(max_length=128, unique=True, blank=True, null=True)
    qr_token_check_out = models.CharField(max_length=128, unique=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

