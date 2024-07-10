from rest_framework.generics import CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated
from api_v0.permissions import IsMemberOfGroupOrAdmin
from rest_framework.response import Response
from testing.serializers.testing import ExerciseSerializer


class UserPermissions(IsMemberOfGroupOrAdmin):
    group_name = 'Doctors'


class ExerciseCreateAPIView(CreateAPIView):
    serializer_class = ExerciseSerializer
    permission_classes = [IsAuthenticated, UserPermissions]
