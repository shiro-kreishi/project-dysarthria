from project.settings import DEBUG as debug_settings
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views
from testing.models.test import Test, PublicTest, ResponseTest, Whitelist
from testing.serializers.testing import TestSerializer, PublicTestSerializer, ResponseTestSerializer, \
    WhitelistSerializer, TestDetailSerializer, TestCreateUpdateSerializer


# class TestModelViewSet(mixins.CreateModelMixin,
#                        mixins.RetrieveModelMixin,
#                        mixins.UpdateModelMixin,
#                        mixins.DestroyModelMixin,
#                        mixins.ListModelMixin,
#                        GenericViewSet):
#     queryset = Test.objects.all()
#     serializer_class = TestSerializer


class TestModelViewSet(mixins.CreateModelMixin,
                       mixins.RetrieveModelMixin,
                       mixins.UpdateModelMixin,
                       mixins.DestroyModelMixin,
                       mixins.ListModelMixin,
                       GenericViewSet):
    queryset = Test.objects.all()

    def get_serializer_class(self):
        if debug_settings:
            print(f'action: {self.action}')
        # if self.action in ['create', 'update', 'partial_update']:
        #     return TestCreateUpdateSerializer
        # elif self.action in ['retrieve', 'list']:
        #     return TestDetailSerializer
        # return TestSerializer

        if self.action in ['retrieve', 'list']:
            return TestDetailSerializer
        return TestSerializer


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
