from rest_framework.generics import ListAPIView, RetrieveAPIView
from testing.models.test import Test, PublicTest, ResponseTest, Whitelist
from testing.serializers.testing import TestSerializer, PublicTestSerializer, ResponseTestSerializer, WhitelistSerializer

class TestListAPIView(ListAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer

class TestDetailAPIView(RetrieveAPIView):
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    lookup_field = 'id'

class PublicTestListAPIView(ListAPIView):
    queryset = PublicTest.objects.all()
    serializer_class = PublicTestSerializer

class PublicTestDetailAPIView(RetrieveAPIView):
    queryset = PublicTest.objects.all()
    serializer_class = PublicTestSerializer
    lookup_field = 'id'

class ResponseTestListAPIView(ListAPIView):
    queryset = ResponseTest.objects.all()
    serializer_class = ResponseTestSerializer

class ResponseTestDetailAPIView(RetrieveAPIView):
    queryset = ResponseTest.objects.all()
    serializer_class = ResponseTestSerializer
    lookup_field = 'id'

class WhitelistTestListAPIView(ListAPIView):
    queryset = Whitelist.objects.all()
    serializer_class = WhitelistSerializer

class WhitelistTestDetailAPIView(RetrieveAPIView):
    queryset = Whitelist.objects.all()
    serializer_class = WhitelistSerializer
    lookup_field = 'id'
