from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Seminar, PlannedSeminar
from certificates.models import CertificateTemplate
from django.conf import settings
from django.db import transaction
from .services import send_new_seminar_emails


@receiver(post_save, sender=Seminar)
def seminar_post_save(sender, instance: Seminar, created, **kwargs):
    if not created and instance.is_done:
        PlannedSeminar.objects.filter(seminar=instance).delete()


@receiver(post_save, sender=Seminar)
def seminar_created_email_notification(sender, instance, created, **kwargs):
    if not created:
        return

    transaction.on_commit(
        lambda: send_new_seminar_emails(instance)
    )
