from django.urls import path
from .views.admin_homepage_view import BaseAdminView
from .views.user_update_view import UserUpdateView
from .views.blocked_users_view import BlockedUsersView
from .views.unverified_users_view import UnverifiedUsersView

urlpatterns = [
    path('', BaseAdminView.as_view(), name='admin_homepage'),
    path('user/<int:pk>/edit/', UserUpdateView.as_view(), name='user_edit'),
    path('blocked-users', BlockedUsersView.as_view(), name='blocked-users'),
    path('unverified-users', UnverifiedUsersView.as_view(), name='unverified-users'),
]