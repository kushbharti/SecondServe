import uuid
from django.db import models
from django.conf import settings


class FoodListing(models.Model):
    """Legacy model — kept for existing frontend compatibility."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_CHOICES = (
        ('available', 'Available'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
    )
    LISTING_TYPE_CHOICES = (
        ('donation', 'Donation'),
        ('request', 'Request'),
    )

    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='listings'
    )
    matched_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        related_name='matched_listings', null=True, blank=True
    )
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE_CHOICES, default='donation', db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    food_type = models.CharField(max_length=100)
    quantity = models.CharField(max_length=100)
    pickup_address = models.TextField()
    expiry_date = models.DateTimeField()
    image = models.ImageField(upload_to='food_images/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.get_listing_type_display()}] {self.title} - {self.author.email}"


class FoodPost(models.Model):
    """
    New FoodPost model per spec:
    - Created by donors (any of the 6 donor roles)
    - Browsed by approved receivers
    """
    FOOD_TYPE_CHOICES = [
        ('veg', 'Veg'),
        ('non-veg', 'Non-Veg'),
        ('both', 'Both'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    donor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='food_posts'
    )
    food_name = models.CharField(max_length=255)
    quantity = models.IntegerField(default=50)
    food_type = models.CharField(max_length=50, choices=FOOD_TYPE_CHOICES)
    servings = models.IntegerField(blank=True, null=True)
    expiry_time = models.DateTimeField(blank=True, null=True)
    pickup_address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    # Geocoded from pickup_address automatically on post creation
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    accepted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        related_name='accepted_food_posts', null=True, blank=True
    )
    image = models.ImageField(upload_to='food_posts/', null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.food_name} by {self.donor.email} — {self.status}"
