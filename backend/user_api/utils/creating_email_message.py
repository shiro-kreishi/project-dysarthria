from django.core.exceptions import ValidationError
from django.core.mail import send_mail, BadHeaderError

from project import settings


def send_confirmation_email(user, confirmation_token):
    try:
        # Формирование URL для подтверждения почты
        confirmation_url = f"{settings.SITE_URL}/api/user/confirm-email/{confirmation_token}/"
        email_subject = "Подтверждение почты"
        email_message = f"Пожалуйста, подтвердите свою почту, кликнув по следующей ссылке: {confirmation_url}"

        # Отправка письма
        send_mail(email_subject, email_message, settings.DEFAULT_FROM_EMAIL, [user.email])

    except BadHeaderError:
        raise ValidationError("Обнаружен неверный заголовок в email.")

    except Exception as e:
        raise ValidationError(f"Ошибка при отправке письма: {str(e)}")