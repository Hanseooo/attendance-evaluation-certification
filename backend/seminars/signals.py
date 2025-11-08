from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Seminar, PlannedSeminar
from certificates.models import CertificateTemplate
from django.conf import settings


@receiver(post_save, sender=Seminar)
def seminar_post_save(sender, instance: Seminar, created, **kwargs):
    if not created and instance.is_done:
        PlannedSeminar.objects.filter(seminar=instance).delete()

