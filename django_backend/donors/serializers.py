from rest_framework import serializers
from .models import FoodListing, FoodPost
from django.contrib.auth import get_user_model

User = get_user_model()


class FoodListingSerializer(serializers.ModelSerializer):
    """Legacy serializer for FoodListing model."""
    author_name = serializers.SerializerMethodField()
    author_role = serializers.CharField(source='author.role', read_only=True)
    author_phone = serializers.CharField(source='author.phone_number', read_only=True)
    matched_user_name = serializers.SerializerMethodField()

    class Meta:
        model = FoodListing
        fields = '__all__'
        read_only_fields = ('author', 'created_at', 'updated_at', 'status', 'matched_user', 'listing_type')

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

    class Meta:
        model = FoodPost
        fields = [
            'id', 'donor', 'donor_name', 'donor_role',
            'food_name', 'quantity', 'food_type', 'servings',
            'expiry_time', 'pickup_address', 'city',
            'status', 'description', 'created_at',
        ]
        read_only_fields = ('id', 'donor', 'donor_name', 'donor_role', 'created_at', 'status')

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
