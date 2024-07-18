from testing.models import (Exercise, ExerciseToTest,
                            ExerciseType, ResponseExercise)
from rest_framework import serializers


class ExerciseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseType
        fields = '__all__'


class ExerciseUpdateOrCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'type',
                  'description', 'king_json',
                  'correct_answers']


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'type',
                  'description', 'king_json']


class ExerciseToTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseToTest
        fields = ['id', 'exercise', 'test']


class ResponseExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseExercise
        fields = ['id', 'exercise', 'json_result', 'date', 'response_test']