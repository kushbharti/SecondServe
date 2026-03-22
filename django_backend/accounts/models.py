import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.translation import gettext_lazy as _


class CustomUserManager(BaseUserManager):
    """
    Custom user manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        # Admins are auto-approved
        extra_fields.setdefault('verification_status', 'approved')

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    # --- FIXED: Expanded to all 10 roles as per spec ---
    DONOR_ROLES = ('DONOR', 'HOTEL', 'CAFE', 'RESTAURANT', 'CANTEEN', 'CATERING_SERVICE')
    RECEIVER_ROLES = ('NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'GOVERNMENT_HOSPITAL')

    ROLE_CHOICES = (
        ('DONOR', 'Donor'),
        ('HOTEL', 'Hotel'),
        ('CAFE', 'Cafe'),
        ('RESTAURANT', 'Restaurant'),
        ('CANTEEN', 'Canteen'),
        ('CATERING_SERVICE', 'Catering Service'),
        ('NGO', 'NGO'),
        ('ORPHANAGE', 'Orphanage'),
        ('OLD_AGE_HOME', 'Old Age Home'),
        ('GOVERNMENT_HOSPITAL', 'Government Hospital'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(_('email address'), unique=True)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    # Role — required; indexed for permission checks on every request
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, db_index=True)

    # Common fields
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    # Donor-specific — FIXED: added username field
    username = models.CharField(max_length=100, blank=True, null=True)

    # Keep full_name for legacy display purposes
    full_name = models.CharField(max_length=255, blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    # Receiver/Org fields
    organization_name = models.CharField(max_length=255, blank=True, null=True)
    contact_person = models.CharField(max_length=255, blank=True, null=True)

    # Registration identifiers
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    cci_registration_number = models.CharField(max_length=100, blank=True, null=True)
    hospital_registration_number = models.CharField(max_length=100, blank=True, null=True)

    # Org extra fields
    registration_type = models.CharField(max_length=100, blank=True, null=True)
    government_license_number = models.CharField(max_length=100, blank=True, null=True)
    social_welfare_license_number = models.CharField(max_length=100, blank=True, null=True)
    # FIXED: max_length 50 → 20, regex: AAAAA9999A
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    darpan_id = models.CharField(max_length=100, blank=True, null=True)
    # FIXED: URLField → TextField (allows longer certificate paths/URLs)
    registration_certificate_url = models.TextField(blank=True, null=True)

    # Hospital-specific
    government_department = models.CharField(max_length=255, blank=True, null=True)
    hospital_type = models.CharField(max_length=100, blank=True, null=True)
    number_of_beds = models.IntegerField(blank=True, null=True)
    # FIXED: added official_email field (hospitals use this as primary login identifier)
    official_email = models.EmailField(blank=True, null=True)

    # Hospital legacy field (kept for backward compat)
    hospital_name = models.CharField(max_length=255, blank=True, null=True)

    # Orphanage-specific
    child_welfare_department = models.CharField(max_length=255, blank=True, null=True)

    # Capacity
    capacity_people_served = models.IntegerField(blank=True, null=True)
    capacity_children_supported = models.IntegerField(blank=True, null=True)
    capacity_residents_supported = models.IntegerField(blank=True, null=True)

    # Address
    address = models.CharField(max_length=255, blank=True, null=True)  # legacy
    address_line1 = models.TextField(blank=True, null=True)
    address_line2 = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    # FIXED: max_length 20 → 10
    pincode = models.CharField(max_length=10, blank=True, null=True)

    # Org metadata
    # FIXED: URLField → TextField
    website_url = models.TextField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # Verification status; indexed because IsReceiver permission checks it on every request
    verification_status = models.CharField(
        max_length=20,
        choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')],
        default='pending',
        db_index=True,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} - {self.role}"

    @property
    def is_donor(self):
        return self.role in self.DONOR_ROLES

    @property
    def is_receiver(self):
        return self.role in self.RECEIVER_ROLES
