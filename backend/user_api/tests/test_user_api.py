from django.core.signing import Signer
from django.test import TestCase, Client
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, RequestsClient
from users.models import User
from django.contrib.auth.models import Group
from user_api.serializers import (
    UserRegistrationSerializer, UserLoginSerializer, ChangePasswordSerializer, ChangeNameSerializer
)
from users.models.users import EmailConfirmationToken


class UserRegistrationAPIViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=None)
        self.url = reverse('register-list')

    def test_register_user(self):
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            "last_name": "New",
            "first_name": "User",
            "patronymic": "1",
            'password': 'NewPass123',
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='newuser@example.com').exists())

    def test_register_duplicate_user(self):
        new_user = User.objects.create_user(
            email='newuser@example.com',
            password='NewPass123',
            username='newuser'
        )
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            "last_name": "New",
            "first_name": "User",
            "patronymic": "1",
            'password': 'NewPass123',
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_user_data(self):
        data = {
            'email': 'newuser',
            'password': '123',
            'username': ''
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class UserLoginModelViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            username='testuser'
        )
        self.url = reverse('login-list')

    def test_login_user(self):
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('email', response.data)

    def test_invalid_login(self):
        data = {
            'email': 'test@example.com',
            'password': 'WrongPass123'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class UserLogoutViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            username='testuser'
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('logout-list')

    def test_logout_user(self):
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CurrentUserViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            username='testuser'
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('current-user-list')

    def test_get_current_user(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('email', response.data)


class UserChangePasswordModelViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            username='testuser'
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('change-password-list')

    def test_change_password(self):
        data = {
            'old_password': 'TestPass123',
            'new_password': 'NewPass123'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass123'))

    def test_invalid_old_password(self):
        data = {
            'old_password': 'WrongOldPass',
            'new_password': 'NewPass123'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AssignDoctorGroupModelViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_superuser(
            email='testadmin@example.com',
            password='TestPass123',
            username='testadmin'
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('assign-doctor-group-list')

    def test_assign_doctor_group(self):
        data = {
            'user_id': self.user.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.user.groups.filter(name='Doctors').exists())

    def test_invalid_doctor_group(self):
        user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            username='testuser'
        )
        self.client.force_authenticate(user=user)
        data = {
            'user_id': user.id
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(self.user.groups.filter(name='Doctors').exists())


class UpdateNameModelViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            username='testuser',
            first_name='OldFirst',
            last_name='OldLast'
        )
        self.client.force_authenticate(user=self.user)
        self.url = reverse('update-name-list')

    def test_update_name(self):
        data = {
            'first_name': 'NewFirst',
            'last_name': 'NewLast'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'NewFirst')
        self.assertEqual(self.user.last_name, 'NewLast')

    def test_invalid_name(self):
        data = {
            'first_name': '123',
            'last_name': '456'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)