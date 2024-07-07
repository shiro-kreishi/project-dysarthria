from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views

from testing.models.test import Exercise, ExerciseToTest, ResponseExercise
from testing.serializers.testing import ExerciseSerializer, ExerciseToTestSerializer, ResponseExerciseSerializer


class ExerciseModelViewSet(mixins.CreateModelMixin,
                           mixins.RetrieveModelMixin,
                           mixins.UpdateModelMixin,
                           mixins.DestroyModelMixin,
                           mixins.ListModelMixin,
                           GenericViewSet):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer


class ExerciseToTestModelViewSet(mixins.CreateModelMixin,
                                 mixins.RetrieveModelMixin,
                                 mixins.UpdateModelMixin,
                                 mixins.DestroyModelMixin,
                                 mixins.ListModelMixin,
                                 GenericViewSet):
    queryset = ExerciseToTest.objects.all()
    serializer_class = ExerciseToTestSerializer


class ResponseExerciseModelViewSet(mixins.CreateModelMixin,
                                   mixins.RetrieveModelMixin,
                                   mixins.UpdateModelMixin,
                                   mixins.DestroyModelMixin,
                                   mixins.ListModelMixin,
                                   GenericViewSet):
    queryset = ResponseExercise.objects.all()
    serializer_class = ResponseExerciseSerializer


