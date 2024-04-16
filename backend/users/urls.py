from django.urls import include, path
from django.contrib.auth import views as auth
from users.views.registration import Register


urlpatterns = [
    path(
        "login/", auth.LoginView.as_view(
            template_name="auth/login.html",
            success_url="homepage",
        ), name="login"
    ),
    path("logout/", auth.LogoutView.as_view(), name="logout"),
    path(
        "password_change/",
        auth.PasswordChangeView.as_view(
            template_name='auth/change_password.html',
            success_url='/users/password_changed/'
        ),
        name="password_change"
    ),
    path(
        "password_changed/",
        auth.PasswordChangeDoneView.as_view(
            template_name='auth/password_changed.html',
        ),
        name="password_changed",
    ),
    path(
        "password_reset/",
        auth.PasswordResetView.as_view(),
        name="password_reset"
    ),
    path(
        "password_reset/done/",
        auth.PasswordResetDoneView.as_view(),
        name="password_reset_done",
    ),
    path(
        "reset/<uidb64>/<token>/",
        auth.PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    path(
        "reset/done/",
        auth.PasswordResetCompleteView.as_view(),
        name="password_reset_complete",
    ),
    path('register/', Register.as_view(), name='register'),
]