from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework import status
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import User
from testing.models import Test, PublicTest, ResponseTest, ResponseExercise, Whitelist


class TestViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test = Test.objects.create(
            name='Test',
            description='Test description',
        )
        self.url = reverse('tests-list')

    def create_and_authenticate_superuser(self):
        user = User.objects.create_superuser(
            email='test@test.test',
            password='TestPass123',
            username='tester'
        )
        self.client.force_authenticate(user=user)

    def test_list_tests(self):
        self.create_and_authenticate_superuser()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Test')

    def test_invalid_list_tests(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_retrieve_tests(self):
        self.create_and_authenticate_superuser()
        detail_url = reverse('tests-detail', args=[self.test.id])
        print(detail_url)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test')
        self.assertEqual(response.data['description'], 'Test description')

    def test_create_test(self):
        self.create_and_authenticate_superuser()
        data = {
            'name': 'New Test',
            'description': 'New Test description',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], data['name'])
        self.assertEqual(response.data['description'], data['description'])

    def test_invalid_create_test(self):
        data = {
            'name': 'New Test',
            'description': 'New Test description',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_test(self):
        self.create_and_authenticate_superuser()
        detail_url = reverse('tests-detail', args=[self.test.id])
        data = {
            'name': 'Updated Test',
            'description': 'Updated Test description',
        }
        response = self.client.put(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])
        self.assertEqual(response.data['description'], data['description'])

    def test_invalid_update_test(self):
        detail_url = reverse('tests-detail', args=[self.test.id])
        data = {
            'name': 'Updated Test',
            'description': 'Updated Test description',
        }
        response = self.client.put(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_test(self):
        self.create_and_authenticate_superuser()
        detail_url = reverse('tests-detail', args=[self.test.id])
        response = self.client.delete(detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Test.objects.filter(id=self.test.id).exists())


class PublicTestModelViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test = Test.objects.create(
            name='Test',
            description='Test description',
        )
        self.public_test = PublicTest.objects.create(
            test=self.test,
        )
        self.url = reverse('public-tests-list')
        print(self.url)

    def create_and_authenticate_superuser(self):
        user = User.objects.create_superuser(
            email='test@test.test',
            password='TestPass123',
            username='tester'
        )
        self.client.force_authenticate(user=user)

    def create_and_authenticate_doctor(self):
        user = User.objects.create_user(
            email='test@test.test',
            password='TestPass123',
            username='tester'
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        user.groups.add(doctor_group)
        user.save()
        self.client.force_authenticate(user=user)

    def test_list_public_tests(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['test'], self.test.id)

    def test_retrieve_public_tests(self):
        detail_url = reverse('public-tests-detail', args=[self.public_test.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.public_test.id)

    def test_create_public_test_by_superuser(self):
        self.create_and_authenticate_superuser()
        test = Test.objects.create(
            name='Test',
            description='Test description',
        )
        data = {
            'test': test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['test'], test.id)

    def test_invalid_create_public_test(self):
        test = Test.objects.create(
            name='Test',
            description='Test description',
        )
        data = {
            'test': test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_public_test_by_doctor(self):
        self.create_and_authenticate_doctor()
        test = Test.objects.create(
            name='Test',
            description='Test description',
        )
        data = {
            'test': test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['test'], test.id)

    def test_update_public_test_by_superuser(self):
        self.create_and_authenticate_superuser()
        test = Test.objects.create(
            name='New Test',
            description='New Test description',
        )
        data = {
            'test': test.id,
        }
        detail_url = reverse('public-tests-detail', args=[self.public_test.id])
        response = self.client.put(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['test'], test.id)
        self.assertEqual(
            PublicTest.objects.get(pk=self.public_test.id).test.name,
            'New Test'
        )

    def test_update_public_test_by_doctor(self):
        self.create_and_authenticate_doctor()
        test = Test.objects.create(
            name='New Test',
            description='New Test description',
        )
        data = {
            'test': test.id,
        }
        detail_url = reverse('public-tests-detail', args=[self.public_test.id])
        response = self.client.put(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['test'], test.id)
        self.assertEqual(
            PublicTest.objects.get(pk=self.public_test.id).test.name,
            'New Test'
        )

    def test_invalid_update_public_testr(self):
        test = Test.objects.create(
            name='New Test',
            description='New Test description',
        )
        data = {
            'test': test.id,
        }
        detail_url = reverse('public-tests-detail', args=[self.public_test.id])
        response = self.client.put(detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_public_test_by_superuser(self):
        self.create_and_authenticate_superuser()
        detail_url = reverse('public-tests-detail', args=[self.public_test.id])
        response = self.client.delete(detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(PublicTest.objects.filter(id=self.public_test.id).exists())

    def test_delete_public_test_by_doctor(self):
        self.create_and_authenticate_doctor()
        detail_url = reverse('public-tests-detail', args=[self.public_test.id])
        response = self.client.delete(detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(PublicTest.objects.filter(id=self.public_test.id).exists())

    def test_invalid_delete_public_test(self):
        detail_url = reverse('public-tests-detail', args=[self.public_test.id])
        response = self.client.delete(detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ResponseTestModelViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.test = Test.objects.create(
            name='Test',
            description='Test description',
        )
        self.response_test = ResponseTest.objects.create(
            test=self.test,
            user=None,
            json_result=''
        )
        self.url = reverse('response-tests-list')
        self.detail_url = reverse('response-tests-detail', args=[self.response_test.id])

    def create_and_authenticate_superuser(self):
        user = User.objects.create_superuser(
            email='test@test.test',
            password='TestPass123',
            username='tester'
        )
        self.client.force_authenticate(user=user)
        return user

    def create_and_authenticate_doctor(self):
        user = User.objects.create_user(
            email='test@test.test',
            password='TestPass123',
            username='tester'
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        user.groups.add(doctor_group)
        user.save()
        self.client.force_authenticate(user=user)
        return user

    def create_and_authenticate_user(self):
        user = User.objects.create_user(
            email='user@test.test',
            password='TestPass123',
            username='tester'
        )
        self.client.force_authenticate(user=user)
        return user

    def test_list_response_test(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.response_test.id)

    def test_retrieve_list_response_test(self):
        print(self.detail_url)
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.response_test.id)
        self.assertEqual(response.data['test'], self.test.id)

    def test_create_response_test_by_anonymous_user(self):
        self.client.force_authenticate(user=None)
        data = {
            'test': self.test.id,
            'user': None,
            'json_result': '{ "result": "ok" }"}'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['test'], data['test'])
        self.assertEqual(response.data['user'], data['user'])
        self.assertEqual(response.data['json_result'], data['json_result'])
        response_test = ResponseTest.objects.get(pk=response.data['id'])
        self.assertTrue(response_test)
        self.assertEqual(response_test.test.pk, data['test'])
        self.assertEqual(response_test.user, data['user'])
        self.assertEqual(response_test.json_result, data['json_result'])

    def test_create_response_test_by_authenticated_user(self):
        user = self.create_and_authenticate_user()
        data = {
            'test': self.test.id,
            'user': user.id,
            'json_result': '{ "result": "ok" }'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['test'], data['test'])
        self.assertEqual(response.data['user'], data['user'])
        self.assertEqual(response.data['json_result'], data['json_result'])
        response_test = ResponseTest.objects.get(pk=response.data['id'])
        self.assertTrue(response_test)
        self.assertEqual(response_test.test.pk, data['test'])
        self.assertEqual(response_test.user.pk, data['user'])
        self.assertEqual(response_test.json_result, data['json_result'])

    def test_create_response_test_by_superuser(self):
        user = self.create_and_authenticate_user()
        data = {
            'test': self.test.id,
            'user': user.id,
            'json_result': '{ "result": "ok" }'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response_test = ResponseTest.objects.get(pk=response.data['id'])
        self.assertTrue(response_test)
        self.assertEqual(response_test.test.pk, data['test'])
        self.assertEqual(response_test.user.pk, data['user'])
        self.assertEqual(response_test.json_result, data['json_result'])

    def test_create_response_test_by_doctor(self):
        user = self.create_and_authenticate_doctor()
        data = {
            'test': self.test.id,
            'user': user.id,
            'json_result': '{ "result": "ok" }'
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response_test = ResponseTest.objects.get(pk=response.data['id'])
        self.assertTrue(response_test)
        self.assertEqual(response_test.test.pk, data['test'])
        self.assertEqual(response_test.user.pk, data['user'])
        self.assertEqual(response_test.json_result, data['json_result'])

    def test_invalid1_create_response_test(self):
        self.client.force_authenticate(user=None)
        data = {
            'test': '123',
            'user': None,
            'json_result': ''
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid2_create_response_test(self):
        self.client.force_authenticate(user=None)
        data = {
            'test': '',
            'user': None,
            'json_result': ''
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_response_test_by_anonymous_user(self):
        self.client.force_authenticate(user=None)
        data = {
            'test': self.test.id,
            'user': None,
            'json_result': '{ "result": "ok" }'
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_response_test_by_authenticated_user(self):
        user = self.create_and_authenticate_user()
        data = {
            'test': self.test.id,
            'user': user.pk,
            'json_result': '{ "result": "ok" }'
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_response_test_by_superuser(self):
        user = self.create_and_authenticate_superuser()
        data = {
            'test': self.test.id,
            'user': user.pk,
            'json_result': '{ "result": "ok" }'
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_test = ResponseTest.objects.get(pk=response.data['id'])
        self.assertTrue(response_test)
        self.assertEqual(response_test.json_result, data['json_result'])

    def test_update_response_test_by_doctor(self):
        user = self.create_and_authenticate_doctor()
        data = {
            'test': self.test.id,
            'user': user.pk,
            'json_result': '{ "result": "ok" }'
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response_test = ResponseTest.objects.get(pk=response.data['id'])
        self.assertTrue(response_test)
        self.assertEqual(response_test.json_result, data['json_result'])

    def test_delete_response_test_by_anonymous_user(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_response_test_by_authenticated_user(self):
        user = self.create_and_authenticate_user()
        response = self.client.delete(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_response_test_by_superuser(self):
        self.create_and_authenticate_superuser()
        response = self.client.delete(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ResponseTest.objects.filter(pk=self.response_test.id).exists())

    def test_delete_response_test_by_doctor(self):
        self.create_and_authenticate_doctor()
        response = self.client.delete(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ResponseTest.objects.filter(pk=self.response_test.id).exists())


class WhitelistModelViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = self.create_and_authenticate_user()
        self.test = Test.objects.create(
            name='Test',
            description='Test description',
        )
        self.whitelist = Whitelist.objects.create(
            user=self.user,
            test=self.test
        )
        self.url = reverse('whitelists-list')
        self.detail_url = reverse('whitelists-detail', kwargs={'pk': self.whitelist.pk})

    def create_and_authenticate_superuser(self,
                                          email='superuser@test.test',
                                          password='TestPass123',
                                          username='superuser'
                                          ):
        user = User.objects.create_superuser(
            email=email,
            password=password,
            username=username
        )
        self.client.force_authenticate(user=user)
        return user

    def create_and_authenticate_doctor(self,
                                       email='doctor@test.test',
                                       password='TestPass123',
                                       username='doctorTest'
                                       ):
        user = User.objects.create_user(
            email=email,
            password=password,
            username=username
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        user.groups.add(doctor_group)
        user.save()
        self.client.force_authenticate(user=user)
        return user

    def create_and_authenticate_user(self,
                                     email='authenticate_user@test.test',
                                     password='TestPass123',
                                     username='authenticate_user'
                                     ):
        user = User.objects.create_user(
            email=email,
            password=password,
            username=username
        )
        self.client.force_authenticate(user=user)
        return user

    def test_list_whitelist(self):
        response = self.client.get(self.url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['test'], self.test.id)

    def test_retrieve_whitelist(self):
        response = self.client.get(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['test'], self.test.id)
        self.assertEqual(response.data['user'], self.user.id)

    def test_invalid_create_whitelist_by_anonymous_user(self):
        self.client.force_authenticate(user=None)
        data = {
            'user': self.user.id,
            'test': self.test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_create_whitelist_by_authenticated_user(self):
        self.client.force_authenticate(user=self.user)
        data = {
            'user': self.user.id,
            'test': self.test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_whitelist_by_superuser(self):
        user = self.create_and_authenticate_superuser()
        data = {
            'user': user.id,
            'test': self.test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        whitelist = Whitelist.objects.get(pk=response.data['id'])
        self.assertTrue(whitelist)
        self.assertEqual(whitelist.test.id, self.test.id)

    def test_create_whitelist_by_doctor(self):
        user = self.create_and_authenticate_doctor()
        data = {
            'user': user.id,
            'test': self.test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        whitelist = Whitelist.objects.get(pk=response.data['id'])
        self.assertTrue(whitelist)
        self.assertEqual(whitelist.test.id, self.test.id)

    def test_invalid_update_whitelist_by_anonymous_user(self):
        self.client.force_authenticate(user=None)
        new_test = Test.objects.create(
            name='New Test',
            description='New Test description',
        )
        data = {
            'user': self.user.id,
            'test': new_test.id,
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_update_whitelist_by_authenticated_user(self):
        user = self.create_and_authenticate_user(
            email='authenticate_user123@test.test',
            password='<PASSWORD>',
            username='authenticate_user123'
        )
        new_test = Test.objects.create(
            name='New Test',
            description='New Test description',
        )
        data = {
            'user': self.user.id,
            'test': new_test.id,
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_whitelist_by_doctor(self):
        user = self.create_and_authenticate_doctor(
            email='doctor@test.com',
            password='<PASSWORD>',
            username='doctor'
        )
        new_test = Test.objects.create(
            name='New Test',
            description='New Test description',
        )
        data = {
            'user': user.id,
            'test': new_test.id,
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        whitelist = Whitelist.objects.get(pk=response.data['id'])
        self.assertTrue(whitelist)
        self.assertEqual(whitelist.test.id, new_test.id)
        self.assertEqual(whitelist.test.name, 'New Test')

    def test_update_whitelist_by_superuser(self):
        user = self.create_and_authenticate_superuser(
            email='user@super.com',
            password='<PASSWORD>',
            username='super-user'
        )
        new_test = Test.objects.create(
            name='New Test',
            description='New Test description',
        )
        data = {
            'user': user.id,
            'test': new_test.id,
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        whitelist = Whitelist.objects.get(pk=response.data['id'])
        self.assertTrue(whitelist)
        self.assertEqual(whitelist.test.id, new_test.id)
        self.assertEqual(whitelist.test.name, 'New Test')

    def test_invalid_delete_whitelist_by_anonymous_user(self):
        self.client.force_authenticate(user=None)
        response = self.client.delete(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_delete_whitelist_by_authenticated_user(self):
        user = self.create_and_authenticate_user(
            email='authenticate123@test.test',
            password='<PASSWORD>',
            username='authenticate123'
        )
        response = self.client.delete(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_whitelist_by_doctor(self):
        user = self.create_and_authenticate_doctor(
            email='doctor@doctor.com',
            password='<PASSWORD>',
            username='doctors'
        )
        response = self.client.delete(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        whitelist = Whitelist.objects.filter(pk=self.whitelist.pk).exists()
        self.assertFalse(whitelist)

    def test_delete_whitelist_by_superuser(self):
        user = self.create_and_authenticate_superuser(
            email='superuser@superuser.com',
            password='<PASSWORD>',
            username='superusersp'
        )
        response = self.client.delete(self.detail_url, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        whitelist = Whitelist.objects.filter(pk=self.whitelist.pk).exists()
        self.assertFalse(whitelist)
