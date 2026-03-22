"""
Integration tests for the recipients app.

Run with:
    python manage.py test recipients --verbosity=2
"""
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from donors.models import FoodListing

User = get_user_model()

LOGIN_URL = '/api/auth/login/'
AVAILABLE_LISTINGS_URL = '/api/recipient/available-listings/'
MY_REQUESTS_URL = '/api/recipient/my-requests/'


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


class AvailableListingsTest(TestCase):
    """Receivers browse available donations."""

    def setUp(self):
        self.client = APIClient()
        self.donor = make_donor()
        self.receiver = make_receiver()
        self.listing = FoodListing.objects.create(
            author=self.donor,
            listing_type='donation',
            title='Pasta',
            description='30 portions',
            food_type='veg',
            quantity='30 portions',
            pickup_address='10 Main St',
            expiry_date='2030-01-01T12:00:00Z',
            status='available',
        )
        res = self.client.post(LOGIN_URL, {
            'email': 'ngo@example.com',
            'password': 'Secure1!',
        }, format='json')
        self.token = res.json()['data']['access']

    def test_list_available_donations(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.get(AVAILABLE_LISTINGS_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.json()['data']), 1)

    def test_unauthenticated_cannot_browse(self):
        res = self.client.get(AVAILABLE_LISTINGS_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class AcceptDonationTest(TestCase):
    """Receiver accepts (claims) a food listing."""

    def setUp(self):
        self.client = APIClient()
        self.donor = make_donor()
        self.receiver = make_receiver()
        self.listing = FoodListing.objects.create(
            author=self.donor,
            listing_type='donation',
            title='Soup',
            description='20 bowls',
            food_type='veg',
            quantity='20 bowls',
            pickup_address='10 Main St',
            expiry_date='2030-01-01T12:00:00Z',
            status='available',
        )
        res = self.client.post(LOGIN_URL, {
            'email': 'ngo@example.com',
            'password': 'Secure1!',
        }, format='json')
        self.token = res.json()['data']['access']

    def test_accept_donation(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.post(f'/api/recipient/request/{self.listing.pk}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.status, 'assigned')
        self.assertEqual(self.listing.matched_user, self.receiver)

    def test_cannot_accept_already_assigned(self):
        self.listing.status = 'assigned'
        self.listing.matched_user = self.receiver
        self.listing.save()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.post(f'/api/recipient/request/{self.listing.pk}/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class CompleteListingTest(TestCase):
    """Receiver marks an assigned donation as completed."""

    def setUp(self):
        self.client = APIClient()
        self.donor = make_donor()
        self.receiver = make_receiver()
        self.listing = FoodListing.objects.create(
            author=self.donor,
            listing_type='donation',
            title='Salad',
            description='25 servings',
            food_type='veg',
            quantity='25 servings',
            pickup_address='10 Main St',
            expiry_date='2030-01-01T12:00:00Z',
            status='assigned',
            matched_user=self.receiver,
        )
        res = self.client.post(LOGIN_URL, {
            'email': 'ngo@example.com',
            'password': 'Secure1!',
        }, format='json')
        self.token = res.json()['data']['access']

    def test_mark_completed(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.post(f'/api/recipient/request/{self.listing.pk}/complete/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.status, 'completed')

    def test_cannot_complete_if_not_owner(self):
        other_receiver = make_receiver(email='other@example.com')
        res = self.client.post(LOGIN_URL, {
            'email': 'other@example.com',
            'password': 'Secure1!',
        }, format='json')
        token = res.json()['data']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.post(f'/api/recipient/request/{self.listing.pk}/complete/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class CancelDonationTest(TestCase):
    """Receiver cancels their accepted donation."""

    def setUp(self):
        self.client = APIClient()
        self.donor = make_donor()
        self.receiver = make_receiver()
        self.listing = FoodListing.objects.create(
            author=self.donor,
            listing_type='donation',
            title='Cake',
            description='1 full cake',
            food_type='veg',
            quantity='1 cake',
            pickup_address='10 Main St',
            expiry_date='2030-01-01T12:00:00Z',
            status='assigned',
            matched_user=self.receiver,
        )
        res = self.client.post(LOGIN_URL, {
            'email': 'ngo@example.com',
            'password': 'Secure1!',
        }, format='json')
        self.token = res.json()['data']['access']

    def test_cancel_acceptance(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')
        res = self.client.patch(f'/api/recipient/request/{self.listing.pk}/cancel/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.listing.refresh_from_db()
        self.assertEqual(self.listing.status, 'available')
        self.assertIsNone(self.listing.matched_user)
