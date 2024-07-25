from django.urls import path
from user_api.views.user_api import \
    UserRegistrationAPIView, UserLogoutAPIView, UserAPIView, UserChangePasswordView, \
    AssignDoctorGroupUpdateAPIView

urlpatterns = [
    path('register/', UserRegistrationAPIView.as_view(), name='register'),
    # path('login/', UserLoginAPIView.as_view(), name='login'),
    path('logout/', UserLogoutAPIView.as_view(), name='logout'),
    path('user/', UserAPIView.as_view(), name='user'),
    path('change_password/', UserChangePasswordView.as_view(), name='change_password'),
    path('assign_doctor_group/', AssignDoctorGroupUpdateAPIView.as_view(), name='assign_doctor_group'),
]