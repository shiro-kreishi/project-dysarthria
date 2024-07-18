from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.models import Group


class AssignDoctorSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist.")
        return value