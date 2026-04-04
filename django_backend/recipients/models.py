import uuid
from django.db import models
from django.conf import settings


class FoodRequest(models.Model):
    """
    FoodRequest model per spec:
    - Created by approved receivers
    - Optionally linked to a FoodPost
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='food_requests'
    )
    # Optional link to a specific FoodPost; SET_NULL so request remains if post deleted
    food_post = models.ForeignKey(
        'donors.FoodPost', on_delete=models.SET_NULL, null=True, blank=True,
        related_name='food_requests'
    )
    # Donor who accepted the request
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='accepted_food_requests'
    )
    food_type_needed = models.CharField(max_length=100, blank=True, null=True)
    quantity_needed = models.CharField(max_length=100)
    required_by = models.DateTimeField(blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"FoodRequest by {self.receiver.email} — {self.status}"
