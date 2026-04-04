"""
URL configuration for backend project.

Route structure:
  POST /api/auth/register/                  — registration
  POST /api/auth/login/                     — login
  POST /api/auth/logout/                    — logout (blacklist refresh token)
  POST /api/auth/token/refresh/             — silent token refresh
  GET/PATCH /api/auth/profile/              — user profile

  /api/donor/listings/                      — donor CRUD on FoodListing (legacy)
  /api/donor/posts/                         — donor CRUD on FoodPost (new)
  /api/donor/available-requests/            — donor sees open receiver requests
  /api/donor/accept-request/<id>/           — donor accepts a receiver's request

  /api/recipient/requests/                  — recipient CRUD on FoodListing (legacy)
  /api/recipient/food-requests/             — recipient CRUD on FoodRequest (new)
  /api/recipient/available-listings/        — recipient sees available donations
  /api/recipient/request/<id>/              — recipient claims a donation
  /api/recipient/request/<id>/cancel/       — recipient cancels claim
  /api/recipient/request/<id>/complete/     — recipient marks as completed
  /api/recipient/my-requests/              — recipient's accepted donations

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

from donors.views import AdminFoodPostsView, FoodPostViewSet
from recipients.views import AdminFoodRequestsView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth + profile + admin user management
    path('api/', include('accounts.urls')),

    # Donor routes: /api/donor/listings/, /api/donor/posts/, etc.
    path('api/donor/', include('donors.urls')),

    # Public food posts list (unauthenticated)
    path('api/food-posts/', FoodPostViewSet.as_view({'get': 'list'}), name='public-food-posts'),

    # Recipient routes: /api/recipient/requests/, /api/recipient/food-requests/, etc.
    path('api/recipient/', include('recipients.urls')),

    # Admin panel routes
    path('api/admin/food-posts/', AdminFoodPostsView.as_view(), name='admin-food-posts'),
    path('api/admin/food-requests/', AdminFoodRequestsView.as_view(), name='admin-food-requests'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
