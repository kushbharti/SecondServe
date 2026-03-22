"""
URL configuration for backend project.

Route structure:
  POST /api/auth/register/                  — registration
  POST /api/auth/login/                     — login
  POST /api/auth/logout/                    — logout (blacklist refresh token)
  POST /api/auth/token/refresh/             — silent token refresh
  GET/PATCH /api/auth/profile/              — user profile

  /api/donor/listings/                      — donor CRUD on FoodListing (legacy)
  /api/donor/available-requests/            — donor sees open receiver requests
  /api/donor/accept-request/<id>/           — donor accepts a receiver's request

  /api/recipient/requests/                  — recipient CRUD on FoodListing (legacy)
  /api/recipient/available-listings/        — recipient sees available donations
  /api/recipient/request/<id>/              — recipient claims a donation
  /api/recipient/request/<id>/cancel/       — recipient cancels claim
  /api/recipient/request/<id>/complete/     — recipient marks as completed
  /api/recipient/my-requests/              — recipient's accepted donations

  /api/food-posts/                          — NEW: public-browsable FoodPost list
  /api/food-posts/<id>/                     — NEW: single FoodPost detail
  /api/food-requests/                       — NEW: FoodRequest CRUD for receivers

  /api/admin/receivers/                     — admin: list receivers by status
  /api/admin/receivers/<id>/approve/        — admin: approve receiver
  /api/admin/receivers/<id>/reject/         — admin: reject receiver
  /api/admin/users/                         — admin: all users
  /api/admin/food-posts/                    — admin: all food posts
  /api/admin/food-requests/                 — admin: all food requests
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import SimpleRouter

# FIX: Register FoodPostViewSet and FoodRequestViewSet at top level
# to avoid the routing conflict caused by including the full donors.urls
# and recipients.urls twice.
from donors.views import FoodPostViewSet
from recipients.views import FoodRequestViewSet

# Admin + donor + recipient panel views
from donors.views import AdminFoodPostsView
from recipients.views import AdminFoodRequestsView
from accounts.views import (
    AdminPendingReceiversView,
    AdminApproveReceiverView,
    AdminRejectReceiverView,
    AdminListUsersView,
)

# --- Top-level routers for the new /api/food-posts/ and /api/food-requests/ ---
food_post_router = SimpleRouter()
food_post_router.register(r'api/food-posts', FoodPostViewSet, basename='food-post')

food_request_router = SimpleRouter()
food_request_router.register(r'api/food-requests', FoodRequestViewSet, basename='food-request')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth + profile + admin user management
    path('api/', include('accounts.urls')),

    # Donor routes: /api/donor/listings/, /api/donor/available-requests/, etc.
    path('api/donor/', include('donors.urls')),

    # Recipient routes: /api/recipient/requests/, /api/recipient/my-requests/, etc.
    path('api/recipient/', include('recipients.urls')),

    # Admin panel routes
    path('api/admin/receivers/', AdminPendingReceiversView.as_view(), name='admin-receivers'),
    path('api/admin/receivers/<uuid:pk>/approve/', AdminApproveReceiverView.as_view(), name='admin-approve'),
    path('api/admin/receivers/<uuid:pk>/reject/', AdminRejectReceiverView.as_view(), name='admin-reject'),
    path('api/admin/users/', AdminListUsersView.as_view(), name='admin-users'),
    path('api/admin/food-posts/', AdminFoodPostsView.as_view(), name='admin-food-posts'),
    path('api/admin/food-requests/', AdminFoodRequestsView.as_view(), name='admin-food-requests'),
]

# FIX: Add separate top-level routers (no duplication of donor/recipient router URLs)
urlpatterns += food_post_router.urls
urlpatterns += food_request_router.urls

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
