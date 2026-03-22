from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from .models import FoodListing, FoodPost
from .serializers import FoodListingSerializer, FoodPostSerializer
from accounts.permissions import IsDonor, IsAdmin


def success_response(data, message="Success", status_code=status.HTTP_200_OK):
    return Response({"success": True, "message": message, "data": data}, status=status_code)


def error_response(message="Error", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    payload = {"success": False, "message": message}
    if errors is not None:
        payload["errors"] = errors
    return Response(payload, status=status_code)


# ---------------------------------------------------------------------------
# FoodPost ViewSet (new — /api/food-posts/)
# ---------------------------------------------------------------------------

class FoodPostViewSet(viewsets.ModelViewSet):
    """
    CRUD for FoodPost:
      POST   /api/food-posts/         — Create (IsDonor)
      GET    /api/food-posts/         — List available posts (public)
      GET    /api/food-posts/<id>/    — Single post (public)
      PATCH  /api/food-posts/<id>/    — Update status (owner donor only)
      DELETE /api/food-posts/<id>/    — Delete (owner donor only)
    """
    serializer_class = FoodPostSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsDonor()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsDonor()]
        # list and retrieve are public
        return [permissions.AllowAny()]

    def get_queryset(self):
        """
        FIX: Safe handling of both authenticated and anonymous users.
        - Authenticated donors see their own posts.
        - Everyone else (including anonymous) sees only 'available' posts.
        Uses select_related to eliminate N+1 queries on donor FK.
        """
        user = self.request.user
        base_qs = FoodPost.objects.select_related('donor').order_by('-created_at')

        if self.action == 'list':
            # FIX: Check is_authenticated first to avoid AnonymousUser.is_donor crash
            if user.is_authenticated and getattr(user, 'is_donor', False):
                return base_qs.filter(donor=user)
            return base_qs.filter(status='available')

        return base_qs

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=FoodPostSerializer(qs, many=True).data,
            message="Food posts retrieved.",
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return success_response(
            data=FoodPostSerializer(instance).data,
            message="Food post retrieved.",
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Failed to create food post.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        self.perform_create(serializer)
        return success_response(
            data=serializer.data,
            message="Food post created successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.donor != request.user:
            return error_response("You can only update your own food posts.", status_code=403)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(message="Update failed.", errors=serializer.errors)
        serializer.save()
        return success_response(data=serializer.data, message="Food post updated.")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.donor != request.user:
            return error_response("You can only delete your own food posts.", status_code=403)
        instance.delete()
        return success_response(data={}, message="Food post deleted.")


# ---------------------------------------------------------------------------
# Admin: all food posts
# ---------------------------------------------------------------------------

class AdminFoodPostsView(generics.ListAPIView):
    """GET /api/admin/food-posts/ — admin sees all posts."""
    permission_classes = [IsAdmin]
    serializer_class = FoodPostSerializer

    def get_queryset(self):
        # FIX: use select_related instead of static queryset to avoid N+1
        return FoodPost.objects.select_related('donor').all().order_by('-created_at')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=FoodPostSerializer(qs, many=True).data,
            message="All food posts retrieved.",
        )


# ---------------------------------------------------------------------------
# Legacy FoodListing ViewSet (kept for existing frontend)
# ---------------------------------------------------------------------------

class FoodListingViewSet(viewsets.ModelViewSet):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsDonor]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        # FIX: select_related eliminates N+1 queries when serializing author + matched_user
        return FoodListing.objects.select_related(
            'author', 'matched_user'
        ).filter(
            author=self.request.user, listing_type='donation'
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, listing_type='donation')

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        listing = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(FoodListing.STATUS_CHOICES):
            return error_response(message='Invalid status', status_code=status.HTTP_400_BAD_REQUEST)
        listing.status = new_status
        listing.save(update_fields=['status', 'updated_at'])
        return success_response(data=FoodListingSerializer(listing).data, message='Status updated successfully')


class AvailableRequestsView(generics.ListAPIView):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsDonor]

    def get_queryset(self):
        # FIX: select_related prevents N+1 on author lookup in serializer
        return FoodListing.objects.select_related(
            'author', 'matched_user'
        ).filter(
            status='available', listing_type='request'
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=FoodListingSerializer(qs, many=True).data,
            message="Available requests retrieved."
        )


class AcceptRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsDonor]

    @transaction.atomic
    def post(self, request, pk):
        try:
            listing = FoodListing.objects.select_for_update().select_related(
                'author', 'matched_user'
            ).get(pk=pk, listing_type='request')
        except FoodListing.DoesNotExist:
            return error_response(message='Request not found', status_code=status.HTTP_404_NOT_FOUND)

        if listing.status != 'available':
            return error_response(message='Request is not available', status_code=status.HTTP_400_BAD_REQUEST)

        listing.matched_user = request.user
        listing.status = 'assigned'
        listing.save(update_fields=['matched_user', 'status', 'updated_at'])
        return success_response(data=FoodListingSerializer(listing).data, message='Request accepted successfully')
