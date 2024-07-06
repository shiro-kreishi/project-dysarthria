from rest_framework.generics import ListAPIView, RetrieveAPIView
from testing.models import DoctorToTest
from testing.serializers.testing import DoctorToTestSerializer


class DoctorToTestListAPIView(ListAPIView):
    queryset = DoctorToTest.objects.all()
    serializer_class = DoctorToTestSerializer


class DoctorToTestDetailAPIView(RetrieveAPIView):
    queryset = DoctorToTest.objects.all()
    serializer_class = DoctorToTestSerializer
    lookup_field = 'id'
