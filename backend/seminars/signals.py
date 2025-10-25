from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Seminar, PlannedSeminar
from certificates.models import CertificateTemplate
from django.conf import settings


@receiver(post_save, sender=Seminar)
def seminar_post_save(sender, instance: Seminar, created, **kwargs):
    # When seminar is marked done, remove planned entries
    if not created and instance.is_done:
        PlannedSeminar.objects.filter(seminar=instance).delete()


# @receiver(post_save, sender=Seminar)
# def create_default_certificate_template(sender, instance, created, **kwargs):
#     """Automatically create a default certificate template for new seminars."""
#     if created:
#         # Check if template already exists (shouldn't, but safety check)
#         if not hasattr(instance, 'certificate_template'):
#             CertificateTemplate.objects.create(
#                 seminar=instance,
#                 template_image=settings.DEFAULT_CERTIFICATE_TEMPLATE_URL,
#                 text_x=290,
#                 text_y=180,
#                 centered=True,
#                 default_used=True,
#             )