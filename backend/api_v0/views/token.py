from rest_framework_simplejwt.views import TokenObtainPairView
from api_v0.serializers.users import UserSerializer


class LoginTokenObtainPairView(TokenObtainPairView):
    serializer_class = UserSerializer
