from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator

UserModel = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=UserModel.objects.all())]
    )

    class Meta:
        model = UserModel
        fields = ('email', 'username', 'password', 'password2', 'first_name', 'last_name')

    def create(self, validated_data):
        user = UserModel.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )

        user.set_password(validated_data['password'])
        user.save()

        return user

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})

        return attrs

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

    # def check_user(self, clean_data):
    #     user = authenticate(email=clean_data['email'], password=clean_data['password'])
    #     if not user:
    #         raise serializers.ValidationError('Username or password is incorrect')
    #     return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ('email', 'username',)
