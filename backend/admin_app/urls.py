from django.urls import include, path
from .views import admin_homepage_view
from .views.user_update_view import UserUpdateView

urlpatterns = [
    path('', admin_homepage_view.BaseAdminView.as_view(), name='admin_homepage'),
    path('user/<int:pk>/edit/', UserUpdateView.as_view(), name='user_edit'),
]