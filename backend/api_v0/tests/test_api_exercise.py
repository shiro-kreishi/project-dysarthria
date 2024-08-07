from datetime import datetime
from django.contrib.auth.models import Group
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from testing.models import Exercise, ExerciseType, ExerciseToTest, ResponseExercise
from users.models import User
from testing.models import Test, ResponseTest, ResponseExercise


class ExerciseTypeViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.exercise_type = ExerciseType.objects.create(name='Test Type')
        self.url = reverse('exercise-types-list')

    def user_authenticate(self,
                          type='user',
                          email='testadmin@example.com',
                          password='TestPass123',
                          username='testadmin'):
        user = ''
        if type == 'user':
            user = User.objects.create_user(
                email=email,
                password=password,
                username=username
            )
        elif type == 'superuser':
            user = User.objects.create_superuser(
                email=email,
                password=password,
                username=username
            )
        elif type == 'doctor':
            user = User.objects.create_user(
                email=email,
                password=password,
                username=username
            )
            doctor_group, created = Group.objects.get_or_create(name='Doctors')
            user.groups.add(doctor_group)
            user.save()
        elif type == 'admin':
            user = User.objects.create_user(
                email=email,
                password=password,
                username=username
            )
            doctor_group, created = Group.objects.get_or_create(name='Administrators')
            user.groups.add(doctor_group)
            user.save()
        self.client.force_authenticate(user=user)
        return user

    def test_list_exercise_types(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_exercise_type(self):
        detail_url = reverse('exercise-types-detail', args=[self.exercise_type.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.exercise_type.name)

    def test_create_exercise_type_by_admin(self):
        user = self.user_authenticate(type='admin')
        data = {
            'name': 'Test Type',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.exercise_type.name)

    def test_invalid_create_exercise_type_by_admin(self):
        user = self.user_authenticate(type='user')
        data = {
            'name': 'Test Type',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_exercise_type_by_doctor(self):
        user = self.user_authenticate(
            type='doctor',
            email='testdoctor@example.com',
            password='TestPass123',
            username='testdoctor'
        )
        doctor_group, created = Group.objects.get_or_create(name='Doctors')
        user.groups.add(doctor_group)
        user.save()
        self.client.force_authenticate(user=user)
        data = {
            'name': 'Test Type',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.exercise_type.name)

    def test_invalid_create_exercise_type_by_doctor(self):
        user = self.user_authenticate(
            email='testdoctor@example.com',
            password='TestPass123',
            username='testdoctor'
        )
        self.client.force_authenticate(user=user)
        data = {
            'name': 'Test Type',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_exercise_type_by_admin(self):
        user = self.user_authenticate(type='admin')
        data = {
            'name': 'Test Type',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.exercise_type.name)
        id = response.data['id']
        data = {'name': 'Updated Type'}
        url = self.url + f'{id}/'
        print(url)
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.get(url)
        self.assertEqual(response.data['name'], 'Updated Type')

    def test_delete_exercise_type_by_admin(self):
        user = self.user_authenticate(type='admin')
        data = {
            'name': 'Test Type',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], self.exercise_type.name)
        id = response.data['id']
        url = self.url + f'{id}/'
        print('URL: ' + url)
        response = self.client.delete(url)
        print(response)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Exercise.objects.filter(id=id).exists())


class ExerciseModelViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.exercise_type = ExerciseType.objects.create(name='Test Type')
        self.exercise = Exercise.objects.create(
            name='Test Exercise',
            type=self.exercise_type,
            description='Test Exercise',
            king_json='',
            correct_answers=''
        )
        self.url = reverse('exercises-list')

    def user_authenticate(self, type='user',
                          email='testadmin@example.com',
                          password='TestPass123',
                          username='testadmin'):
        user = ''
        if type == 'user':
            user = User.objects.create_user(
                email=email,
                password=password,
                username=username
            )
        elif type == 'superuser':
            user = User.objects.create_superuser(
                email=email,
                password=password,
                username=username
            )
        elif type == 'doctor':
            user = User.objects.create_user(
                email=email,
                password=password,
                username=username
            )
            doctor_group, created = Group.objects.get_or_create(name='Doctors')
            user.groups.add(doctor_group)
            user.save()
        elif type == 'admin':
            user = User.objects.create_user(
                email=email,
                password=password,
                username=username
            )
            doctor_group, created = Group.objects.get_or_create(name='Administrators')
            user.groups.add(doctor_group)
            user.save()
        self.client.force_authenticate(user=user)
        return user

    def test_list_exercises(self):
        self.user_authenticate(type='superuser')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_exercise(self):
        detail_url = reverse('exercises-detail', args=[self.exercise.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.exercise.name)

    def test_create_exercise(self):
        self.user_authenticate(type='superuser')
        data = {
            'name': 'New Exercise',
            'type': f'{self.exercise_type.id}',
            'description': 'Test Exercise',
            'king_json': '',
            'correct_answers': ''
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Exercise.objects.count(), 2)
        self.assertEqual(response.data['name'], data['name'])

    def test_invalid_create_exercise(self):
        self.user_authenticate()
        data = {
            'name': 'New Exercise',
            'type': f'{self.exercise_type.id}',
            'description': 'Test Exercise',
            'king_json': '',
            'correct_answers': ''
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_exercise(self):
        self.user_authenticate(type='superuser')
        data = {
            'name': 'Updated Exercise',
            'type': f'{self.exercise_type.id}',
            'description': 'Test Exercise',
            'king_json': '',
            'correct_answers': ''
        }
        url = self.url + f'{self.exercise.id}/'
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], data['name'])

    def test_invalid_update_exercise(self):
        self.user_authenticate()
        data = {
            'name': 'Updated Exercise',
            'type': f'{self.exercise_type.id}',
            'description': 'Test Exercise',
            'king_json': '',
            'correct_answers': ''
        }
        url = self.url + f'{self.exercise.id}/'
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_exercise(self):
        self.user_authenticate(type='superuser')
        id = self.exercise.id
        url = self.url + f'{id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_invalid_delete_exercise(self):
        self.user_authenticate()
        id = self.exercise.id
        url = self.url + f'{id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class ExerciseToTestModelViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.exercise_type = ExerciseType.objects.create(name='Test Type')
        self.exercise = Exercise.objects.create(
            name='Test Exercise',
            type=self.exercise_type,
            description='Test Exercise',
            king_json='',
            correct_answers=''
        )
        self.test = Test.objects.create(
            name='Test',
            description='Test Exercises',
        )
        self.exercise_to_test = ExerciseToTest.objects.create(
            exercise=self.exercise,
            test=self.test
        )
        self.url = reverse('exercises-to-test-list')

    def create_and_authenticate_superuser(self):
        user = User.objects.create_superuser(
            email='test@test.test',
            password='TestPass123',
            username='tester'
        )
        self.client.force_authenticate(user=user)

    def create_object(self, exercise_name='Test Exercise', test_name='test'):
        exercise_type = ExerciseType.objects.create(name='Test Type')
        exercise = Exercise.objects.create(
            name=exercise_name,
            type=self.exercise_type,
            description='Test Exercise',
            king_json='',
            correct_answers=''
        )
        test = Test.objects.create(
            name=test_name,
            description='Test Exercises',
        )
        exercise_to_test = ExerciseToTest.objects.create(
            exercise=self.exercise,
            test=self.test
        )
        return exercise_to_test, exercise, test

    def test_list_exercise_to_tests(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_exercise_to_test(self):
        detail_url = reverse('exercises-to-test-detail', args=[self.exercise_to_test.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['exercise'], self.exercise_to_test.exercise.id)
        self.assertEqual(response.data['test'], self.exercise_to_test.test.id)

    def test_create_exercise_to_test(self):
        self.create_and_authenticate_superuser()
        exercise_to_test, exercise, test = self.create_object()
        data = {
            'exercise': exercise.id,
            'test': test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['exercise'], exercise.id)
        self.assertEqual(response.data['test'], test.id)

    def test_invalid_create_exercise_to_test(self):
        exercise_to_test, exercise, test = self.create_object()
        data = {
            'exercise': exercise.id,
            'test': test.id,
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_exercise_to_test(self):
        self.create_and_authenticate_superuser()
        exercise_to_test, exercise, test = self.create_object()
        data = {
            'id': self.exercise_to_test.id,
            'exercise': exercise.id,
            'test': test.id,
        }
        url = self.url + f'{self.exercise_to_test.id}/'
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['exercise'], data['exercise'])
        self.assertEqual(response.data['test'], data['test'])

    def test_delete_exercise_to_test(self):
        self.create_and_authenticate_superuser()
        url = self.url + f'{self.exercise_to_test.id}/'
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ExerciseToTest.objects.filter(id=self.exercise_to_test.id).exists())


class ResponseExerciseModelViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.exercise_type = ExerciseType.objects.create(name='Test Type')
        self.exercise = Exercise.objects.create(
            name='Test Exercise',
            type=self.exercise_type,
            description='Test Exercise',
            king_json='',
            correct_answers=''
        )
        self.test = Test.objects.create(
            name='Test',
            description='Test Exercises',
        )
        self.response_test = ResponseTest.objects.create(
            test = self.test,
            user = None,
            json_result=''
        )
        self.response_exercise = ResponseExercise.objects.create(
            exercise=self.exercise,
            json_result='',
            date=datetime.now(),
            response_test=self.response_test,

        )
        self.url = reverse('response-exercises-list')

    def test_list_response_exercises(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_retrieve_response_exercise(self):
        detail_url = reverse('response-exercises-detail', args=[self.response_exercise.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['exercise'], self.response_exercise.exercise.id)
