from django.urls import include, path
from .views.register import RegisterCreateApiView
from .views.token import LoginTokenObtainPairView

urlpatterns = [
    path('register/', RegisterCreateApiView.as_view(), name='api-register'),
    path('token/', LoginTokenObtainPairView.as_view(), name='token_obtain_pair')
]