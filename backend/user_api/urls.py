from django.urls import path
from user_api.views.user_api import \
    UserRegistrationAPIView, UserLogoutAPIView, UserAPIView

urlpatterns = [
    path('register/', UserRegistrationAPIView.as_view(), name='register'),
    # path('login/', UserLoginAPIView.as_view(), name='login'),
    path('logout/', UserLogoutAPIView.as_view(), name='logout'),
    path('user/', UserAPIView.as_view(), name='user'),
]