from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views
from testing.models import DoctorToTest
from testing.serializers.testing import DoctorToTestSerializer


class DoctorToTestModelViewSet(mixins.CreateModelMixin,
                               mixins.RetrieveModelMixin,
                               mixins.UpdateModelMixin,
                               mixins.DestroyModelMixin,
                               mixins.ListModelMixin,
                               GenericViewSet):
    queryset = DoctorToTest.objects.all()
    serializer_class = DoctorToTestSerializer
