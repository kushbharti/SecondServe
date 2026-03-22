from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from .models import FoodRequest
from .serializers import FoodRequestSerializer
from donors.models import FoodListing, FoodPost
from donors.serializers import FoodListingSerializer
from accounts.permissions import IsReceiver, IsAdmin
from backend.cache import cache_service


def success_response(data, message="Success", status_code=status.HTTP_200_OK):
    return Response({"success": True, "message": message, "data": data}, status=status_code)


def error_response(message="Error", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    payload = {"success": False, "message": message}
    if errors is not None:
        payload["errors"] = errors
    return Response(payload, status=status_code)


# ---------------------------------------------------------------------------
# FoodRequest ViewSet (new — /api/food-requests/)
# ---------------------------------------------------------------------------

class FoodRequestViewSet(viewsets.ModelViewSet):
    """
    POST   /api/food-requests/       — Create (IsReceiver)
    GET    /api/food-requests/       — List (admin + donors via query param)
    GET    /api/food-requests/<id>/  — Single request
    PATCH  /api/food-requests/<id>/  — Update status
    """
    serializer_class = FoodRequestSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsReceiver()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        # FIX: select_related to avoid N+1 on receiver FK and food_post FK
        base_qs = FoodRequest.objects.select_related(
            'receiver', 'food_post', 'food_post__donor'
        ).order_by('-created_at')

        if user.is_staff:
            return base_qs
        # Receivers see their own requests
        if user.role in ('NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'GOVERNMENT_HOSPITAL'):
            return base_qs.filter(receiver=user)
        # Donors see all open requests
        return base_qs.filter(status='open')

    def perform_create(self, serializer):
        serializer.save(receiver=self.request.user)
        cache_service.invalidate('food_requests:open')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Failed to create food request.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        self.perform_create(serializer)
        return success_response(
            data=serializer.data,
            message="Food request submitted successfully.",
            status_code=status.HTTP_201_CREATED,
        )

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=FoodRequestSerializer(qs, many=True).data,
            message="Food requests retrieved.",
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        return success_response(
            data=FoodRequestSerializer(instance).data,
            message="Food request retrieved.",
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if not serializer.is_valid():
            return error_response(message="Update failed.", errors=serializer.errors)
        serializer.save()
        cache_service.invalidate('food_requests:open')
        return success_response(data=serializer.data, message="Food request updated.")


class AdminFoodRequestsView(generics.ListAPIView):
    """GET /api/admin/food-requests/ — admin sees all food requests."""
    permission_classes = [IsAdmin]
    serializer_class = FoodRequestSerializer

    def get_queryset(self):
        return FoodRequest.objects.select_related(
            'receiver', 'food_post'
        ).all().order_by('-created_at')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=FoodRequestSerializer(qs, many=True).data,
            message="All food requests retrieved.",
        )


# ---------------------------------------------------------------------------
# Legacy views (for existing frontend) — kept intact with N+1 fixes
# ---------------------------------------------------------------------------

class RecipientListingViewSet(viewsets.ModelViewSet):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsReceiver]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        # FIX: select_related prevents N+1 queries when rendering author/matched_user
        return FoodListing.objects.select_related(
            'author', 'matched_user'
        ).filter(
            author=self.request.user, listing_type='request'
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, listing_type='request')
        cache_service.invalidate('food_requests:open')


class AvailableListingsView(generics.ListAPIView):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsReceiver]

    def get_queryset(self):
        # FIX: select_related prevents N+1 queries
        from django.utils import timezone
        return FoodListing.objects.select_related(
            'author', 'matched_user'
        ).filter(
            status='available', listing_type='donation', expiry_date__gt=timezone.now()
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        data = cache_service.get_or_set(
            'available_listings',
            lambda: FoodListingSerializer(self.get_queryset(), many=True).data,
            ttl=60
        )
        return success_response(data=data, message="Available listings retrieved.")


class RequestListingView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsReceiver]

    @transaction.atomic
    def post(self, request, pk):
        try:
            listing = FoodListing.objects.select_for_update().select_related(
                'author', 'matched_user'
            ).get(pk=pk, listing_type='donation')
        except FoodListing.DoesNotExist:
            return error_response(message='Listing not found', status_code=status.HTTP_404_NOT_FOUND)
        if listing.status != 'available':
            return error_response(message='Listing is not available', status_code=status.HTTP_400_BAD_REQUEST)
        listing.matched_user = request.user
        listing.status = 'assigned'
        listing.save(update_fields=['matched_user', 'status', 'updated_at'])
        cache_service.invalidate('available_listings')
        return success_response(data=FoodListingSerializer(listing).data, message="Listing accepted successfully")


class MyRequestsView(generics.ListAPIView):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsReceiver]

    def get_queryset(self):
        return FoodListing.objects.select_related(
            'author', 'matched_user'
        ).filter(
            matched_user=self.request.user, listing_type='donation'
        ).order_by('-updated_at')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=FoodListingSerializer(qs, many=True).data,
            message="My requests retrieved."
        )


class CancelRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsReceiver]

    def patch(self, request, pk):
        try:
            listing = FoodListing.objects.select_related(
                'author', 'matched_user'
            ).get(pk=pk, matched_user=request.user, listing_type='donation')
        except FoodListing.DoesNotExist:
            return error_response(message='Listing not found or not owned by you', status_code=status.HTTP_404_NOT_FOUND)
        if listing.status == 'completed':
            return error_response(message='Cannot cancel completed listing', status_code=status.HTTP_400_BAD_REQUEST)
        listing.matched_user = None
        listing.status = 'available'
        listing.save(update_fields=['matched_user', 'status', 'updated_at'])
        cache_service.invalidate('available_listings')
        cache_service.invalidate('food_requests:open')
        return success_response(data=FoodListingSerializer(listing).data, message="Request cancelled successfully")


class CompleteListingView(APIView):
    """Marks a donation or request as completed (Receiver only)."""
    permission_classes = [permissions.IsAuthenticated, IsReceiver]

    @transaction.atomic
    def post(self, request, pk):
        try:
            listing = FoodListing.objects.select_for_update().select_related(
                'author', 'matched_user'
            ).get(pk=pk)
        except FoodListing.DoesNotExist:
            return error_response(message='Listing not found', status_code=status.HTTP_404_NOT_FOUND)

        if listing.status != 'assigned':
            return error_response(
                message='Listing must be assigned before it can be marked as completed',
                status_code=status.HTTP_400_BAD_REQUEST
            )

        # Ensure correct ownership
        if listing.listing_type == 'donation':
            # Receiver accepted this donation
            if listing.matched_user != request.user:
                return error_response(
                    message='Unauthorized. You did not accept this donation.',
                    status_code=status.HTTP_403_FORBIDDEN
                )
        elif listing.listing_type == 'request':
            # Receiver created this request that a donor accepted
            if listing.author != request.user:
                return error_response(
                    message='Unauthorized. You are not the author of this request.',
                    status_code=status.HTTP_403_FORBIDDEN
                )
        else:
            return error_response(message='Invalid listing type', status_code=status.HTTP_400_BAD_REQUEST)

        listing.status = 'completed'
        listing.save(update_fields=['status', 'updated_at'])
        cache_service.invalidate('available_listings')
        cache_service.invalidate('food_requests:open')
        return success_response(
            data=FoodListingSerializer(listing).data,
            message='Listing marked as completed successfully'
        )
