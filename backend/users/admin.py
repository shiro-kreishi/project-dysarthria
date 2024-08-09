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
        ('Personal info', {'fields': ('first_name', 'last_name', )}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )


@admin.register(EmailConfirmationToken)
class EmailToken(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at')
    search_fields = ('user__email', 'token')
    list_filter = ('created_at',)
