from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    UserProfileView,
    AdminPendingReceiversView,
    AdminApproveReceiverView,
    AdminRejectReceiverView,
    AdminListUsersView,
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/profile/update/', UserProfileView.as_view(), name='profile_update'),

    # Admin routes (protected by IsAdmin permission)
    path('admin/receivers/', AdminPendingReceiversView.as_view(), name='admin-receivers'),
    path('admin/receivers/<uuid:pk>/approve/', AdminApproveReceiverView.as_view(), name='admin-approve-receiver'),
    path('admin/receivers/<uuid:pk>/reject/', AdminRejectReceiverView.as_view(), name='admin-reject-receiver'),
    path('admin/users/', AdminListUsersView.as_view(), name='admin-users'),
]
