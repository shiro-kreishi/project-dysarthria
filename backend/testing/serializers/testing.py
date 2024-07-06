from rest_framework import serializers
from testing.models.test import \
    Test, Exercise, ExerciseToTest, \
    DoctorToTest, Whitelist, PublicTest, \
    ResponseTest, ResponseExercise, PictureOrWordDragging, \
    ObjectsWeDrag, ObjectsToDragTo, Content, StandardForm

class TestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Test
        fields = ['id', 'name', 'description']


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'type_name']


class ExerciseToTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseToTest
        fields = ['id', 'exercise', 'test']


class DoctorToTestSerializer(serializers.ModelSerializer):
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


class ResponseTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseTest
        fields = ['id', 'test', 'user', 'json_result']


class ResponseExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseExercise
        fields = ['id', 'exercise', 'json_result', 'date', 'response_test']


class PictureOrWordDraggingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PictureOrWordDragging
        fields = ['id', 'exercise', 'text']


class ObjectsWeDragSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectsWeDrag
        fields = ['id', 'content', 'picture_or_word_dragging']


class ObjectsToDragToSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjectsToDragTo
        fields = ['id', 'content', 'to_drag_to', 'picture_or_word_dragging']


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = ['id', 'text']


class StandardFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = StandardForm
        fields = ['id', 'exercise', 'text']