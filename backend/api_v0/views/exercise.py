from rest_framework.viewsets import ModelViewSet, GenericViewSet
from api_v0.permissions import IsMemberOfGroupOrAdmin
from api_v0.views.base import ListAndRetrieveForAnyUserModelViewSet, AllowDoctorsOrAdminsBaseModelViewSet, \
    IsSuperUserOrDoctorOrAdminPermission, BaseModelViewSet
from project.settings import DEBUG as debug_settings
from rest_framework import generics, mixins, views, permissions, viewsets
from testing.models.test import Exercise, ExerciseToTest, ResponseExercise, ExerciseType
from api_v0.serializers import ResponseExerciseSerializer, \
    PublicDetailSerializer
from api_v0.serializers import ExerciseSerializer, ExerciseTypeSerializer, ExerciseToTestSerializer, \
    ExerciseTypeSerializer, ExerciseUpdateOrCreateSerializer


class ExerciseTypeViewSet(ListAndRetrieveForAnyUserModelViewSet):
    queryset = ExerciseType.objects.all()
    BaseSerializer = ExerciseTypeSerializer


class ExerciseModelViewSet(ListAndRetrieveForAnyUserModelViewSet):
    queryset = Exercise.objects.all()
    # serializer_class = ExerciseSerializer
    def get_serializer_class(self):
        if debug_settings:
            print(f'action: {self.action}')
        if self.action in ['create', 'update', 'partial_update']:
            return ExerciseUpdateOrCreateSerializer
        return ExerciseSerializer


class ExerciseToTestModelViewSet(ListAndRetrieveForAnyUserModelViewSet):
    queryset = ExerciseToTest.objects.all()
    BaseSerializer = ExerciseToTestSerializer


class ResponseExerciseModelViewSet(BaseModelViewSet):
    queryset = ResponseExercise.objects.all()
    BaseSerializer = ResponseExerciseSerializer
