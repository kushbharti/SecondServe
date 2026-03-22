"""
Integration tests for the donors app.

Run with:
    python manage.py test donors --verbosity=2
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from donors.models import FoodListing, FoodPost

User = get_user_model()

LOGIN_URL = '/api/auth/login/'
LISTINGS_URL = '/api/donor/listings/'
AVAILABLE_REQUESTS_URL = '/api/donor/available-requests/'
FOOD_POSTS_URL = '/api/food-posts/'


def make_donor(**kwargs):
    defaults = {
        'email': 'donor@example.com',
        'password': 'Secure1!',
        'role': 'DONOR',
        'verification_status': 'approved',
    }
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


def make_receiver(**kwargs):
    defaults = {
        'email': 'ngo@example.com',
        'password': 'Secure1!',
        'role': 'NGO',
        'verification_status': 'approved',
    }
    defaults.update(kwargs)
    return User.objects.create_user(**defaults)


class FoodListingViewSetTest(TestCase):
    """CRUD for the legacy FoodListing model."""

    def setUp(self):
        self.client = APIClient()
        self.donor = make_donor()
        res = self.client.post(LOGIN_URL, {
            'email': 'donor@example.com',
            'password': 'Secure1!',
        }, format='json')
        self.token = res.json()['data']['access']
        self.auth_header = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}
        self.listing_payload = {
            'title': 'Biryani',
            'description': '50 plates of chicken biryani',
            'food_type': 'non-veg',
            'quantity': '50 plates',
            'pickup_address': '123 Main St',
            'expiry_date': '2030-01-01T12:00:00Z',
        }

    def test_create_listing(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.post(LISTINGS_URL, self.listing_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.json()['data']['title'], 'Biryani')

    def test_create_listing_unauthenticated(self):
        res = self.client.post(LISTINGS_URL, self.listing_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_own_listings(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        self.client.post(LISTINGS_URL, self.listing_payload, format='json')
        res = self.client.get(LISTINGS_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()['data']), 1)

    def test_receiver_cannot_create_donation(self):
        """Receivers should not be able to post to the donor listings endpoint."""
        receiver = make_receiver(email='ngo2@example.com')
        res = self.client.post(LOGIN_URL, {
            'email': 'ngo2@example.com',
            'password': 'Secure1!',
        }, format='json')
        token = res.json()['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.post(LISTINGS_URL, self.listing_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class FoodPostPublicAccessTest(TestCase):
    """Public food post listing — no auth required."""

    def setUp(self):
        self.client = APIClient()
        self.donor = make_donor()
        self.post = FoodPost.objects.create(
            donor=self.donor,
            food_name='Bread',
            quantity='20 loaves',
            food_type='veg',
            status='available',
        )
        # Hidden post — should not appear in public listing
        FoodPost.objects.create(
            donor=self.donor,
            food_name='Cake',
            quantity='10 pieces',
            food_type='veg',
            status='completed',
        )

    def test_public_list_shows_only_available(self):
        res = self.client.get(FOOD_POSTS_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()['data']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['food_name'], 'Bread')

    def test_create_food_post_requires_auth(self):
        res = self.client.post(FOOD_POSTS_URL, {
            'food_name': 'Rice',
            'quantity': '10 kg',
            'food_type': 'veg',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class AcceptRequestTest(TestCase):
    """Donor accepts a receiver's food request (legacy FoodListing flow)."""

    def setUp(self):
        self.client = APIClient()
        self.donor = make_donor()
        self.receiver = make_receiver()
        # Create an open receiver request
        self.request_listing = FoodListing.objects.create(
            author=self.receiver,
            listing_type='request',
            title='Need Rice',
            description='50 kg rice needed',
            food_type='veg',
            quantity='50 kg',
            pickup_address='456 NGO Lane',
            expiry_date='2030-01-01T12:00:00Z',
            status='available',
        )
        res = self.client.post(LOGIN_URL, {
            'email': 'donor@example.com',
            'password': 'Secure1!',
        }, format='json')
        self.token = res.json()['data']['access']

    def test_accept_request(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.post(f'/api/donor/accept-request/{self.request_listing.pk}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.request_listing.refresh_from_db()
        self.assertEqual(self.request_listing.status, 'assigned')
        self.assertEqual(self.request_listing.matched_user, self.donor)

    def test_accept_already_assigned_request(self):
        self.request_listing.status = 'assigned'
        self.request_listing.save()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.post(f'/api/donor/accept-request/{self.request_listing.pk}/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
