from django.db import models
from django.conf import settings
from seminars.models import Seminar
from django.db.models.signals import post_save
from django.dispatch import receiver
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

class AttendedSeminar(models.Model):
    """
    Tracks users who successfully attended seminars (marked as present).
    Automatically created when Attendance.is_present becomes True.
    """
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name="attended_seminars"
    )
    seminar = models.ForeignKey(
        Seminar, 
        on_delete=models.CASCADE, 
        related_name="attendees"
    )
    
    # Timestamps
    check_in_time = models.DateTimeField(
        help_text="When the user checked in"
    )
    check_out_time = models.DateTimeField(
        help_text="When the user checked out"
    )
    attended_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this attendance record was confirmed"
    )
    
    # Additional useful fields
    duration_minutes = models.PositiveIntegerField(
        null=True, 
        blank=True,
        help_text="Calculated duration of attendance in minutes"
    )
    
    # Certificate tracking
    certificate_issued = models.BooleanField(
        default=False,
        help_text="Whether a certificate has been issued for this attendance"
    )
    certificate_issued_at = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="When the certificate was issued"
    )
    
    class Meta:
        unique_together = ("user", "seminar")
        ordering = ['-attended_at']
        verbose_name = "Attended Seminar"
        verbose_name_plural = "Attended Seminars"
        indexes = [
            models.Index(fields=['user', 'seminar']),
            models.Index(fields=['seminar', 'attended_at']),
        ]

    def save(self, *args, **kwargs):
        # Calculate duration if both timestamps exist
        if self.check_in_time and self.check_out_time:
            delta = self.check_out_time - self.check_in_time
            self.duration_minutes = int(delta.total_seconds() / 60)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} attended {self.seminar.title}"

    @property
    def is_eligible_for_certificate(self):
        """
        Check if user is eligible for a certificate.
        Can add additional logic here (e.g., minimum duration requirement)
        """
        # Example: Must have stayed at least 30 minutes
        if self.duration_minutes and self.duration_minutes >= 30:
            return True
        return False


# Signal to automatically create AttendedSeminar when Attendance.is_present becomes True
@receiver(post_save, sender=Attendance)
def create_attended_seminar(sender, instance, created, **kwargs):
    """
    Automatically create or update AttendedSeminar record when 
    an Attendance record is marked as present.
    """
    if instance.is_present and instance.check_in and instance.check_out:
        # Check if AttendedSeminar already exists
        attended, created = AttendedSeminar.objects.get_or_create(
            user=instance.user,
            seminar=instance.seminar,
            defaults={
                'check_in_time': instance.check_in,
                'check_out_time': instance.check_out,
            }
        )
        
        # If it already exists, update the timestamps
        if not created:
            attended.check_in_time = instance.check_in
            attended.check_out_time = instance.check_out
            attended.save()
        
        print(f"AttendedSeminar record {'created' if created else 'updated'} for {instance.user.username} - {instance.seminar.title}")
    
    # Optional: Remove AttendedSeminar if is_present becomes False
    elif not instance.is_present:
        AttendedSeminar.objects.filter(
            user=instance.user,
            seminar=instance.seminar
        ).delete()
        print(f"AttendedSeminar record removed for {instance.user.username} - {instance.seminar.title}")
