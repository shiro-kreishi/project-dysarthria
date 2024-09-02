from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from project import settings
from users.views.views import HomeStub

urlpatterns = [
    path('admin/', admin.site.urls),
    path('captcha/', include('captcha.urls')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('users/', include('users.urls')),
    path('api/user/', include('user_api.urls')),
    path('api/v0/', include('api_v0.urls')),
    path('administrator/', include('admin_app.urls')),
]

urlpatterns += static(settings.STATIC_URL, document_root = settings.STATIC_ROOT)
