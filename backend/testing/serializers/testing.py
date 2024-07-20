from rest_framework import serializers

from api_v0.serializers import ExerciseSerializer
from testing.models.test import \
    Test, DoctorToTest, Whitelist, PublicTest, \
    ResponseTest, Exercise, ResponseExercise, ExerciseToTest
from testing.serializers.validators import validate_doctor_or_admin
from users.models import User


class DoctorToTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorToTest
        fields = ['id', 'doctor', 'test']


class DoctorToTestDetailSerializer(serializers.ModelSerializer):
    doctor = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(),
                                                required=False, allow_null=True,
                                                validators=[validate_doctor_or_admin])
    class Meta:
        model = DoctorToTest
        fields = ['id', 'doctor', 'test']
