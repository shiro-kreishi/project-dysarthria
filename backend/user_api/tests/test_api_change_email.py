from datetime import datetime, timedelta

import pytz
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from project import settings
from user_api.utils import create_confirmation_token, generate_signed_token
from users.models import User, EmailConfirmationToken


class CreatingChangeEmailTokenViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='testuser',
            email='test@example.com',
            is_active=True,
            # password='eX@2mplePassWorD'
        )
        self.user.set_password('eX@2mplePassWorD')

        self.client.force_authenticate(user=self.user)

        self.change_email_url_str = 'change-email-list'

    def test_getting_change_email_token(self):
        url = reverse(self.change_email_url_str)
        data = {
            "new_email": "newemail@example.com",
            "password": 'eX@2mplePassWorD'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(EmailConfirmationToken.objects.filter(user=self.user, is_changing_email=True).exists())

    def test_getting_change_email_token_with_wrong_password(self):
        url = reverse(self.change_email_url_str)
        data = {
            "new_email": "newemail@example.com",
            "password": "WrOnGP@ssword%"
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)
        self.assertFalse(EmailConfirmationToken.objects.filter(user=self.user).exists())

    def test_getting_change_email_token_with_wrong_email(self):
        url = reverse(self.change_email_url_str)
        data = {
            "new_email": "invalid-email",
            "password": "eX@2mplePassWorD"
        }
        response = self.client.post(url, data, format='json')
        print(response.data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_email', response.data)
        self.assertFalse(EmailConfirmationToken.objects.filter(user=self.user).exists())

    def test_getting_change_email_token_with_wrong_email_and_password(self):
        url = reverse(self.change_email_url_str)
        data = {
            'new_email': 'invalid-email',
            'password': 'wrongpassword'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('new_email', response.data)
        # self.assertIn('password', response.data)
        self.assertFalse(EmailConfirmationToken.objects.filter(user=self.user).exists())


class ConfirmChangeEmailViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='testuser',
            email='test@example.com',
            is_active=True,
            password='eX@2mplePassWorD'
        )

        self.confirm_email_url_str = 'user-confirm-email-list'
        self.raw_token = generate_signed_token(self.user)

    def test_confirm_change_email(self):
        token = EmailConfirmationToken.objects.create(
            user_id=self.user.id,
            token=self.raw_token,
            is_changing_email=True,
            created_at=datetime.now(pytz.UTC),
            changed_email='newemail@example.com'
        )

        url = reverse(self.confirm_email_url_str) + f'{token.token}/'
        response = self.client.get(url)
        self.user.refresh_from_db()

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.user.email, token.changed_email)
        self.assertFalse(EmailConfirmationToken.objects.filter(token=token.token).exists())

    def test_confirm_change_email_with_expired_token(self):
        token_expired = EmailConfirmationToken.objects.create(
            user_id=self.user.id,
            token=self.raw_token,
            is_changing_email=True,
            created_at=datetime.now(pytz.UTC) - timedelta(minutes=settings.EMAIL_CONFIRMATION_TOKEN_LIFETIME) - timedelta(minutes=30),
            changed_email='newemail@example.com',
        )
        token_expired.created_at = datetime.now(pytz.UTC) - timedelta(minutes=settings.EMAIL_CONFIRMATION_TOKEN_LIFETIME) - timedelta(minutes=30)
        token_expired.save()
        url = reverse(self.confirm_email_url_str) + f'{token_expired.token}/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        if settings.DEBUG:
            self.assertEqual(response.data['error'], 'Token has expired. Token has deleted')
        else:
            self.assertEqual(response.data['error'], 'Invalid token or user.')

        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'test@example.com')

        self.assertFalse(EmailConfirmationToken.objects.filter(token=token_expired.token).exists())

    def test_confirm_change_email_without_flag(self):
        token_without_flag = EmailConfirmationToken.objects.create(
            user_id=self.user.id,
            token=self.raw_token,
            is_changing_email=False,
            created_at=datetime.now(pytz.UTC),
            changed_email='newemail@example.com'
        )

        url = reverse(self.confirm_email_url_str) + f'{token_without_flag.token}/'
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        if settings.DEBUG:
            self.assertEqual(response.data['error'], 'User is activated. But he has token.')
        else:
            self.assertEqual(response.data['error'], 'Invalid token or user.')


        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'test@example.com')

        self.assertFalse(EmailConfirmationToken.objects.filter(token=token_without_flag.token).exists())


