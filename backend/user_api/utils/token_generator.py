from rest_framework.exceptions import ValidationError
from django.core.signing import Signer, BadSignature
from users.models.users import EmailConfirmationToken, User


#  TODO Здесь создаются токены при помощи криптографической подписи
#   Возможно есть способ лучше, но я пока не нашёл


def generate_signed_token(user):
    signer = Signer()
    signed_id_and_email = signer.sign_object(f'{user.id}%{user.email}')
    return f"{signed_id_and_email}"


def create_confirmation_token(user, is_changing_email=False, changed_email=''):
    # Проверка наличия пользователя
    if not user or not User.objects.filter(pk=user.pk).exists():
        raise ValidationError('Пользователь не найден или не существует.')

    existing_token = EmailConfirmationToken.objects.filter(user=user)
    if existing_token and not existing_token.has_expired():
        raise ValidationError('Пользователь уже подтверждает свою почту.')

    try:
        # Генерация токена и сохранение
        token = generate_signed_token(user)
        print(user.email, token)
        email_token = EmailConfirmationToken.objects.create(
            user=user,
            token=token,
            is_changing_email=is_changing_email,
            changed_email=changed_email,
        )

        return email_token.token
    except Exception as e:
        # Обработка возможных ошибок при создании токена
        raise ValidationError(f"Ошибка создания токена подтверждения: {str(e)}")


def verify_signed_token(token):
    signer = Signer()
    email = None
    user_id = None

    try:
        signed_id_and_email = signer.unsign_object(token)
        user_id, email = signed_id_and_email.split('%')

        return email, user_id
    except (BadSignature, ValueError) as e:
        return email, user_id