from api_v0.permissions import IsMemberOfGroupsOrAdmin
from project.settings import DEBUG as debug_settings
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views, permissions
from testing.models.test import Test, PublicTest, ResponseTest, Whitelist
from api_v0.serializers.test import TestSerializer, PublicTestSerializer, ResponseTestSerializer, \
    WhitelistSerializer, TestDetailSerializer, TestCreateUpdateSerializer, PublicDetailSerializer
from api_v0.views.base import BaseModelViewSet, \
    ListAndRetrieveForAnyUserModelViewSet, DetailedParamRetrieveModelViewSet, \
    IsSuperUserOrDoctorOrAdminPermission
from rest_framework.response import Response
from rest_framework import status


class IsSuperUserOrDoctorOrAdmin(IsMemberOfGroupsOrAdmin):
    group_names = ['Doctors', 'Administrators']


class TestModelViewSet(BaseModelViewSet):
    queryset = Test.objects.all()
    BaseSerializer = TestSerializer
    BaseDetailSerializer = TestDetailSerializer

    def get_serializer_class(self):
        if debug_settings:
            print(f'action: {self.action}')
            print(f'get: {self.request.query_params}')
        # if self.action in ['create', 'update', 'partial_update']:
        #     return TestCreateUpdateSerializer

        if self.action in ['retrieve', ]:
            return self.BaseDetailSerializer
        return self.BaseSerializer


class PublicTestModelViewSet(DetailedParamRetrieveModelViewSet):
    queryset = PublicTest.objects.all()
    BaseSerializer = PublicTestSerializer
    BaseDetailSerializer = PublicDetailSerializer


class ResponseTestModelViewSet(BaseModelViewSet):
    queryset = ResponseTest.objects.all()
    BaseSerializer = ResponseTestSerializer

    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsSuperUserOrDoctorOrAdminPermission]
        return [permission() for permission in permission_classes]


class WhitelistModelViewSet(ListAndRetrieveForAnyUserModelViewSet):
    queryset = Whitelist.objects.all()
    BaseSerializer = WhitelistSerializer
    BaseDetailSerializer = WhitelistSerializer
