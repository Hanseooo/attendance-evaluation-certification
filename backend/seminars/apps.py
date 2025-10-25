# seminars/apps.py
from django.apps import AppConfig


class SeminarsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'seminars'

    # ✅ Remove or comment out this if you had it:
    # def ready(self):
    #     import seminars.signals