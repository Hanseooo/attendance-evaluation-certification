from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

class Attendance(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendances")
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE, related_name="attendances")
    check_in = models.DateTimeField(null=True, blank=True)
    check_out = models.DateTimeField(null=True, blank=True)
    is_present = models.BooleanField(default=False)   # updated automatically when both times exist
    qr_token = models.CharField(max_length=128, blank=True, null=True)  # optional unique token per attendance
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "seminar")  # one attendance record per user per seminar

    def save(self, *args, **kwargs):
        # Mark is_present true when both check_in and check_out exist
        if self.check_in and self.check_out:
            self.is_present = True
        else:
            self.is_present = False
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} - {self.seminar}"
