from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'role', 'verification_status', 'is_staff', 'date_joined']
    list_filter = ['role', 'verification_status', 'is_staff']
    search_fields = ['email', 'username', 'organization_name', 'phone_number']
    ordering = ['-date_joined']
    readonly_fields = ['date_joined', 'id']
    fieldsets = (
        ('Account', {'fields': ('id', 'email', 'role', 'verification_status', 'is_staff', 'is_active', 'date_joined')}),
        ('Donor Info', {'fields': ('username', 'full_name', 'phone_number', 'profile_image')}),
        ('Organization Info', {'fields': ('organization_name', 'hospital_name', 'contact_person', 'official_email')}),
        ('Registration', {'fields': (
            'registration_number', 'cci_registration_number', 'hospital_registration_number',
            'registration_type', 'government_license_number', 'social_welfare_license_number',
            'pan_number', 'darpan_id', 'registration_certificate_url',
        )}),
        ('Hospital Details', {'fields': ('government_department', 'hospital_type', 'number_of_beds', 'child_welfare_department')}),
        ('Capacity', {'fields': ('capacity_people_served', 'capacity_children_supported', 'capacity_residents_supported')}),
        ('Address', {'fields': ('address_line1', 'address_line2', 'city', 'district', 'state', 'pincode')}),
        ('Other', {'fields': ('website_url', 'description')}),
    )