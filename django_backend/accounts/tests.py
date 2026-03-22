"""
Unit + integration tests for the accounts app.

Run with:
    python manage.py test accounts --verbosity=2
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

REGISTER_URL = '/api/auth/register/'
LOGIN_URL = '/api/auth/login/'
LOGOUT_URL = '/api/auth/logout/'
PROFILE_URL = '/api/auth/profile/'


class DonorRegistrationTest(TestCase):
    """Donor registration — auto-approved, tokens returned."""

    def setUp(self):
        self.client = APIClient()
        self.payload = {
            'email': 'donor@example.com',
            'password': 'Secure1!',
            'password_confirm': 'Secure1!',
            'role': 'DONOR',
        }

    def test_register_donor_success(self):
        res = self.client.post(REGISTER_URL, self.payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        self.assertTrue(data['success'])
        self.assertIn('access', data['data'])
        self.assertIsNotNone(data['data']['access'])

    def test_register_donor_password_mismatch(self):
        self.payload['password_confirm'] = 'Different1!'
        res = self.client.post(REGISTER_URL, self.payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(res.json()['success'])

    def test_register_donor_duplicate_email(self):
        self.client.post(REGISTER_URL, self.payload, format='json')
        res = self.client.post(REGISTER_URL, self.payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_donor_weak_password(self):
        self.payload['password'] = 'password'
        self.payload['password_confirm'] = 'password'
        res = self.client.post(REGISTER_URL, self.payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class ReceiverRegistrationTest(TestCase):
    """Receiver registration — pending approval, no tokens."""

    def setUp(self):
        self.client = APIClient()
        self.payload = {
            'email': 'ngo@example.com',
            'password': 'Secure1!',
            'password_confirm': 'Secure1!',
            'role': 'NGO',
            'organization_name': 'Test NGO',
            'contact_person': 'Jane Doe',
            'phone_number': '9876543210',
            'registration_number': 'REG12345',
            'registration_type': 'Trust',
            'pan_number': 'ABCDE1234F',
            'registration_certificate_url': 'https://example.com/cert.pdf',
            'address_line1': '123 Main St',
            'city': 'Mumbai',
            'district': 'Mumbai',
            'state': 'Maharashtra',
            'pincode': '400001',
            'capacity_people_served': 100,
        }

    def test_register_ngo_pending(self):
        res = self.client.post(REGISTER_URL, self.payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        data = res.json()
        self.assertTrue(data['success'])
        # Tokens must be null for pending receivers
        self.assertIsNone(data['data']['access'])
        self.assertIsNone(data['data']['refresh'])
        self.assertEqual(data['data']['user']['verification_status'], 'pending')

    def test_register_ngo_missing_required_field(self):
        del self.payload['organization_name']
        res = self.client.post(REGISTER_URL, self.payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTest(TestCase):
    """Login — valid credentials, wrong role, unapproved receiver."""

    def setUp(self):
        self.client = APIClient()
        self.donor = User.objects.create_user(
            email='donor@example.com',
            password='Secure1!',
            role='DONOR',
            verification_status='approved',
        )
        self.unapproved_ngo = User.objects.create_user(
            email='ngo@example.com',
            password='Secure1!',
            role='NGO',
            verification_status='pending',
        )

    def test_login_donor_success(self):
        res = self.client.post(LOGIN_URL, {
            'email': 'donor@example.com',
            'password': 'Secure1!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data['success'])
        self.assertIn('access', data['data'])

    def test_login_wrong_password(self):
        res = self.client.post(LOGIN_URL, {
            'email': 'donor@example.com',
            'password': 'WrongPass!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_unapproved_receiver(self):
        res = self.client.post(LOGIN_URL, {
            'email': 'ngo@example.com',
            'password': 'Secure1!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_login_wrong_role(self):
        res = self.client.post(LOGIN_URL, {
            'email': 'donor@example.com',
            'password': 'Secure1!',
            'role': 'NGO',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileTest(TestCase):
    """Profile endpoint — authenticated access."""

    def setUp(self):
        self.client = APIClient()
        self.donor = User.objects.create_user(
            email='donor@example.com',
            password='Secure1!',
            role='DONOR',
            verification_status='approved',
        )

    def _login(self):
        res = self.client.post(LOGIN_URL, {
            'email': 'donor@example.com',
            'password': 'Secure1!',
        }, format='json')
        return res.json()['data']['access']

    def test_get_profile(self):
        token = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        res = self.client.get(PROFILE_URL)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.json()['data']['email'], 'donor@example.com')

    def test_get_profile_unauthenticated(self):
        res = self.client.get(PROFILE_URL)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutTest(TestCase):
    """Logout — blacklists the refresh token."""

    def setUp(self):
        self.client = APIClient()
        self.donor = User.objects.create_user(
            email='donor@example.com',
            password='Secure1!',
            role='DONOR',
            verification_status='approved',
        )

    def _login(self):
        res = self.client.post(LOGIN_URL, {
            'email': 'donor@example.com',
            'password': 'Secure1!',
        }, format='json')
        return res.json()['data']

    def test_logout_success(self):
        tokens = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
        res = self.client.post(LOGOUT_URL, {'refresh': tokens['refresh']}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.json()['success'])
