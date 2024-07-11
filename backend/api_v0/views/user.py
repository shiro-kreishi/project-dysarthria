from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views

from api_v0.permissions import IsMemberOfGroupOrAdmin
from testing.models import DoctorToTest
from testing.serializers.testing import DoctorToTestSerializer, DoctorToTestDetailSerializer

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
    permission_classes = [IsAdminOrDoctor]
