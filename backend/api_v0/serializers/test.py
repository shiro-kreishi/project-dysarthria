from rest_framework import serializers

from api_v0.serializers import ExerciseSerializer
from testing.models.test import \
    Test, DoctorToTest, Whitelist, PublicTest, \
    ResponseTest, Exercise, ResponseExercise, ExerciseToTest
from user_api.serializers import UserSerializer
from users.models import User


class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['id', 'name', 'description']


class TestDetailSerializer(serializers.ModelSerializer):
    exercises = serializers.SerializerMethodField()

    class Meta:
        model = Test
        fields = ['id', 'name', 'description', 'exercises']

    def get_exercises(self, obj):
        exercises = Exercise.objects.filter(exercisetotest__test=obj)
        return ExerciseSerializer(exercises, many=True).data


class TestCreateUpdateSerializer(serializers.ModelSerializer):
    exercises = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all(), many=True)

    class Meta:
        model = Test
        fields = ['id', 'name', 'description', 'exercises']

    def create(self, validated_data):
        exercises = validated_data.pop('exercises')
        test = Test.objects.create(**validated_data)
        for exercise in exercises:
            ExerciseToTest.objects.create(test=test, exercise=exercise)
        return test

    def update(self, instance, validated_data):
        exercises = validated_data.pop('exercises')
        instance.name = validated_data.get('name', instance.name)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        # Удаление старых связей
        ExerciseToTest.objects.filter(test=instance).delete()
        # Добавление новых связей
        for exercise in exercises:
            ExerciseToTest.objects.create(test=instance, exercise=exercise)
        return instance


class WhitelistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Whitelist
        fields = ['id', 'user', 'test']


class PublicTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicTest
        fields = ['id', 'test']


class PublicDetailSerializer(serializers.ModelSerializer):
    test = TestDetailSerializer()

    class Meta:
        model = PublicTest
        fields = ['id', 'test']


class ResponseTestSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)

    class Meta:
        model = ResponseTest
        fields = ['id', 'test', 'user', 'json_result']

    def validate(self, data):
        # Получаем пользователя из контекста
        user = self.context['request'].user

        # Проверяем, авторизован ли пользователь
        if user and user.is_authenticated:
            data['user'] = user
        else:
            data['user'] = None

        return data


class ResponseDetailTestSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = ResponseTest
        fields = ['id', 'test', 'user', 'json_result']
