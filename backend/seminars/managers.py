from django.db import models
from django.utils import timezone

class SeminarManager(models.Manager):
    def get_queryset(self):
        qs = super().get_queryset()
        now = timezone.now()
        qs.filter(is_done=False, date_end__lt=now).update(is_done=True)
        return qs