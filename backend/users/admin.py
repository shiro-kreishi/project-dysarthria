from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from users.models.users import EmailConfirmationToken


# Register your models here.
User = get_user_model()

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', )
    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Personal info', {'fields': ('last_name', 'first_name', 'patronymic')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(EmailConfirmationToken)
class EmailToken(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at','is_changing_email','changed_email')
    search_fields = ('user__email', 'token','is_changing_email')
    list_filter = ('created_at','is_changing_email')
    readonly_fields = ('created_at','token','is_changing_email','user',)
