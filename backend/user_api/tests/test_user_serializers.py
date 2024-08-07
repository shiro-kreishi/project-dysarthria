from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.signing import Signer
from rest_framework.exceptions import ValidationError
from user_api.serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    UserWithIdSerializer, ChangePasswordSerializer, ChangeNameSerializer
)

UserModel = get_user_model()


class UserRegistrationSerializerTest(TestCase):
    def test_create_user(self):
        serializer = UserRegistrationSerializer(data={
            'email': 'test@example.com',
            'password': 'TestPass123',
            'username': 'testuser'
        })
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertFalse(user.is_active)
        self.assertTrue(user.check_password('TestPass123'))

    def test_password_validation(self):
        serializer = UserRegistrationSerializer(data={
            'email': 'test@example.com',
            'password': 'weak',
            'username': 'testuser'
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)


class UserLoginSerializerTest(TestCase):
    def setUp(self):
        self.user = UserModel.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            username='testuser'
        )

    def test_check_user(self):
        serializer = UserLoginSerializer(data={
            'email': 'test@example.com',
            'password': 'TestPass123'
        })
        self.assertTrue(serializer.is_valid())
        user = serializer.check_user(serializer.validated_data)
        self.assertEqual(user, self.user)

    def test_invalid_credentials(self):
        data = {
            'email': 'test@example.com',
            'password': 'WrongPass'
        }
        serializer = UserLoginSerializer(data=data)
        with self.assertRaises(ValidationError):
            if serializer.is_valid():
                serializer.check_user(serializer.validated_data)


class ChangePasswordSerializerTest(TestCase):
    def setUp(self):
        self.user = UserModel.objects.create_user(
            email='test@example.com',
            password='OldPass123',
            username='testuser'
        )

    def test_change_password(self):
        serializer = ChangePasswordSerializer(
            data={'old_password': 'OldPass123', 'new_password': 'NewPass123'},
            context={'request': type('Request', (object,), {'user': self.user})}
        )
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertTrue(user.check_password('NewPass123'))

    def test_invalid_old_password(self):
        serializer = ChangePasswordSerializer(
            data={'old_password': 'WrongOldPass', 'new_password': 'NewPass123'},
            context={'request': type('Request', (object,), {'user': self.user})}
        )
        with self.assertRaises(ValidationError):
            serializer.is_valid(raise_exception=True)


class ChangeNameSerializerTest(TestCase):
    def setUp(self):
        self.user = UserModel.objects.create_user(
            email='test@example.com',
            password='TestPass123',
            username='testuser',
            first_name='OldFirst',
            last_name='OldLast'
        )

    def test_change_name(self):
        serializer = ChangeNameSerializer(
            instance=self.user,
            data={'first_name': 'NewFirst', 'last_name': 'NewLast'},
            partial=True
        )
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.first_name, 'NewFirst')
        self.assertEqual(user.last_name, 'NewLast')

    def test_invalid_name(self):
        serializer = ChangeNameSerializer(
            instance=self.user,
            data={'first_name': '123', 'last_name': '456'},
            partial=True
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn('first_name', serializer.errors)
        self.assertIn('last_name', serializer.errors)