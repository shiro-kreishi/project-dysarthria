from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views
from testing.models.test import Test, PublicTest, ResponseTest, Whitelist
from testing.serializers.testing import TestSerializer, PublicTestSerializer, ResponseTestSerializer, \
    WhitelistSerializer


class TestModelViewSet(mixins.CreateModelMixin,
                       mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.ListModelMixin,
                       GenericViewSet):
    queryset = Test.objects.all()
    serializer_class = TestSerializer


class PublicTestModelViewSet(mixins.CreateModelMixin,
                             mixins.RetrieveModelMixin,
                             mixins.UpdateModelMixin,
                             mixins.DestroyModelMixin,
                             mixins.ListModelMixin,
                             GenericViewSet):
    queryset = PublicTest.objects.all()
    serializer_class = PublicTestSerializer


class ResponseTestModelViewSet(mixins.CreateModelMixin,
                               mixins.RetrieveModelMixin,
                               mixins.UpdateModelMixin,
                               mixins.DestroyModelMixin,
                               mixins.ListModelMixin,
                               GenericViewSet):
    queryset = ResponseTest.objects.all()
    serializer_class = ResponseTestSerializer


class WhitelistModelViewSet(mixins.CreateModelMixin,
                            mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin,
                            mixins.DestroyModelMixin,
                            mixins.ListModelMixin,
                            GenericViewSet):
    queryset = Whitelist.objects.all()
    serializer_class = WhitelistSerializer
