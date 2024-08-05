from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()


class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create_user(email='test@example.com', password='testpass123', username='testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertFalse(user.is_staff)
        self.assertTrue(user.is_active)
        self.assertEqual(user.username, 'testuser')

    def test_create_superuser(self):
        superuser = User.objects.create_superuser(email='super@example.com', password='superpass123', username='superuser')
        self.assertEqual(superuser.email, 'super@example.com')
        self.assertTrue(superuser.check_password('superpass123'))
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertTrue(superuser.is_active)
        self.assertEqual(superuser.username, 'superuser')

    def test_required_fields(self):
        with self.assertRaises(ValueError):
            User.objects._create_user(email='', password='testpass123', username='testuser')
        with self.assertRaises(ValueError):
            User.objects._create_user(email='test@example.com', password='', username='testuser')
        with self.assertRaises(ValueError):
            User.objects._create_user(email='test@example.com', password='testpass123', username='')

    def test_unique_fields(self):
        User.objects.create_user(email='unique@example.com', password='testpass123', username='uniqueuser')
        with self.assertRaises(ValidationError):
            user = User(email='unique@example.com', password='testpass123', username='anotheruser')
            user.full_clean()
        with self.assertRaises(ValidationError):
            user = User(email='another@example.com', password='testpass123', username='uniqueuser')
            user.full_clean()

    def test_get_full_name(self):
        user = User.objects.create_user(email='fullname@example.com', password='testpass123', username='fullnameuser', first_name='John', last_name='Doe')
        self.assertEqual(user.get_full_name(), 'John Doe')

    def test_get_short_name(self):
        user = User.objects.create_user(email='shortname@example.com', password='testpass123', username='shortnameuser', first_name='John')
        self.assertEqual(user.get_short_name(), 'John')

    def test_email_user(self):
        user = User.objects.create_user(email='emailuser@example.com', password='testpass123', username='emailuser')
        # This test only checks if the method can be called without errors
        user.email_user(subject='Test Subject', message='Test Message')