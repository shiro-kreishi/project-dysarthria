from api_v0.permissions import IsMemberOfGroupsOrAdmin
from project.settings import DEBUG as debug_settings
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views, permissions
from testing.models.test import Test, PublicTest, ResponseTest, Whitelist
from api_v0.serializers.test import TestSerializer, PublicTestSerializer, ResponseTestSerializer, \
    WhitelistSerializer, TestDetailSerializer, TestCreateUpdateSerializer, PublicDetailSerializer
from api_v0.views.base import BaseModelViewSet, AllowDoctorsOrAdminsBaseModelViewSet


class IsSuperUserOrDoctorOrAdmin(IsMemberOfGroupsOrAdmin):
    group_names = ['Doctors', 'Administrators']


class TestModelViewSet(AllowDoctorsOrAdminsBaseModelViewSet):
    queryset = Test.objects.all()
    BaseSerializer = TestSerializer
    BaseDetailSerializer = TestDetailSerializer


class PublicTestModelViewSet(mixins.CreateModelMixin,
                             mixins.RetrieveModelMixin,
                             mixins.UpdateModelMixin,
                             mixins.DestroyModelMixin,
                             mixins.ListModelMixin,
                             GenericViewSet):
    queryset = PublicTest.objects.all()

    def get_serializer_class(self):
        if debug_settings:
            print(f'action: {self.action}')

        if self.action in ['list', 'retrieve']:
            return PublicDetailSerializer
        return PublicTestSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsSuperUserOrDoctorOrAdmin]
        return [permission() for permission in permission_classes]


class ResponseTestModelViewSet(BaseModelViewSet):
    queryset = ResponseTest.objects.all()
    BaseSerializer = ResponseTestSerializer


class WhitelistModelViewSet(mixins.CreateModelMixin,
                            mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin,
                            mixins.DestroyModelMixin,
                            mixins.ListModelMixin,
                            GenericViewSet):
    queryset = Whitelist.objects.all()
    serializer_class = WhitelistSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsSuperUserOrDoctorOrAdmin]
        return [permission() for permission in permission_classes]
