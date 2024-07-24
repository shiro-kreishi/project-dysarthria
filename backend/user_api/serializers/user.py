from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

from user_api.validations import validate_password_change

UserModel = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['email', 'password', 'username']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = UserModel(**validated_data)
        user.set_password(password)
        user.save()
        return user

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
            raise serializers.ValidationError('Username or password is incorrect')
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('email', 'username')


class ChangePasswordSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = UserModel
        fields = ['old_password', 'new_password']

    def validate(self, data):
        user = self.instance

        if not user.check_password(data['old_password']):
            raise serializers.ValidationError({'old_password': 'Wrong password.'})

        validate_password_change(data)

        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password'])
        instance.save()
        return instance


