from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import User
from testing.models import Test, DoctorToTest


class TestDoctorToTestModelViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='tester_for_doctor@test.test',
            password='<PASSWORD>',
            username='tester',
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        self.user.groups.add(doctor_group)
        self.user.save()
        self.test = Test.objects.create(
            name='test',
            description='test',
        )
        self.doctor_to_test = DoctorToTest.objects.create(
            doctor=self.user,
            test=self.test,
        )
        self.url = reverse('doctors-test-list')
        self.detail_url = reverse('doctors-test-detail', kwargs={'pk': self.doctor_to_test.id})

        self.superuser = User.objects.create_superuser(
            email='superuser@test.test',
            password='<PASSWORD>',
            username='superuser',
        )
    def test_invalid_list_doctors_to_test(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_doctors_to_test_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['doctor'], self.user.pk)
        self.assertEqual(response.data[0]['test'], self.test.pk)

    def test_list_doctors_to_test_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['doctor'], self.user.pk)
        self.assertEqual(response.data[0]['test'], self.test.pk)

    def test_invalid_detail_list_doctors_to_test(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_list_doctors_to_test_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['doctor'], self.user.pk)
        self.assertEqual(response.data['test'], self.test.pk)

    def test_detail_list_doctors_to_test_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['doctor'], self.user.pk)
        self.assertEqual(response.data['test'], self.test.pk)

    def test_invalid_create_doctors_to_test(self):
        user = User.objects.create_user(
            email='tester_for_doc@test.test',
            password='<PASSWORD>',
            username='tester_doc',
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        user.groups.add(doctor_group)
        user.save()
        data = {
            'doctor': user.pk,
            'test': self.test.pk,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_doctors_to_test_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        user = User.objects.create_user(
            email='tester_for_doc@test.test',
            password='<PASSWORD>',
            username='tester_doc',
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        user.groups.add(doctor_group)
        user.save()
        data = {
            'doctor': user.pk,
            'test': self.test.pk,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['doctor'], user.pk)
        self.assertEqual(response.data['test'], self.test.pk)

    def test_create_doctors_to_test_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        user = User.objects.create_user(
            email='tester_for_doc@test.test',
            password='<PASSWORD>',
            username='tester_doc',
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        user.groups.add(doctor_group)
        user.save()
        data = {
            'doctor': user.pk,
            'test': self.test.pk,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['doctor'], user.pk)
        self.assertEqual(response.data['test'], self.test.pk)

    def test_invalid_update_doctors_to_test(self):
        test = Test.objects.create(
            name='New test',
            description='New test',
        )
        data = {
            'doctor': self.user.pk,
            'test': test.pk,
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_doctors_to_test_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        test = Test.objects.create(
            name='New test',
            description='New test',
        )
        data = {
            'doctor': self.user.pk,
            'test': test.pk,
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['test'], test.pk)

    def test_update_doctors_to_test_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        test = Test.objects.create(
            name='New test',
            description='New test',
        )
        data = {
            'doctor': self.user.pk,
            'test': test.pk,
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['test'], test.pk)

    def test_invalid_delete_doctor_to_test(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_doctor_to_test_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        doctor_to_test = DoctorToTest.objects.filter(pk=self.doctor_to_test.pk).exists()
        self.assertFalse(doctor_to_test)

    def test_delete_doctor_to_test_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        doctor_to_test = DoctorToTest.objects.filter(pk=self.doctor_to_test.pk).exists()
        self.assertFalse(doctor_to_test)


class TestUserModelViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='tester_for_doctor@test.test',
            password='<PASSWORD>',
            username='tester',
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        self.user.groups.add(doctor_group)
        self.user.save()
        self.superuser = User.objects.create_superuser(
            email='tester_superuser@test.test',
            password='<PASSWORD>',
            username='tester_superuser',
        )
        self.url = reverse('users-list')
        self.detail_url = reverse('users-detail', kwargs={'pk': self.user.pk})

    def test_invalid_list_users(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_users_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_users_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_invalid_detail_users(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_detail_users_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.user.pk)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)

    def test_detail_users_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.user.pk)
        self.assertEqual(response.data['username'], self.user.username)
        self.assertEqual(response.data['email'], self.user.email)

    def test_invalid_create_user_by_anonymous_user(self):
        new_user = User.objects.create_user(
            email='new_tester@test.test',
            password='<PASSWORD>',
            username='new_tester',
        )
        data = {
            'username': new_user.username,
            'email': new_user.email,
            'last_name': new_user.last_name,
            'first_name': new_user.first_name,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_create_user_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        new_user = User.objects.create_user(
            email='new_tester@test.test',
            password='<PASSWORD>',
            username='new_tester',
        )
        data = {
            'username': new_user.username,
            'email': new_user.email,
            'last_name': new_user.last_name,
            'first_name': new_user.first_name,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_invalid_create_user_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        new_user = User.objects.create_user(
            email='new_tester@test.test',
            password='<PASSWORD>',
            username='new_tester',
        )
        data = {
            'username': new_user.username,
            'email': new_user.email,
            'last_name': new_user.last_name,
            'first_name': new_user.first_name,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_invalid_update_user_by_anonymous_user(self):
        data = {
            'username': self.user.username,
            'email': self.user.email,
            'last_name': 'self.user.last_name',
            'first_name': 'self.user.first_name',
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        user = User.objects.get(pk=self.user.pk)
        self.assertNotEqual(user.first_name, data['first_name'])
        self.assertNotEqual(user.last_name, data['last_name'])

    def test_invalid_update_user_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        data = {
            'username': self.user.username,
            'email': self.user.email,
            'last_name': 'self.user.last_name',
            'first_name': 'self.user.first_name',
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        user = User.objects.get(pk=self.user.pk)
        self.assertNotEqual(user.first_name, data['first_name'])
        self.assertNotEqual(user.last_name, data['last_name'])

    def test_invalid_update_user_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'username': self.user.username,
            'email': self.user.email,
            'last_name': 'self.user.last_name',
            'first_name': 'self.user.first_name',
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        user = User.objects.get(pk=self.user.pk)
        self.assertNotEqual(user.first_name, data['first_name'])
        self.assertNotEqual(user.last_name, data['last_name'])

    def test_invalid_delete_user_by_anonymous_user(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        user = User.objects.filter(pk=self.user.pk).exists()
        self.assertTrue(user)

    def test_invalid_delete_user_by_superuser(self):
        self.client.force_authenticate(user=self.superuser)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        user = User.objects.filter(pk=self.user.pk).exists()
        self.assertTrue(user)

    def test_invalid_delete_user_by_doctor(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)
        user = User.objects.filter(pk=self.user.pk).exists()
        self.assertTrue(user)
