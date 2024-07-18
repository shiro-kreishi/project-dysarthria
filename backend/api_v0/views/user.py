from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views

from api_v0.permissions import IsMemberOfGroupOrAdmin
from testing.models import DoctorToTest
from testing.serializers.testing import DoctorToTestSerializer, DoctorToTestDetailSerializer
from rest_framework.generics import UpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import Group

from users.models import User
from users.serializers import AssignDoctorSerializer


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


class AssignDoctorGroupUpdateAPIView(UpdateAPIView):
    serializer_class = AssignDoctorSerializer
    permission_classes = [IsAdminOrDoctor]

    def update(self, request, *args, **kwargs):
        user_id = request.data.get('user_id')

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        try:
            doctor_group, created = Group.objects.get_or_create(name='Doctors')
            user.groups.add(doctor_group)
            user.save()
            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)