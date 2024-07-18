from rest_framework import serializers
from django.contrib.auth.models import Group

def validate_doctor_or_admin(user):
    if user and not user.groups.filter(name='Doctors').exists() or not user.is_superuser:
        raise serializers.ValidationError("User is not in the Doctors group or superuser.")
    return user
