from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.exceptions import ValidationError

# Poll Model
class Poll(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='polls_created')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    allow_multiple_votes = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.title

    @property
    def is_expired(self):
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

    @property
    def total_votes(self):
        return Vote.objects.filter(option__poll=self).count()

    def clean(self):
        if self.expires_at and self.expires_at <= timezone.now():
            raise ValidationError("Expiration date must be in the future.")
        if not self.title:
            raise ValidationError("Poll title cannot be empty.")
        if self.allow_multiple_votes and not self.is_active:
            raise ValidationError("Multiple votes are not allowed for inactive polls.")

# Option Model
class Option(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
        unique_together = ('poll', 'text')
        indexes = [
            models.Index(fields=['poll', 'order']),
        ]

    def __str__(self):
        return f"{self.poll.title} - {self.text}"

    @property
    def vote_count(self):
        return self.votes.count()

    @property
    def vote_percentage(self):
        total_votes = self.poll.total_votes
        if total_votes > 0:
            return round((self.vote_count / total_votes) * 100, 2)
        return 0.0

# Vote Model
class Vote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    option = models.ForeignKey(Option, on_delete=models.CASCADE, related_name='votes')
    voted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'option')  # Prevents duplicate votes unless allowed
        indexes = [
            models.Index(fields=['user', 'option']),
            models.Index(fields=['voted_at']),
        ]

    def __str__(self):
        return f"{self.user.username} voted for {self.option.text}"

    def clean(self):
        # Check if the poll allows multiple voting
        if not self.option.poll.allow_multiple_votes:
            existing_votes = Vote.objects.filter(
                user=self.user,
                option__poll=self.option.poll
            ).exclude(pk=self.pk).exists()
        if existing_votes:
            raise ValidationError("User has already voted in this poll.")

        # Check if the poll has expired
        if self.option.poll.is_expired:
            raise ValidationError("Cannot vote on an expired poll.")

        # Check if the poll is active
        if not self.option.poll.is_active:
            raise ValidationError("Cannot vote on an inactive poll.")
