from django.contrib.auth import login, logout
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.core.signing import Signer, BadSignature
from rest_framework.authentication import SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response

from project import settings
from project.settings import DEBUG
from user_api.serializers.user import UserRegistrationSerializer, UserLoginSerializer, UserSerializer, \
    ChangePasswordSerializer, ChangeNameSerializer, UserChangeEmailSerializer
from rest_framework import permissions, status, viewsets

from user_api.utils.creating_email_message import send_confirmation_email
from user_api.utils.token_generator import verify_signed_token, create_confirmation_token
from user_api.validations import custom_validation, validate_email, validate_password
from users.models import User
from user_api.serializers.doctor_serializers import AssignDoctorSerializer
from django.contrib.auth.models import Group
from user_api.permissions import IsMemberOfGroupsOrAdmin

class IsSuperUserOrDoctorOrAdminPermission(IsMemberOfGroupsOrAdmin):
    group_names = ['Doctors', 'Administrators']

from users.models.users import EmailConfirmationToken


class ConfirmEmailView(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = User.objects.all()
    http_method_names = ['get', 'head', 'options', 'list']

    """
     Подтверждение почты Вообще здесь нужна особая логика, так как удалять
     пользователей не стоит!
     Нужно спросить хочет ли пользователь перегенерировать
     токен почты.
    """
    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_204_NO_CONTENT)

    def retrieve(self, request, pk=None, *args, **kwargs):
        token = pk
        email, signed_user_id = verify_signed_token(token)

        # Проверяем токен на то что почта и id не пустые
        if email is None or signed_user_id is None:
            if DEBUG:
                return Response({"error": "Field email or user_id is Null. Token is invalid"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Invalid token or user."}, status=status.HTTP_400_BAD_REQUEST)

        # Достаем токен из базы
        try:
            email_token = EmailConfirmationToken.objects.get(user_id=signed_user_id, token=token)
        except EmailConfirmationToken.DoesNotExist:
            if DEBUG:
                return Response({"error": "Token not found."}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"error": "Invalid token or user."}, status=status.HTTP_400_BAD_REQUEST)

        user = email_token.user

        # TODO: Тут по моему уязвимость с тем что можно удалить существующего пользователя
        # Проверка на то что токен просрочен
        if email_token.has_expired():
            # Удаляем токен
            email_token.delete()
            if DEBUG:
                return Response({"error": "Token has expired. Token has deleted"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"error": "Invalid token or user."}, status=status.HTTP_400_BAD_REQUEST)


        if user.is_active:
            # Если пользователь активен и хочет изменить почту
            if email_token.is_changing_email:
                # Проверяем флаг и изменяем
                user.email = email_token.changed_email
            else:
                # Если флага на токена нет значит произошла какая то ошибка или уязвимость
                email_token.delete()
                if DEBUG:
                    return Response({"error": "User is activated. But he has token."}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    return Response({"error": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Если пользователь не активен (только зарегистрировался)
            # Делаем пользователя активным
            user.is_active = True

        email_token.delete()
        user.save()
        return Response({"message": "Email confirmed successfully"}, status=status.HTTP_200_OK)


# class UserRegistrationAPIView(APIView):
#     permission_classes = [permissions.AllowAny]
#
#     def post(self, request):
#         clean_data = custom_validation(request.data)
#         serializer = UserRegistrationSerializer(data=clean_data)
#         if serializer.is_valid():
#             user = serializer.save()
#             if user is not None:
#                 response_data = {
#                     "email": user.email,
#                     "username": user.username,
#                 }
#                 return Response(response_data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRegistrationModelViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    http_method_names = ['post']

    def create(self, request, *args, **kwargs):
        try:
            clean_data = custom_validation(request.data)
        except:
            return Response({"error": 'Invalid email or password'}, status=status.HTTP_400_BAD_REQUEST)
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
    permission_classes = [IsSuperUserOrDoctorOrAdminPermission]
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


class UpdateNameModelViewSet(viewsets.ViewSet):
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


class UserChangeEmailModelViewSet(viewsets.ModelViewSet):
    http_method_names = ['post']
    serializer_class = UserChangeEmailSerializer

    def get_queryset(self):
        request = self.request
        user = request.user
        # Вернуть queryset, содержащий только текущего пользователя
        return User.objects.filter(pk=user.pk)

    def list(self, request, *args, **kwargs):
        return Response(status=status.HTTP_204_NO_CONTENT)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Проверяет данные
        new_email = serializer.validated_data.get('new_email')
        self.send_confirmation_email(request.user, new_email)
        return Response(status=status.HTTP_204_NO_CONTENT)


    def send_confirmation_email(self, user, new_email):
        confirmation_token = create_confirmation_token(user=user, is_changing_email=True, changed_email=new_email)
        send_confirmation_email(user, confirmation_token)




