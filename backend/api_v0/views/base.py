import logging

from django.core.serializers import SerializerDoesNotExist
from django.db.migrations.serializer import BaseSerializer
from django.db.models import Model

from api_v0.permissions import IsMemberOfGroupsOrAdmin
from rest_framework import serializers
from project.settings import DEBUG as debug_settings
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views, permissions, viewsets


class IsSuperUserOrDoctorOrAdminPermission(IsMemberOfGroupsOrAdmin):
    group_names = ['Doctors', 'Administrators']


class BaseModelViewSet(mixins.CreateModelMixin,
                       mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.ListModelMixin,
                       GenericViewSet):
    queryset = []
    BaseSerializer = serializers.BaseSerializer

    def log_request(self, request, *args, **kwargs):
        print(f"Request received: {request.method} {request.path}")
        print(f"Request headers: {request.headers}")

    def create(self, request, *args, **kwargs):
        # self.log_request(request)
        return super().create(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        # self.log_request(request)
        return super().list(request, *args, **kwargs)

    def dispatch(self, request, *args, **kwargs):
        # self.log_request(request)
        response = super().dispatch(request, *args, **kwargs)
        if response.status_code == 403:
            print(f"Forbidden request: {request.method} {request.path}")
        return response

    def get_serializer_class(self):
        return self.BaseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsSuperUserOrDoctorOrAdminPermission]
        return [permission() for permission in permission_classes]


class DetailedParamRetrieveModelViewSet(BaseModelViewSet):
    BaseDetailSerializer = None

    def get_query_param_by_key(self, key: str):
        return self.request.query_params.get(key)

    def get_serializer_class(self):
        # if debug_settings:
        #     print(f'action: {self.action}')
        #     print(f'get: {self.request.query_params}')

        if self.action in ['retrieve'] and self.get_query_param_by_key('detailed') == 'true':
            try:
                serializer = self.BaseDetailSerializer
            except TypeError as e:
                logging.exception('Exception while retrieving detailed params: ', e)
                serializer = BaseSerializer
            return serializer
        return self.BaseSerializer


class ListAndRetrieveForAnyUserModelViewSet(DetailedParamRetrieveModelViewSet):
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsSuperUserOrDoctorOrAdminPermission]
        return [permission() for permission in permission_classes]