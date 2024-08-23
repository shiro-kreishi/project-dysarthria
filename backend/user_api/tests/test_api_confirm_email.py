from unittest.mock import patch

from django.test import TestCase
from django.core.signing import Signer, BadSignature

from project.settings import DEBUG
from users.models import User, EmailConfirmationToken
from user_api.utils import generate_signed_token, create_confirmation_token, verify_signed_token
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APITestCase


class TokenGenerationTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            email='test@example.com',
            password='TestPass123',
            username='testuser'
        )

    def test_generate_signed_token(self):
        token = generate_signed_token(self.user)
        self.assertIsNotNone(token)

    def test_create_confirmation_token(self):
        token = create_confirmation_token(self.user)
        self.assertIsNotNone(token)
        email_token = EmailConfirmationToken.objects.get(user=self.user)
        self.assertEqual(email_token.token, token)

    def test_verify_signed_token(self):
        token = generate_signed_token(self.user)
        email, user_id = verify_signed_token(token)
        self.assertEqual(email, self.user.email)
        self.assertEqual(user_id, str(self.user.id))

    def test_verify_signed_token_invalid(self):
        email, user_id = verify_signed_token('invalid_token')
        self.assertIsNone(email)
        self.assertIsNone(user_id)

    def test_verify_signed_token_bad_signature(self):
        with self.assertRaises(BadSignature):
            signer = Signer()
            signer.unsign_object('bad_signature')


class ConfirmEmailViewTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create(username='testuser', email='test@example.com', is_active=False)
        self.token = create_confirmation_token(self.user)
        self.url_str = 'user-confirm-email-list'

    def test_confirm_email_valid_token(self):
        url = reverse(self.url_str) + f'{self.token}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Email confirmed successfully')
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_confirm_email_invalid_token(self):
        url = reverse(self.url_str) + f'invalid-token/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        if DEBUG:
            self.assertEqual(response.data['error'], 'Field email or user_id is Null. Token is invalid')
        else:
            self.assertEqual(response.data['error'], 'Invalid token or user.')

    def test_confirm_email_expired_token(self):
        # Mocking the has_expired method to return True
        with patch.object(EmailConfirmationToken, 'has_expired', return_value=True):
            url = reverse(self.url_str) + f'{self.token}/'
            response = self.client.get(url)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            if DEBUG:
                self.assertEqual(response.data['error'], 'Token has expired. Token has deleted')
            else:
                self.assertEqual(response.data['error'], 'Invalid token or user.')
                self.user.refresh_from_db()

    def test_confirm_email_already_active(self):
        self.user.is_active = True
        self.user.save()
        url = reverse(self.url_str) + f'{self.token}/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        if DEBUG:
            self.assertEqual(response.data['error'], 'User is activated. But he has token.')
        else:
            self.assertEqual(response.data['error'], 'Invalid token.')