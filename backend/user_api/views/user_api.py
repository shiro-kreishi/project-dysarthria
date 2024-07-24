from django.contrib.auth import get_user_model, login, logout
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.generics import UpdateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response

from api_v0.views import IsAdminOrDoctor
from user_api.serializers.user import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, \
    ChangePasswordSerializer
from rest_framework import permissions, status
from user_api.validations import custom_validation, validate_email, validate_password
from users.models import User
from users.serializers import AssignDoctorSerializer
from django.contrib.auth.models import Group

class UserRegistrationAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        clean_data = custom_validation(request.data)
        serializer = UserRegistrationSerializer(data=clean_data)
        if serializer.is_valid():
            user = serializer.save()
            if user is not None:
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginAPIView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        data = request.data
        assert validate_email(data)
        assert validate_password(data)
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid():
            user = serializer.check_user(data)
            if user is not None:
                login(request, user)
                return Response(serializer.data, status=status.HTTP_200_OK)


class UserLogoutAPIView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class UserAPIView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(
            {'user': serializer.data},
            status=status.HTTP_200_OK
        )


class UserChangePasswordView(UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminOrDoctor]
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user


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