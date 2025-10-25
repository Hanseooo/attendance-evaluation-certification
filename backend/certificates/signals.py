# certificates/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from evaluation.models import Evaluation
from .utils import generate_and_send_certificate
from certificates.models import CertificateTemplate
from .models import Seminar
from django.conf import settings

@receiver(post_save, sender=Evaluation)
def handle_certificate_generation(sender, instance, created, **kwargs):
    if not created:
        return
    user = instance.user
    seminar = instance.seminar

    # check conditions
    if getattr(instance, "is_completed", False) and getattr(user, "is_present", False):
        generate_and_send_certificate(user, seminar)

@receiver(post_save, sender=Seminar)
def create_default_certificate_template(sender, instance, created, **kwargs):
    """Automatically create a default certificate template for new seminars."""
    if created:
        try:
            # Check if template already exists
            instance.certificate_template
        except CertificateTemplate.DoesNotExist:
            # Create with default URL
            CertificateTemplate.objects.create(
                seminar=instance,
                template_image=settings.DEFAULT_CERTIFICATE_TEMPLATE_URL,
                text_x=290,
                text_y=180,
                centered=True,
                default_used=True,
            )