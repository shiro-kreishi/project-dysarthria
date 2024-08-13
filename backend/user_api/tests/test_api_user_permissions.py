from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import User


class TestCheckUserPermissionsViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.default_user = User.objects.create_user(
            email='default@user.com',
            password='<PASSWORD>',
            username='default',
        )
        self.doctor = User.objects.create_user(
            email='doctor@user.com',
            password='<PASSWORD>',
            username='doctor',
        )
        self.doctor_group, created = Group.objects.get_or_create(name='Doctors')
        self.doctor.groups.add(self.doctor_group)
        self.doctor.save()
        self.admin = User.objects.create_user(
            email='admin@user.com',
            password='<PASSWORD>',
            username='admin',
        )
        self.admin_group, created = Group.objects.get_or_create(name='Administrators')
        self.admin.groups.add(self.admin_group)
        self.admin.save()
        self.superuser = User.objects.create_superuser(
            email='superuser@user.com',
            password='<PASSWORD>',
            username='superuser',
        )
        self.superuser.groups.add(self.admin_group)
        self.superuser.groups.add(self.doctor_group)
        self.superuser.save()
        self.url = reverse('check-user-permissions-list')

    def test_check_default_user_permissions(self):
        self.client.force_authenticate(user=self.default_user)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['access'], 'deny')

    def test_check_doctor_permissions(self):
        self.client.force_authenticate(user=self.doctor)
        data = {
            'access': 'allow',
            'groups': [{
                'name': 'Doctors',
            }]
        }
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['access'], 'allow')
        self.assertEqual(response.data['groups'][0]['name'], data['groups'][0]['name'])

    def test_check_admin_permissions(self):
        self.client.force_authenticate(user=self.admin)
        data = {
            'access': 'allow',
            'groups': [{
                'name': 'Administrators',
            }]
        }
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['access'], 'allow')
        self.assertEqual(response.data['groups'][0]['name'], data['groups'][0]['name'])

    def test_check_superuser_permissions(self):
        self.client.force_authenticate(user=self.superuser)
        data = {
            'access': 'allow',
            'groups': [
                {
                    'name': 'Doctors',
                },
                {
                    'name': 'Administrators',
                }
            ]
        }
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['access'], 'allow')
        self.assertEqual(response.data['groups'][0]['name'], data['groups'][0]['name'])
        self.assertEqual(response.data['groups'][1]['name'], data['groups'][1]['name'])
