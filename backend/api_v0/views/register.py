from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from api_v0.serializers.users import UserSerializer
from users.models.users import User
from django.db import IntegrityError

class RegisterCreateApiView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            tokens = {'refresh': str(refresh), 'access': str(refresh.access_token)}
            return Response(tokens)
        except IntegrityError as e:
            return Response(
                {"error": "Пользователь с таким именем уже существует."},
                status=status.HTTP_400_BAD_REQUEST,
            )
