from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Evaluation(models.Model):
    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE, related_name="evaluations")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="evaluations")
    rating = models.PositiveSmallIntegerField()  # 1-10
    comments = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("seminar", "user")  # one evaluation per user per seminar

    def __str__(self):
        return f"Eval {self.user} - {self.seminar}"
