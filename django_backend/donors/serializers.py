from rest_framework import serializers
from .models import FoodListing, FoodPost
from django.contrib.auth import get_user_model

User = get_user_model()


class FoodListingSerializer(serializers.ModelSerializer):
    """Legacy serializer for FoodListing model."""
    author_name = serializers.SerializerMethodField()
    author_role = serializers.CharField(source='author.role', read_only=True)
    author_phone = serializers.CharField(source='author.phone_number', read_only=True)
    author_email = serializers.EmailField(source='author.email', read_only=True)
    
    matched_user_name = serializers.SerializerMethodField()
    matched_user_phone = serializers.CharField(source='matched_user.phone_number', read_only=True)
    matched_user_email = serializers.EmailField(source='matched_user.email', read_only=True)

    class Meta:
        model = FoodListing
        fields = '__all__'
        read_only_fields = ('author', 'created_at', 'updated_at', 'status', 'matched_user', 'listing_type')

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Check for expiry dynamically
        from django.utils import timezone
        if instance.expiry_date and instance.expiry_date < timezone.now() and rep['status'] == 'available':
            rep['status'] = 'expired'

        # Build absolute image URL
        if rep.get('image'):
            request = self.context.get('request')
            if request:
                path = rep['image']
                if not path.startswith('http'):
                    rep['image'] = request.build_absolute_uri(path)
            else:
                from django.conf import settings as _settings
                backend_url = getattr(_settings, 'BACKEND_URL', 'http://localhost:8000').rstrip('/')
                path = rep['image']
                if not path.startswith('http'):
                    rep['image'] = f"{backend_url}{path}" if path.startswith('/') else f"{backend_url}/media/{path}"

        return rep


    def get_author_name(self, obj):
        user = obj.author
        if user.role == 'GOVERNMENT_HOSPITAL':
            return user.hospital_name or user.organization_name or user.email
        elif user.role in ['NGO', 'ORPHANAGE', 'OLD_AGE_HOME']:
            return user.organization_name or user.email
        return user.username or user.full_name or user.email

    def get_matched_user_name(self, obj):
        if not obj.matched_user:
            return None
        user = obj.matched_user
        if user.role == 'GOVERNMENT_HOSPITAL':
            return user.hospital_name or user.organization_name or user.email
        elif user.role in ['NGO', 'ORPHANAGE', 'OLD_AGE_HOME']:
            return user.organization_name or user.email
        return user.username or user.full_name or user.email

    def create(self, validated_data):
        return super().create(validated_data)


class FoodPostSerializer(serializers.ModelSerializer):
    """
    Serializer for the new FoodPost model.
    donor field is read-only and set by the view from request.user.
    """
    donor_name = serializers.SerializerMethodField(read_only=True)
    donor_role = serializers.CharField(source='donor.role', read_only=True)
    donor_phone = serializers.CharField(source='donor.phone_number', read_only=True)
    donor_email = serializers.EmailField(source='donor.email', read_only=True)

    class Meta:
        model = FoodPost
        fields = [
            'id', 'donor', 'donor_name', 'donor_role', 'donor_phone', 'donor_email',
            'food_name', 'quantity', 'food_type', 'servings',
            'expiry_time', 'pickup_address', 'city',
            'status', 'description', 'created_at',
        ]
        read_only_fields = ('id', 'donor', 'donor_name', 'donor_role', 'donor_phone', 'donor_email', 'created_at', 'status')

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        from django.utils import timezone
        if instance.expiry_time and instance.expiry_time < timezone.now() and rep['status'] == 'available':
            rep['status'] = 'expired'
        return rep

    def get_donor_name(self, obj):
        user = obj.donor
        return user.username or user.full_name or user.email

    def validate_food_type(self, value):
        allowed = [c[0] for c in FoodPost.FOOD_TYPE_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError(f"food_type must be one of: {allowed}")
        return value

    def validate_quantity(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Quantity cannot be empty.")
        return value.strip()
