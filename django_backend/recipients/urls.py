from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AvailableListingsView, RequestListingView, MyRequestsView,
    CancelRequestView, RecipientListingViewSet,
    FoodRequestViewSet, AdminFoodRequestsView,
    CompleteListingView,
)

router = DefaultRouter()
router.register(r'requests', RecipientListingViewSet, basename='request')
router.register(r'food-requests', FoodRequestViewSet, basename='food-request')

urlpatterns = [
    path('', include(router.urls)),
    path('available-listings/', AvailableListingsView.as_view(), name='available-listings'),
    path('request/<uuid:pk>/', RequestListingView.as_view(), name='accept-donation'),
    path('my-requests/', MyRequestsView.as_view(), name='my-requests'),
    path('request/<uuid:pk>/cancel/', CancelRequestView.as_view(), name='cancel-donation'),
    path('request/<uuid:pk>/complete/', CompleteListingView.as_view(), name='complete-donation'),
    # Admin food requests
    path('admin-requests/', AdminFoodRequestsView.as_view(), name='admin-food-requests'),
]
