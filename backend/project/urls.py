from django.contrib import admin
from django.urls import path, include
from users.views.views import HomeStub
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('captcha/', include('captcha.urls')),
    path('users/', include('users.urls')),
    path('api/user/', include('user_api.urls')),
    path('', HomeStub.as_view(), name='homepage'),
    path('api/v0/', include('api_v0.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
