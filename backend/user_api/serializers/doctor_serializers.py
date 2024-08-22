from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth.models import Group

UserModel = get_user_model()


class AssignDoctorSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        try:
            user = UserModel.objects.filter(id=value).first()
        except UserModel.DoesNotExist:
            raise serializers.ValidationError("User does not exist.")
        return value