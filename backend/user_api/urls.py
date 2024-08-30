from django.urls import path, include
from rest_framework import routers

from user_api.views.user import DoctorToTestModelViewSet, UserModelViewSet, CheckUserPermissions
from user_api.views.user_api import \
    UserRegistrationModelViewSet, UserLoginModelViewSet, \
    UserLogoutViewSet, CurrentUserViewSet, UserChangePasswordModelViewSet, AssignDoctorGroupModelViewSet, \
    UpdateNameModelViewSet, ConfirmEmailView, UserChangeEmailModelViewSet, AssignAdministratorGroupModelViewSet

router = routers.DefaultRouter()
router.register(r'register', UserRegistrationModelViewSet, basename='register')
router.register(r'login', UserLoginModelViewSet, basename='login')
router.register(r'logout', UserLogoutViewSet, basename='logout')
router.register(r'current-user', CurrentUserViewSet, basename='current-user')
router.register(r'change-password', UserChangePasswordModelViewSet, basename='change-password')
router.register(r'assign-doctor-group', AssignDoctorGroupModelViewSet, basename='assign-doctor-group')
router.register(r'assign-administrator-group', AssignAdministratorGroupModelViewSet, basename='assign-administrator-group')
router.register(r'update-name', UpdateNameModelViewSet, basename='update-name')
router.register(r'doctors-test', DoctorToTestModelViewSet, basename='doctors-test')
router.register(r'users', UserModelViewSet, basename='users')
router.register(r'check-user-permissions', CheckUserPermissions, basename='check-user-permissions')
router.register(r'confirm-email', ConfirmEmailView, basename='user-confirm-email')
router.register(r'change-email', UserChangeEmailModelViewSet, basename='change-email')

urlpatterns = [
    path('', include(router.urls)),
]