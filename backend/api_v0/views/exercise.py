from rest_framework.viewsets import ModelViewSet, GenericViewSet

from api_v0.permissions import IsMemberOfGroupOrAdmin
from project.settings import DEBUG as debug_settings
from rest_framework import generics, mixins, views, permissions, viewsets

from testing.models.test import Exercise, ExerciseToTest, ResponseExercise, ExerciseType
from api_v0.serializers import ResponseExerciseSerializer, \
    PublicDetailSerializer
from api_v0.serializers import ExerciseSerializer, ExerciseTypeSerializer, ExerciseToTestSerializer, \
    ExerciseTypeSerializer, ExerciseUpdateOrCreateSerializer


class IsSuperUserOrDoctor(IsMemberOfGroupOrAdmin):
    group_name = 'Doctors'


class IsSuperUserOrAdmin(IsMemberOfGroupOrAdmin):
    group_name = 'Administrators'


class ExerciseTypeViewSet(viewsets.ModelViewSet):
    queryset = ExerciseType.objects.all()
    serializer_class = ExerciseTypeSerializer


class ExerciseModelViewSet(mixins.CreateModelMixin,
                           mixins.RetrieveModelMixin,
                           mixins.UpdateModelMixin,
                           mixins.DestroyModelMixin,
                           mixins.ListModelMixin,
                           GenericViewSet):
    queryset = Exercise.objects.all()
    # serializer_class = ExerciseSerializer
    def get_serializer_class(self):
        if debug_settings:
            print(f'action: {self.action}')
        if self.action in ['create', 'update', 'partial_update']:
            return ExerciseUpdateOrCreateSerializer
        return ExerciseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperUserOrAdmin, IsSuperUserOrDoctor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


class ExerciseToTestModelViewSet(mixins.CreateModelMixin,
                                 mixins.RetrieveModelMixin,
                                 mixins.UpdateModelMixin,
                                 mixins.DestroyModelMixin,
                                 mixins.ListModelMixin,
                                 GenericViewSet):
    queryset = ExerciseToTest.objects.all()
    serializer_class = ExerciseToTestSerializer
    permission_classes = [
        IsSuperUserOrAdmin, IsSuperUserOrDoctor
    ]


class ResponseExerciseModelViewSet(mixins.CreateModelMixin,
                                   mixins.RetrieveModelMixin,
                                   mixins.UpdateModelMixin,
                                   mixins.DestroyModelMixin,
                                   mixins.ListModelMixin,
                                   GenericViewSet):
    queryset = ResponseExercise.objects.all()
    serializer_class = ResponseExerciseSerializer
    permission_classes = [
        permissions.AllowAny
    ]


