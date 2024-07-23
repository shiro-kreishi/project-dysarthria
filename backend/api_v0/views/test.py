from api_v0.permissions import IsMemberOfGroupsOrAdmin
from project.settings import DEBUG as debug_settings
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views, permissions
from testing.models.test import Test, PublicTest, ResponseTest, Whitelist
from api_v0.serializers.test import TestSerializer, PublicTestSerializer, ResponseTestSerializer, \
    WhitelistSerializer, TestDetailSerializer, TestCreateUpdateSerializer, PublicDetailSerializer
from api_v0.views.base import BaseModelViewSet, AllowDoctorsOrAdminsBaseModelViewSet, \
    ListAndRetrieveForAnyUserModelViewSet, CloseForAnyUserModelViewSet


class IsSuperUserOrDoctorOrAdmin(IsMemberOfGroupsOrAdmin):
    group_names = ['Doctors', 'Administrators']


class TestModelViewSet(CloseForAnyUserModelViewSet):
    queryset = Test.objects.all()
    BaseSerializer = TestSerializer
    BaseDetailSerializer = TestDetailSerializer


class PublicTestModelViewSet(AllowDoctorsOrAdminsBaseModelViewSet):
    queryset = PublicTest.objects.all()
    BaseSerializer = PublicTestSerializer
    BaseDetailSerializer = PublicDetailSerializer


class ResponseTestModelViewSet(BaseModelViewSet):
    queryset = ResponseTest.objects.all()
    BaseSerializer = ResponseTestSerializer


class WhitelistModelViewSet(ListAndRetrieveForAnyUserModelViewSet):
    queryset = Whitelist.objects.all()
    BaseSerializer = WhitelistSerializer
