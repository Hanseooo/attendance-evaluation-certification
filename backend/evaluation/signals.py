# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import Evaluation
# # from certificates.tasks import generate_and_email_certificate  # (Celery task)

# @receiver(post_save, sender=Evaluation)
# def evaluation_post_save(sender, instance: Evaluation, created, **kwargs):
#     # When evaluation is completed, trigger certificate generation & send
#     if instance.completed:
#         # Call async task - example:
#         # generate_and_email_certificate.delay(instance.seminar.id, instance.user.id)
#         # If you don't use Celery, call sync function (not recommended for production)
#         pass


from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Evaluation
from seminars.models import PlannedSeminar

@receiver(post_save, sender=Evaluation)
def evaluation_post_save(sender, instance: Evaluation, created, **kwargs):
    """
    When an evaluation is marked completed, delete the user's planned seminar entry.
    """
    if instance.is_completed:  # make sure it's completed
        PlannedSeminar.objects.filter(user=instance.user, seminar=instance.seminar).delete()

        # (Optional) trigger certificate generation, email, etc.
        # generate_and_email_certificate.delay(instance.seminar.id, instance.user.id)
