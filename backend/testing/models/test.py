from __future__ import unicode_literals
from django.db import models

from users.models import User


class Test(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class ExerciseType(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Exercise(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    type = models.ForeignKey(ExerciseType, on_delete=models.CASCADE)
    king_json = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.name


class ExerciseToTest(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    test = models.ForeignKey(Test, on_delete=models.CASCADE)


class DoctorToTest(models.Model):
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'groups__name': 'Doctors'})
    test = models.ForeignKey(Test, on_delete=models.CASCADE)


class Whitelist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'groups__name': 'Users'})
    test = models.ForeignKey(Test, on_delete=models.CASCADE)


class PublicTest(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)


class ResponseTest(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    json_result = models.JSONField()


class ResponseExercise(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    json_result = models.JSONField()
    date = models.DateTimeField()
    response_test = models.ForeignKey(ResponseTest, on_delete=models.CASCADE)