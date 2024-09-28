from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from users.models.users import EmailConfirmationToken
from users.models.users import PasswordChangeToken


# Register your models here.
User = get_user_model()

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email','first_name', 'last_name', 'patronymic', 'is_active','email_confirmed',)
    fieldsets = (
        (None, {'fields': ('email',  'password')}),
        ('Personal info', {'fields': ('last_name', 'first_name', 'patronymic')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    readonly_fields = ('last_login', 'date_joined', 'username', 'email_confirmed',)


@admin.register(EmailConfirmationToken)
class EmailToken(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at','is_changing_email','changed_email')
    search_fields = ('user__email', 'token','is_changing_email')
    list_filter = ('created_at','is_changing_email')
    readonly_fields = ('created_at','token','is_changing_email','user',)


@admin.register(PasswordChangeToken)
class PasswordToken(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at')
    search_fields = ('user', 'token',)
    list_filter = ('user', 'created_at')
    readonly_fields = ('user', 'token', 'url')
