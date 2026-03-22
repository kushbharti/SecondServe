from rest_framework import serializers
from .models import FoodRequest
from donors.models import FoodPost
from django.contrib.auth import get_user_model

User = get_user_model()


class FoodRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for the FoodRequest model.
    receiver is set automatically from request.user in the view.
    """
    receiver_name = serializers.SerializerMethodField(read_only=True)
    receiver_role = serializers.CharField(source='receiver.role', read_only=True)
    receiver_phone = serializers.CharField(source='receiver.phone_number', read_only=True)
    receiver_email = serializers.EmailField(source='receiver.email', read_only=True)
    receiver_org = serializers.SerializerMethodField(read_only=True)
    food_post_name = serializers.CharField(source='food_post.food_name', read_only=True, default=None)

    class Meta:
        model = FoodRequest
        fields = [
            'id', 'receiver', 'receiver_name', 'receiver_role', 'receiver_phone', 'receiver_email', 'receiver_org',
            'food_post', 'food_post_name',
            'food_type_needed', 'quantity_needed', 'required_by',
            'message', 'status', 'created_at',
        ]
        read_only_fields = ('id', 'receiver', 'receiver_name', 'receiver_role', 'receiver_phone', 'receiver_email', 'receiver_org',
                            'food_post_name', 'created_at', 'status')

    def get_receiver_name(self, obj):
        user = obj.receiver
        return user.contact_person or user.organization_name or user.email

    def get_receiver_org(self, obj):
        user = obj.receiver
        return user.organization_name or user.hospital_name or None

    def validate_quantity_needed(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Quantity needed cannot be empty.")
        return value.strip()

    def validate_food_post(self, value):
        """If a food_post is linked, it must be 'available'."""
        if value is not None and value.status != 'available':
            raise serializers.ValidationError(
                "The linked food post is no longer available."
            )
        return value
