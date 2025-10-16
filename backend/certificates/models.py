from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Certificate(models.Model):
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE, related_name="certificates")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="certificates")
    pdf = models.FileField(upload_to="certificates/")   # generated PDF
    sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("seminar", "user")

    def __str__(self):
        return f"Certificate {self.user} - {self.seminar}"
