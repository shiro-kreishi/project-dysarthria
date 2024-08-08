from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views, status, permissions, viewsets

from api_v0.permissions import IsMemberOfGroupOrAdmin
from testing.models import DoctorToTest
from testing.serializers.testing import DoctorToTestDetailSerializer

from user_api.serializers.user import UserSerializer, UserWithIdSerializer, GroupSerializer
from users.models import User
from api_v0.views.base import IsSuperUserOrDoctorOrAdminPermission


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
    permission_classes = [IsSuperUserOrDoctorOrAdminPermission]


# TODO: Проверить доступы
class UserModelViewSet(mixins.CreateModelMixin,
                       mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.ListModelMixin,
                       GenericViewSet):
    queryset = User.objects.all()
    serializer_class = UserWithIdSerializer
    permission_classes = [IsSuperUserOrDoctorOrAdminPermission]
    http_method_names = ['get',]


class CheckUserPermissions(viewsets.ViewSet):
    permission_classes = (permissions.AllowAny,)
    http_method_names = ['get',]

    def list(self, request, *args, **kwargs):
        current_user = self.request.user
        if not current_user.is_authenticated:
            data = {
                'access': 'deny',
                'detail': 'You do not have permission to perform this action.',
            }
            return Response(data, status=status.HTTP_403_FORBIDDEN)

        group_names = ['Doctors', 'Administrators']
        is_group_member = any(request.user.groups.filter(name=group_name).exists() for group_name in group_names)
        is_admin = request.user.is_superuser and request.user.is_staff

        if is_group_member or is_admin:
            groups = current_user.groups.all()
            serialized_groups = GroupSerializer(groups, many=True).data
            data = {
                'access': 'allow',
                'groups': serialized_groups,
            }
            return Response(data, status=status.HTTP_200_OK)

        data = {
            'access': 'deny',
            'details': 'You must be a member of the groups or be a superuser.'
        }
        return Response(data, status=status.HTTP_403_FORBIDDEN)