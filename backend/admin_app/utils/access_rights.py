from django.contrib.auth.models import User

class AccessUtils:
    @staticmethod
    def user_has_access(user):
        """
            ОБЯЗАТЕЛЬНАЯ проверка аутентификации для всего приложения
        """
        if user.is_authenticated and (user.is_superuser or user.groups.filter(name='Administrator').exists()):
            return True
