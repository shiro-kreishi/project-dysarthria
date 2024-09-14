from django.contrib.auth.models import User

class AccessUtils:
    @staticmethod
    def user_has_access(user) -> bool:
        """
            ОБЯЗАТЕЛЬНАЯ проверка аутентификации для всего приложения
        """
        if user.is_authenticated and (user.is_superuser or user.is_administrator()):
            return True

        return False

