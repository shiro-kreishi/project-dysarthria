from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views

from api_v0.permissions import IsMemberOfGroupOrAdmin
from testing.models import DoctorToTest
from testing.serializers.testing import DoctorToTestDetailSerializer

from user_api.serializers.user import UserSerializer
from users.models import User


class IsAdminOrDoctor(IsMemberOfGroupOrAdmin):
    group_name = 'Doctors'

class DoctorToTestModelViewSet(mixins.CreateModelMixin,
                               mixins.RetrieveModelMixin,
                               mixins.UpdateModelMixin,
                               mixins.DestroyModelMixin,
                               mixins.ListModelMixin,
                               GenericViewSet):
    queryset = DoctorToTest.objects.all()
    serializer_class = DoctorToTestDetailSerializer
    permission_classes = [IsAdminOrDoctor]


# TODO: Проверить доступы
class UserModelViewSet(mixins.CreateModelMixin,
                       mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.ListModelMixin,
                       GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrDoctor]



