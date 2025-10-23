# certificates/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from evaluation.models import Evaluation
from .utils import generate_and_send_certificate

@receiver(post_save, sender=Evaluation)
def handle_certificate_generation(sender, instance, created, **kwargs):
    if not created:
        return
    user = instance.user
    seminar = instance.seminar

    # check conditions
    if getattr(instance, "is_completed", False) and getattr(user, "is_present", False):
        generate_and_send_certificate(user, seminar)
