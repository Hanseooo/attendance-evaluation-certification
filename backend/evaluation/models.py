from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Evaluation(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]  # 1..5

    seminar = models.ForeignKey("seminars.Seminar", on_delete=models.CASCADE, related_name="evaluations")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="evaluations")

    # Question ratings (1-5)
    content_and_relevance = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    presenters_effectiveness = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    organization_and_structure = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    materials_usefulness = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    overall_satisfaction = models.PositiveSmallIntegerField(choices=RATING_CHOICES)

    # Suggestions / comments
    suggestions = models.TextField(blank=True)

    # Completion flag and timestamp
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("seminar", "user")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Evaluation: {self.user} — {self.seminar} (completed={self.is_completed})"
