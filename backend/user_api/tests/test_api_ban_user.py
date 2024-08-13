from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import User


class TestBanUser(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.default_user1 = User.objects.create_user(
            email='user@default.cc',
            password='<PASSWORD>',
            username='user',
        )
        
        self.doctor = User.objects.create_user(
            email='doctor@default.cc',
            password='<PASSWORD>',
            username='doctor',
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        self.doctor.groups.add(doctor_group)
        self.doctor.save()

        self.admin = User.objects.create_user(
            email='admin@default.cc',
            password='<PASSWORD>',
            username='admin',
        )
        admin_group, created = Group.objects.get_or_create(name='Administrators')
        self.admin.groups.add(admin_group)
        self.admin.save()
        
        self.superuser = User.objects.create_superuser(
            email='superuser@default.cc',
            password='<PASSWORD>',
            username='superuser',
        )
        
        self.url = reverse('users-list')
        self.ban_url = self.url + f'{self.default_user1.pk}/ban/'
    
    def test_invalid_ban_user_by_default_user(self):
        self.client.force_authenticate(user=self.default_user1)

        response = self.client.post(self.ban_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_ban_user_by_doctor(self):
        self.client.force_authenticate(user=self.doctor)
        banned_user = User.objects.create_user(
            email='user2@default.cc',
            password='<PASSWORD>',
            username='user2',
        )

        ban_url = self.url + f'{banned_user.pk}/ban/'
        response = self.client.post(ban_url, data={}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ban_user = User.objects.filter(pk=banned_user.pk).first()
        self.assertFalse(ban_user.is_active)

    def test_ban_user_by_admin(self):
        self.client.force_authenticate(user=self.admin)
        banned_user = User.objects.create_user(
            email='user3@default.cc',
            password='<PASSWORD>',
            username='user3',
        )

        ban_url = self.url + f'{banned_user.pk}/ban/'
        response = self.client.post(ban_url, data={}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ban_user = User.objects.filter(pk=banned_user.pk).first()
        self.assertFalse(ban_user.is_active)

    def test_ban_user_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        banned_user = User.objects.create_user(
            email='user4@default.cc',
            password='<PASSWORD>',
            username='user4',
        )

        ban_url = self.url + f'{banned_user.pk}/ban/'
        response = self.client.post(ban_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ban_user = User.objects.filter(pk=banned_user.pk).first()
        self.assertFalse(ban_user.is_active)

    def test_invalid_ban_user(self):
        banned_user = User.objects.create_user(
            email='user5@default.cc',
            password='<PASSWORD>',
            username='user5',
        )

        ban_url = self.url + f'{banned_user.pk}/ban/'
        response = self.client.post(ban_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        ban_user = User.objects.filter(pk=banned_user.pk).first()
        self.assertTrue(ban_user.is_active)


class UnBanUserTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.default_user1 = User.objects.create_user(
            email='user@default.cc',
            password='<PASSWORD>',
            username='user',
        )

        self.doctor = User.objects.create_user(
            email='doctor@default.cc',
            password='<PASSWORD>',
            username='doctor',
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        self.doctor.groups.add(doctor_group)
        self.doctor.save()

        self.admin = User.objects.create_user(
            email='admin@default.cc',
            password='<PASSWORD>',
            username='admin',
        )
        admin_group, created = Group.objects.get_or_create(name='Administrators')
        self.admin.groups.add(admin_group)
        self.admin.save()

        self.superuser = User.objects.create_superuser(
            email='superuser@default.cc',
            password='<PASSWORD>',
            username='superuser',
        )

        self.url = reverse('users-list')

    def test_invalid_unban_user_by_default_user(self):
        self.client.force_authenticate(user=self.default_user1)
        banned_user = User.objects.create_user(
            email='user0@default.cc',
            password='<PASSWORD>',
            username='user0',
        )

        ban_url = self.url + f'{banned_user.pk}/unban/'
        response = self.client.post(ban_url, data={}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unban_user_by_doctor(self):
        self.client.force_authenticate(user=self.doctor)
        banned_user = User.objects.create_user(
            email='user1@default.cc',
            password='<PASSWORD>',
            username='user1',
        )

        ban_url = self.url + f'{banned_user.pk}/unban/'
        response = self.client.post(ban_url, data={}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ban_user = User.objects.filter(pk=banned_user.pk).first()
        self.assertTrue(ban_user.is_active)

    def test_unban_user_by_admin(self):
        self.client.force_authenticate(user=self.admin)
        banned_user = User.objects.create_user(
            email='user2@default.cc',
            password='<PASSWORD>',
            username='user2',
        )

        ban_url = self.url + f'{banned_user.pk}/unban/'
        response = self.client.post(ban_url, data={}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ban_user = User.objects.filter(pk=banned_user.pk).first()
        self.assertTrue(ban_user.is_active)

    def test_unban_user_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        banned_user = User.objects.create_user(
            email='user3@default.cc',
            password='<PASSWORD>',
            username='user3',
        )

        ban_url = self.url + f'{banned_user.pk}/unban/'
        response = self.client.post(ban_url, data={}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        ban_user = User.objects.filter(pk=banned_user.pk).first()
        self.assertTrue(ban_user.is_active)

    def test_invalid_unban_user(self):
        banned_user = User.objects.create_user(
            email='user4@default.cc',
            password='<PASSWORD>',
            username='user4',
        )
        banned_user.is_active = False
        banned_user.save()

        ban_url = self.url + f'{banned_user.pk}/unban/'
        response = self.client.post(ban_url, data={}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        ban_user = User.objects.filter(pk=banned_user.pk).first()
        self.assertFalse(ban_user.is_active)