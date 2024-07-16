from rest_framework import serializers
from testing.models.test import \
    Test, Exercise, ExerciseToTest, ExerciseType, \
    DoctorToTest, Whitelist, PublicTest, \
    ResponseTest, ResponseExercise
from testing.serializers.validators import validate_doctor_or_admin
from users.models import User


class ExerciseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseType
        fields = '__all__'

class ExerciseSerializer(serializers.ModelSerializer):
    # exercise_type = ExerciseTypeSerializer()
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'king_json', 'type']


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


class ExerciseToTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseToTest
        fields = ['id', 'exercise', 'test']


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


class ResponseExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseExercise
        fields = ['id', 'exercise', 'json_result', 'date', 'response_test']