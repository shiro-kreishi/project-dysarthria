from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views, status, permissions, viewsets

from testing.models import DoctorToTest
from testing.serializers.testing import DoctorToTestDetailSerializer
from user_api.permissions.is_member_group_or_admin import CheckUserInGroupsOrAdmin, IsSuperUserOrDoctorOrAdminPermission

from user_api.serializers.user import UserWithIdSerializer, GroupSerializer
from users.models import User

from rest_framework.decorators import action

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
    http_method_names = ['get','post']

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Creation of users is not allowed"},
                        status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @action(detail=True, methods=['post'], name='ban')
    def ban(self, request, pk=None):
        user = request.user
        is_group_member_or_superuser = CheckUserInGroupsOrAdmin(request).check()
        if not user and is_group_member_or_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'},
                            status=status.HTTP_403_FORBIDDEN)
        banned_user = User.objects.filter(pk=pk).first()
        banned_user.is_active = False
        banned_user.save()
        return Response({'detail': f'User: {banned_user.email} has been banned.'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], name='unban')
    def unban(self, request, pk=None):
        user = request.user
        is_group_member_or_superuser = CheckUserInGroupsOrAdmin(request).check()
        if not user and is_group_member_or_superuser:
            return Response({'detail': 'You do not have permission to perform this action.'},
                            status=status.HTTP_403_FORBIDDEN)
        banned_user = User.objects.filter(pk=pk).first()
        banned_user.is_active = True
        banned_user.save()
        return Response({'detail': f'User: {banned_user.email} has been unbanned.'}, status=status.HTTP_200_OK)

    # def list(self, request, *args, **kwargs):
    #     return Response(status=status.HTTP_204_NO_CONTENT)



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