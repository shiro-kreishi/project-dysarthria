from api_v0.permissions import IsMemberOfGroupOrAdmin
from project.settings import DEBUG as debug_settings
from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views, permissions
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


class IsAdminOrDoctor(IsMemberOfGroupOrAdmin):
    group_name = 'Doctors'


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

        if self.action in ['retrieve', ]:
            return TestDetailSerializer
        return TestSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrDoctor]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]


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
    permission_classes = [
        permissions.AllowAny
    ]


class WhitelistModelViewSet(mixins.CreateModelMixin,
                            mixins.RetrieveModelMixin,
                            mixins.UpdateModelMixin,
                            mixins.DestroyModelMixin,
                            mixins.ListModelMixin,
                            GenericViewSet):
    queryset = Whitelist.objects.all()
    serializer_class = WhitelistSerializer
