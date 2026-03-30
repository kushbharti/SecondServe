from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from .models import FoodListing, FoodPost
from .serializers import FoodListingSerializer, FoodPostSerializer
from accounts.permissions import IsDonor, IsAdmin, IsReceiver
from backend.cache import cache_service


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
        - Authenticated donors see their own posts (filterable by status).
        - Authenticated receivers see ALL posts they accepted/received.
        - Everyone else (including anonymous) sees only 'available' non-expired posts.
        Uses select_related to eliminate N+1 queries.
        """
        user = self.request.user
        base_qs = FoodPost.objects.select_related('donor', 'accepted_by').order_by('-created_at')

        if self.action == 'list':
            from django.utils import timezone

            # Donor: see own posts with optional status filter
            if user.is_authenticated and getattr(user, 'is_donor', False):
                qs = base_qs.filter(donor=user)
                status_filter = self.request.query_params.get('status')
                if status_filter and status_filter != 'all':
                    if status_filter == 'expired':
                        qs = qs.filter(expiry_time__lt=timezone.now()).exclude(status__in=['completed', 'expired'])
                    elif status_filter == 'pending':
                        qs = qs.filter(expiry_time__gte=timezone.now(), status='pending')
                    else:
                        qs = qs.filter(status=status_filter)
                return qs

            # Receiver view
            if user.is_authenticated and getattr(user, 'is_receiver', False):
                # If they explicitly ask for THEIR accepted/completed posts (My Claims)
                if self.request.query_params.get('accepted') == 'true':
                    qs = base_qs.filter(accepted_by=user)
                    status_filter = self.request.query_params.get('status')
                    if status_filter and status_filter != 'all':
                        qs = qs.filter(status=status_filter)
                    return qs
                
                # Default for receiver (Browse): all pending non-expired posts
                return base_qs.filter(status='pending', expiry_time__gt=timezone.now())

            # Public/anonymous: only pending, non-expired posts
            return base_qs.filter(status='pending', expiry_time__gt=timezone.now())

        return base_qs


    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)
        cache_service.invalidate('food_posts:available')

    def list(self, request, *args, **kwargs):
        user = self.request.user
        if not user.is_authenticated or (
            not getattr(user, 'is_donor', False) and not getattr(user, 'is_receiver', False)
        ):
            # Public view — cache heavily
            data = cache_service.get_or_set(
                'food_posts:available',
                lambda: FoodPostSerializer(self.get_queryset(), many=True).data,
                ttl=60
            )
            return success_response(data=data, message="Food posts retrieved.")

        # Donor or receiver specific view — no global cache
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
        cache_service.invalidate('food_posts:available')
        return success_response(data=serializer.data, message="Food post updated.")

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.donor != request.user:
            return error_response("You can only delete your own food posts.", status_code=403)
        instance.delete()
        cache_service.invalidate('food_posts:available')
        return success_response(data={}, message="Food post deleted.")

    @action(detail=True, methods=['post'], url_path='accept',
            permission_classes=[permissions.IsAuthenticated, IsReceiver])
    @transaction.atomic
    def accept(self, request, pk=None):
        """Receiver accepts a food post — status: available → accepted."""
        try:
            post = FoodPost.objects.select_for_update().get(pk=pk)
        except FoodPost.DoesNotExist:
            return error_response('Food post not found.', status_code=status.HTTP_404_NOT_FOUND)

        if post.status != 'pending':
            return error_response(
                f'This post is not pending (current status: {post.status}).',
                status_code=status.HTTP_400_BAD_REQUEST
            )

        post.status = 'assigned'
        post.accepted_by = request.user
        post.save(update_fields=['status', 'accepted_by'])
        cache_service.invalidate('food_posts:available')
        return success_response(
            data=FoodPostSerializer(post).data,
            message='Food post accepted successfully.'
        )

    @action(detail=True, methods=['post'], url_path='mark-completed',
            permission_classes=[permissions.IsAuthenticated, IsReceiver])
    def mark_completed(self, request, pk=None):
        """Receiver marks a food post as completed — status: assigned → completed.
        Only the receiver who accepted can perform this action.
        """
        try:
            post = FoodPost.objects.select_related('accepted_by').get(pk=pk)
        except FoodPost.DoesNotExist:
            return error_response('Food post not found.', status_code=status.HTTP_404_NOT_FOUND)

        if post.status != 'assigned':
            return error_response(
                'Only assigned posts can be marked as completed.',
                status_code=status.HTTP_400_BAD_REQUEST
            )

        if post.accepted_by != request.user:
            return error_response(
                'Only the receiver who accepted this post can mark it as received.',
                status_code=status.HTTP_403_FORBIDDEN
            )

        post.status = 'completed'
        post.save(update_fields=['status'])
        return success_response(
            data=FoodPostSerializer(post).data,
            message='Food post marked as completed.'
        )

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
        qs = FoodListing.objects.select_related(
            'author', 'matched_user'
        ).filter(
            author=self.request.user, listing_type='donation'
        ).order_by('-created_at')
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            from django.utils import timezone
            if status_filter == 'expired':
                qs = qs.filter(expiry_date__lt=timezone.now()).exclude(status='completed')
            elif status_filter == 'available':
                qs = qs.filter(expiry_date__gte=timezone.now(), status='available')
            else:
                qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, listing_type='donation')
        cache_service.invalidate('available_listings')

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        listing = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(FoodListing.STATUS_CHOICES):
            return error_response(message='Invalid status', status_code=status.HTTP_400_BAD_REQUEST)
        listing.status = new_status
        listing.save(update_fields=['status', 'updated_at'])
        cache_service.invalidate('available_listings')
        cache_service.invalidate('food_requests:pending')
        return success_response(data=FoodListingSerializer(listing).data, message='Status updated successfully')


class AvailableRequestsView(generics.ListAPIView):
    serializer_class = FoodListingSerializer
    permission_classes = [permissions.IsAuthenticated, IsDonor]

    def get_queryset(self):
        # FIX: select_related prevents N+1 on author lookup in serializer
        from django.utils import timezone
        return FoodListing.objects.select_related(
            'author', 'matched_user'
        ).filter(
            status='available', listing_type='request', expiry_date__gt=timezone.now()
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        data = cache_service.get_or_set(
            'food_requests:pending',
            lambda: FoodListingSerializer(self.get_queryset(), many=True).data,
            ttl=60
        )
        return success_response(data=data, message="Available requests retrieved.")


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
        listing.status = 'completed'
        listing.save(update_fields=['matched_user', 'status', 'updated_at'])
        cache_service.invalidate('food_requests:pending')
        return success_response(data=FoodListingSerializer(listing).data, message='Request accepted successfully')
