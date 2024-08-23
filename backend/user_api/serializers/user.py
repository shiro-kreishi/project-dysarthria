from django.contrib.auth.models import Group
from django.core.signing import Signer
from django.contrib.auth.hashers import make_password
from rest_framework import serializers, status
from django.contrib.auth import get_user_model, authenticate
from django.core.mail import send_mail
from rest_framework.response import Response
from project import settings
from user_api.utils.token_generator import create_confirmation_token
from user_api.validations import validate_password_change


UserModel = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['email', 'username',
                  'last_name', 'first_name',
                  'patronymic', 'password', ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = UserModel(**validated_data)
        user.is_active = False
        user.set_password(password)
        user.save()
        self.send_confirmation_email(user)
        return user

    def send_confirmation_email(self, user):
        confirmation_token = create_confirmation_token(user)
        confirmation_url = f"{settings.SITE_URL}/api/user/confirm-email/{confirmation_token}/"
        email_subject = "Подтверждение почты"
        email_message = f"Пожалуйста подтвердите свою почту кликнув по следующей ссылке: {confirmation_url}"
        send_mail(email_subject, email_message, settings.DEFAULT_FROM_EMAIL, [user.email])

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password should be at least 8 characters long")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password should include at least one digit")
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("Password should include at least one letter")
        return value


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def check_user(self, clean_data):
        user = authenticate(email=clean_data['email'], password=clean_data['password'])
        if not user:
            raise serializers.ValidationError('Email or password is incorrect')
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('email', 'username', 'last_name', 'first_name',)


class UserWithIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('id', 'email', 'username', 'last_name', 'first_name',)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None

        if not user:
            raise serializers.ValidationError("User not authenticated")

        if not user.check_password(data.get('old_password')):
            raise serializers.ValidationError({"old_password": "Wrong password."})

        new_password = data.get('new_password')

        # Проверка на длину пароля (минимум 8 символов)
        if len(new_password) < 8:
            raise serializers.ValidationError({"new_password": "Password should be at least 8 characters long"})

        # Проверка на наличие хотя бы одной цифры
        if not any(char.isdigit() for char in new_password):
            raise serializers.ValidationError({"new_password": "Password should include at least one digit"})

        # Проверка на наличие хотя бы одной буквы
        if not any(char.isalpha() for char in new_password):
            raise serializers.ValidationError({"new_password": "Password should include at least one letter"})

        return data

    def save(self, **kwargs):
        request = self.context.get('request')
        user = request.user if request else None
        user.password = make_password(self.validated_data['new_password'])
        user.save()
        return user


class ChangeNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['first_name', 'last_name', 'patronymic',]

    def validate_first_name(self, value):
        if not value:
            raise serializers.ValidationError("Имя не может быть пустым")
        if not value.isalpha():
            raise serializers.ValidationError("Имя должно содержать только буквы")
        return value

    def validate_last_name(self, value):
        if not value:
            raise serializers.ValidationError("Фамилия не может быть пустой")
        if not value.isalpha():
            raise serializers.ValidationError("Фамилия должна содержать только буквы")
        return value

    def validate_patronymic(self, value):
        return value

    def validate(self, data):
        return data

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.patronymic = validated_data.get('patronymic', instance.patronymic)
        instance.save()
        return instance


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']