from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # AbstractUser already has: username, first_name, last_name, email, is_active, etc.
    # Add extra fields:
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('participant', 'Participant'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='participant')
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.username or self.email
