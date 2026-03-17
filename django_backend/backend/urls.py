"""
URL configuration for backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Import admin views for food data
from donors.views import AdminFoodPostsView
from recipients.views import AdminFoodRequestsView
from accounts.views import (
    AdminPendingReceiversView,
    AdminApproveReceiverView,
    AdminRejectReceiverView,
    AdminListUsersView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth + profile + admin user management
    path('api/', include('accounts.urls')),

    # Donor routes: /api/donor/listings/, /api/donor/posts/, etc.
    path('api/donor/', include('donors.urls')),

    # Recipient routes: /api/recipient/requests/, /api/recipient/food-requests/, etc.
    path('api/recipient/', include('recipients.urls')),

    # NEW: top-level food posts (spec requires /api/food-posts/)
    path('api/food-posts/', include('donors.urls')),      # routes to FoodPostViewSet via donors router

    # NEW: top-level food requests (spec requires /api/food-requests/)
    path('api/food-requests/', include('recipients.urls')),

    # NEW: explicit admin panel routes
    path('api/admin/receivers/', AdminPendingReceiversView.as_view(), name='admin-receivers'),
    path('api/admin/receivers/<uuid:pk>/approve/', AdminApproveReceiverView.as_view(), name='admin-approve'),
    path('api/admin/receivers/<uuid:pk>/reject/', AdminRejectReceiverView.as_view(), name='admin-reject'),
    path('api/admin/users/', AdminListUsersView.as_view(), name='admin-users'),
    path('api/admin/food-posts/', AdminFoodPostsView.as_view(), name='admin-food-posts'),
    path('api/admin/food-requests/', AdminFoodRequestsView.as_view(), name='admin-food-requests'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
