from django.db.models import Model

from api_v0.permissions import IsMemberOfGroupOrAdmin
from rest_framework import serializers
from project.settings import DEBUG as debug_settings
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views, permissions, viewsets


class IsSuperUserOrDoctor(IsMemberOfGroupOrAdmin):
    group_name = 'Doctors'


class IsSuperUserOrAdmin(IsMemberOfGroupOrAdmin):
    group_name = 'Administrators'


class BaseModelViewSet(mixins.CreateModelMixin,
                       mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.ListModelMixin,
                       GenericViewSet):
    queryset = []
    BaseSerializer = serializers.BaseSerializer

    def get_serializer_class(self):
        return self.BaseSerializer

    def get_permissions(self):
        permission_classes = [permissions.AllowAny]
        return [permission() for permission in permission_classes]



class AllowDoctorsOrAdminsBaseModelViewSet(BaseModelViewSet):
    queryset = []
    BaseSerializer = serializers.BaseSerializer
    BaseDetailSerializer = serializers.BaseSerializer

    def get_serializer_class(self):
        if debug_settings:
            print(f'action: {self.action}')
            print(f'get: {self.request.query_params}')
        # if self.action in ['create', 'update', 'partial_update']:
        #     return TestCreateUpdateSerializer

        if self.action in ['retrieve', ]:
            return self.BaseDetailSerializer
        return self.BaseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsSuperUserOrDoctor, IsSuperUserOrAdmin]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]