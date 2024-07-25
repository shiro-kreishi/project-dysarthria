from django.urls import path, include
from rest_framework import routers
from user_api.views.user_api import \
    UserRegistrationAPIView, UserRegistrationModelViewSet, UserLoginModelViewSet, \
    UserLogoutViewSet, CurrentUserViewSet, UserChangePasswordModelViewSet, AssignDoctorGroupModelViewSet, \
    UpdateNameModelViewSet

router = routers.DefaultRouter()
router.register(r'register', UserRegistrationModelViewSet, basename='register')
router.register(r'login', UserLoginModelViewSet, basename='login')
router.register(r'logout', UserLogoutViewSet, basename='logout')
router.register(r'current-user', CurrentUserViewSet, basename='current-user')
router.register(r'change-password', UserChangePasswordModelViewSet, basename='change-password')
router.register(r'assign-doctor-group', AssignDoctorGroupModelViewSet, basename='assign-doctor-group')
router.register(r'update-name', UpdateNameModelViewSet, basename='update-name')

urlpatterns = [
    # path('register/', UserRegistrationAPIView.as_view(), name='register'),
    path('', include(router.urls)),
    # path('login/', UserLoginAPIView.as_view(), name='login'),
    # path('logout/', UserLogoutAPIView.as_view(), name='logout'),
    # path('user/', UserAPIView.as_view(), name='user'),
    # path('change_password/', UserChangePasswordView.as_view(), name='change_password'),
    # path('assign_doctor_group/', AssignDoctorGroupUpdateAPIView.as_view(), name='assign_doctor_group'),
    # path('update_name/', UpdateNameView.as_view(), name='update_name'),
]