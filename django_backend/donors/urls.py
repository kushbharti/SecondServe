from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoodListingViewSet, FoodPostViewSet, AvailableRequestsView, AcceptRequestView, AdminFoodPostsView

router = DefaultRouter()
router.register(r'listings', FoodListingViewSet, basename='listing')
router.register(r'posts', FoodPostViewSet, basename='food-post')

urlpatterns = [
    path('', include(router.urls)),
    path('available-requests/', AvailableRequestsView.as_view(), name='available-requests'),
    path('accept-request/<uuid:pk>/', AcceptRequestView.as_view(), name='accept-request'),
    # Admin food posts
    path('admin-posts/', AdminFoodPostsView.as_view(), name='admin-food-posts'),
]
