from django.contrib.auth import login, logout
from django.contrib.auth.hashers import make_password
from django.core.signing import Signer, BadSignature
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from api_v0.views import IsAdminOrDoctor
from user_api.serializers.user import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, \
    ChangePasswordSerializer, ChangeNameSerializer
from rest_framework import permissions, status, viewsets
from user_api.validations import custom_validation, validate_email, validate_password
from users.models import User
from user_api.serializers.doctor_serializers import AssignDoctorSerializer
from django.contrib.auth.models import Group


class ConfirmEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id, token, *args, **kwargs):
        try:
            user = User.objects.get(pk=user_id)
            signer = Signer()
            email = signer.unsign(token)
            if email == user.email:
                user.is_active = True
                user.save()
                return Response({"message": "Email confirmed successfully"}, status=status.HTTP_200_OK)
        except (User.DoesNotExist, BadSignature):
            return Response({"error": "Invalid confirmation link"}, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        clean_data = custom_validation(request.data)
        serializer = UserRegistrationSerializer(data=clean_data)
        if serializer.is_valid():
            user = serializer.save()
            if user is not None:
                response_data = {
                    "email": user.email,
                    "username": user.username,
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        try:
            clean_data = custom_validation(request.data)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(data=clean_data)
        if serializer.is_valid():
            user = serializer.save()
            if user is not None:
                response_data = {
                    "email": user.email,
                    "username": user.username,
                }
                return Response(response_data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginModelViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserLoginSerializer
    http_method_names = ['post']
    queryset = ''

    def create(self, request, *args, **kwargs):
        data = request.data
        assert validate_email(data)
        assert validate_password(data)
        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            try:
                user = serializer.check_user(data)
            except ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
            if user is None:
                return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
            login(request, user)
            response_data = {
                'email': user.email,
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutViewSet(viewsets.ViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    http_method_names = ['post']

    def create(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)


class CurrentUserViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    serializer_class = UserSerializer
    http_method_names = ['get']
    queryset = User.objects.all()

    def list(self, request, pk=None, **kwargs):
        serializer = self.serializer_class(request.user)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class UserChangePasswordModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['post']
    serializer_class = ChangePasswordSerializer

    def create(self, request, *args, **kwargs):
        user = self.request.user
        serializer = self.serializer_class(data=request.data, context={'request': request})

        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.validated_data.get("old_password")):
                return Response({"old_password": ["Неверный пароль."]}, status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            user.password = make_password(serializer.validated_data.get("new_password"))
            user.save()
            return Response({"detail": "Пароль изменён."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AssignDoctorGroupModelViewSet(viewsets.ModelViewSet):
    serializer_class = AssignDoctorSerializer
    permission_classes = [IsAdminOrDoctor]
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data['user_id']

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "Пользователь не найден."}, status=status.HTTP_404_NOT_FOUND)

        try:
            doctor_group, created = Group.objects.get_or_create(name='Doctors')
            user.groups.add(doctor_group)
            user.save()
            return Response({"detail": "Группа назначена."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UpdateNameModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangeNameSerializer
    http_method_names = ['post', 'get']

    def create(self, request, *args, **kwargs):
        user = request.user
        serializer = self.serializer_class(user, data=request.data, partial=True)

        if serializer.is_valid():
            if not request.data.get('first_name') and not request.data.get('last_name'):
                return Response({"detail": "Данные не предоставлены."}, status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response({"detail": "Имя изменено."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request, *args, **kwargs):
        serializer = self.serializer_class(request.user)
        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
