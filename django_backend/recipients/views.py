from rest_framework import viewsets, permissions, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import FoodRequest
from .serializers import FoodRequestSerializer
from donors.models import FoodListing, FoodPost
from donors.serializers import FoodListingSerializer
from accounts.permissions import IsReceiver, IsAdmin


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
        if user.is_staff:
            return FoodRequest.objects.all().order_by('-created_at')
        # Receivers see their own requests
        if user.role in ('NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'GOVERNMENT_HOSPITAL'):
            return FoodRequest.objects.filter(receiver=user).order_by('-created_at')
        # Donors see all open requests
        return FoodRequest.objects.filter(status='open').order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(receiver=self.request.user)

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
        return success_response(data=serializer.data, message="Food request updated.")


class AdminFoodRequestsView(generics.ListAPIView):
    """GET /api/admin/food-requests/ — admin sees all food requests."""
    permission_classes = [IsAdmin]
    serializer_class = FoodRequestSerializer
    queryset = FoodRequest.objects.all().order_by('-created_at')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=FoodRequestSerializer(qs, many=True).data,
            message="All food requests retrieved.",
        )


# ---------------------------------------------------------------------------
# Legacy views (for existing frontend) — kept intact
# ---------------------------------------------------------------------------

class RecipientListingViewSet(viewsets.ModelViewSet):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsReceiver]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return FoodListing.objects.filter(
            author=self.request.user, listing_type='request'
        ).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, listing_type='request')


class AvailableListingsView(generics.ListAPIView):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsReceiver]

    def get_queryset(self):
        return FoodListing.objects.filter(
            status='available', listing_type='donation'
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=FoodListingSerializer(qs, many=True).data,
            message="Available listings retrieved."
        )


class RequestListingView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsReceiver]

    def post(self, request, pk):
        try:
            listing = FoodListing.objects.get(pk=pk, listing_type='donation')
        except FoodListing.DoesNotExist:
            return error_response(message='Listing not found', status_code=status.HTTP_404_NOT_FOUND)
        if listing.status != 'available':
            return error_response(message='Listing is not available', status_code=status.HTTP_400_BAD_REQUEST)
        listing.matched_user = request.user
        listing.status = 'assigned'
        listing.save()
        return success_response(data=FoodListingSerializer(listing).data, message="Listing accepted successfully")


class MyRequestsView(generics.ListAPIView):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsReceiver]

    def get_queryset(self):
        return FoodListing.objects.filter(
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
            listing = FoodListing.objects.get(pk=pk, matched_user=request.user, listing_type='donation')
        except FoodListing.DoesNotExist:
            return error_response(message='Listing not found or not owned by you', status_code=status.HTTP_404_NOT_FOUND)
        if listing.status == 'completed':
            return error_response(message='Cannot cancel completed listing', status_code=status.HTTP_400_BAD_REQUEST)
        listing.matched_user = None
        listing.status = 'available'
        listing.save()
        return success_response(data=FoodListingSerializer(listing).data, message="Request cancelled successfully")
