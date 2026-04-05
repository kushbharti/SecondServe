from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model
from .serializers import (
    UserRegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
)
from .permissions import IsAdmin
from backend.cache import cache_service, TTL_MEDIUM, build_user_profile_key

User = get_user_model()


class LoginRateThrottle(AnonRateThrottle):
    """Tighter throttle for the login endpoint — 10 attempts/min."""
    scope = 'login'

DONOR_ROLES = ('DONOR',)
RECEIVER_ROLES = ('NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'GOVERNMENT_HOSPITAL')


def success_response(data, message="Success", status_code=status.HTTP_200_OK):
    """Unified success response wrapper."""
    return Response(
        {"success": True, "message": message, "data": data},
        status=status_code,
    )


def error_response(message="Error", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Unified error response wrapper."""
    payload = {"success": False, "message": message}
    if errors is not None:
        payload["errors"] = errors
    return Response(payload, status=status_code)


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserRegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                message="Registration failed. Please correct the errors below.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.save()

        # FIXED: Only return JWT tokens for donors (auto-approved).
        # Receivers are pending — they must wait for admin approval.
        role = user.role
        if role in DONOR_ROLES:
            refresh = RefreshToken.for_user(user)
            refresh['role'] = user.role
            refresh['verification_status'] = user.verification_status
            return success_response(
                data={
                    "user": UserProfileSerializer(user).data,
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                message="Registration successful. Welcome!",
                status_code=status.HTTP_201_CREATED,
            )
        else:
            # Receiver: pending approval
            return success_response(
                data={
                    "user": UserProfileSerializer(user).data,
                    "access": None,
                    "refresh": None,
                },
                message=(
                    "Registration successful! Your account is pending admin approval. "
                    "You will be notified once your account is approved."
                ),
                status_code=status.HTTP_201_CREATED,
            )


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as exc:
            # Check if this is the receiver pending error
            errors = getattr(exc, 'detail', {})
            if isinstance(errors, dict):
                detail = errors.get('detail', '')
                vs = errors.get('verification_status', '')
                if vs in ('pending', 'rejected'):
                    return error_response(
                        message=str(detail),
                        errors={"verification_status": vs},
                        status_code=status.HTTP_403_FORBIDDEN,
                    )
            return error_response(
                message="Invalid credentials. Please check your details and try again.",
                errors=errors if isinstance(errors, dict) else {"detail": str(errors)},
                status_code=status.HTTP_401_UNAUTHORIZED,
            )

        data = serializer.validated_data
        return success_response(
            data={
                "access": data.get("access"),
                "refresh": data.get("refresh"),
                "role": data.get("role"),
                "user": data.get("user"),
            },
            message="Login successful.",
            status_code=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        cache_key = build_user_profile_key(str(user.id))
        data = cache_service.get_or_set(
            cache_key,
            lambda: UserProfileSerializer(user).data,
            ttl=TTL_MEDIUM,
        )
        return success_response(data=data, message="Profile retrieved.")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = UserProfileSerializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return error_response(
                message="Profile update failed.",
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
        # Invalidate cached profile so next GET is fresh
        cache_service.invalidate_user_profile(str(instance.id))
        return success_response(
            data=serializer.data,
            message="Profile updated successfully.",
        )


# ---------------------------------------------------------------------------
# Admin Views
# ---------------------------------------------------------------------------

class AdminPendingReceiversView(APIView):
    """GET /api/admin/receivers/ — list receivers by status."""
    permission_classes = [IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get('status', 'pending')
        users = User.objects.filter(
            role__in=RECEIVER_ROLES,
            verification_status=status_filter
        ).order_by('-date_joined')
        return success_response(
            data=UserProfileSerializer(users, many=True).data,
            message=f"Receivers with status '{status_filter}' retrieved.",
        )


class AdminApproveReceiverView(APIView):
    """PATCH /api/admin/receivers/<id>/approve/ — approve a receiver."""
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk, role__in=RECEIVER_ROLES)
        except User.DoesNotExist:
            return error_response("Receiver not found.", status_code=status.HTTP_404_NOT_FOUND)
        user.verification_status = 'approved'
        user.save()
        return success_response(
            data=UserProfileSerializer(user).data,
            message=f"Account for {user.email} has been approved.",
        )


class AdminRejectReceiverView(APIView):
    """PATCH /api/admin/receivers/<id>/reject/ — reject a receiver."""
    permission_classes = [IsAdmin]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk, role__in=RECEIVER_ROLES)
        except User.DoesNotExist:
            return error_response("Receiver not found.", status_code=status.HTTP_404_NOT_FOUND)
        user.verification_status = 'rejected'
        user.save()
        return success_response(
            data=UserProfileSerializer(user).data,
            message=f"Account for {user.email} has been rejected.",
        )


class AdminListUsersView(generics.ListAPIView):
    """GET /api/admin/users/ — list all users."""
    permission_classes = [IsAdmin]
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        return success_response(
            data=UserProfileSerializer(qs, many=True).data,
            message="All users retrieved.",
        )


# ---------------------------------------------------------------------------
# Admin Views
# ---------------------------------------------------------------------------

class AdminDashboardStatsView(APIView):
    """GET /api/admin/dashboard-stats/ — returns high level metrics."""
    permission_classes = [IsAdmin]

    def get(self, request):
        receivers = User.objects.filter(role__in=RECEIVER_ROLES)
        total = receivers.count()
        approved = receivers.filter(verification_status='approved').count()
        rejected = receivers.filter(verification_status='rejected').count()
        pending = receivers.filter(verification_status='pending').count()

        return success_response(data={
            "total_requests": total,
            "approved": approved,
            "rejected": rejected,
            "pending": pending
        }, message="Dashboard stats retrieved.")

class AdminReceiverInsightsView(APIView):
    """GET /api/admin/receiver-insights/ — returns analytics per receiver."""
    permission_classes = [IsAdmin]

    def get(self, request):
        # We'll use aggregation/annotation for efficiency or just loop
        from django.db.models import Count, Q
        from donors.models import FoodPost
        from recipients.models import FoodRequest

        receivers = User.objects.filter(role__in=RECEIVER_ROLES).order_by('role', '-date_joined')
        
        insights = []
        for r in receivers:
            org_name = r.organization_name or r.hospital_name or r.full_name or "Unknown Org"
            requests_created = FoodRequest.objects.filter(receiver=r).count()
            requests_fulfilled = FoodRequest.objects.filter(receiver=r, status='completed').count()
            requests_pending = FoodRequest.objects.filter(receiver=r, status='pending').count()
            donations_accepted = FoodPost.objects.filter(accepted_by=r).count()
            
            insights.append({
                "id": str(r.id),
                "organization_name": org_name,
                "role": r.role,
                "email": r.email,
                "verification_status": r.verification_status,
                "requests_created": requests_created,
                "requests_fulfilled": requests_fulfilled,
                "requests_pending": requests_pending,
                "donations_accepted": donations_accepted,
            })

        return success_response(data=insights, message="Receiver insights retrieved.")

# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------

class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Body: { "refresh": "<refresh_token>" }
    Blacklists the refresh token so it can no longer be used to obtain
    new access tokens. The client should discard both tokens.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return error_response(
                message="Refresh token is required.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except (TokenError, InvalidToken) as e:
            return error_response(
                message="Invalid or already-blacklisted token.",
                errors={"detail": str(e)},
                status_code=status.HTTP_400_BAD_REQUEST,
            )
        return success_response(data={}, message="Logged out successfully.")
