from django.urls import path, include
from rest_framework import routers
from user_api.views.user_api import \
    UserRegistrationAPIView, UserRegistrationModelViewSet, UserLoginModelViewSet, \
    UserLogoutViewSet, CurrentUserViewSet, UserChangePasswordModelViewSet, AssignDoctorGroupModelViewSet, \
    UpdateNameModelViewSet, ConfirmEmailView

router = routers.DefaultRouter()
router.register(r'register', UserRegistrationModelViewSet, basename='register')
router.register(r'login', UserLoginModelViewSet, basename='login')
router.register(r'logout', UserLogoutViewSet, basename='logout')
router.register(r'current-user', CurrentUserViewSet, basename='current-user')
router.register(r'change-password', UserChangePasswordModelViewSet, basename='change-password')
router.register(r'assign-doctor-group', AssignDoctorGroupModelViewSet, basename='assign-doctor-group')
router.register(r'update-name', UpdateNameModelViewSet, basename='update-name')

urlpatterns = [
    path('', include(router.urls)),
    path('confirm-email/<int:user_id>/<str:token>/', ConfirmEmailView.as_view(), name='user_confirm_email'),
]