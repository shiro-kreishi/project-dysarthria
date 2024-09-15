from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.validators import validate_email

UserModel = get_user_model()


def custom_validation(data):
    """
    Выполняет общую валидацию данных пользователя.
    """
    email = data.get('email', '')
    password = data.get('password', '')

    # Валидация email
    try:
        custom_validate_email(email)
    except ValidationError as e:
        raise ValidationError(e.message)
    # Валидация пароля
    try:
        validate_password(password)
    except ValidationError as e:
        raise ValidationError(e.message)

    return data

def custom_validate_email(email):
    """
    Проверяет корректность и уникальность email.
    """
    email = email.strip()

    if not email:
        raise ValidationError('Поле почты пустое.')

    try:
        validate_email(email)
    except ValidationError:
        raise ValidationError('Неправильный формат почты.')

    if UserModel.objects.filter(email=email).exists():
        raise ValidationError('Эта почта уже используется.')

    blocked_domains = ['tempmail.com', 'mailinator.com']
    domain = email.split('@')[-1]
    if domain in blocked_domains:
        raise ValidationError(f'Почта с доменом {domain} запрещена.')

    return email


def validate_password(password):
    """
    Проверяет валидность пароля.
    """
    password = password.strip()
    if not password:
        raise ValidationError('Пароль не должен быть пустым.')

    if len(password) < 8:
        raise ValidationError('Выберите пароль длиной не менее 8 символов.')

    # Проверка на наличие хотя бы одной цифры
    if not any(char.isdigit() for char in password):
        raise ValidationError('Пароль должен содержать хотя бы одну цифру.')

    # Проверка на наличие хотя бы одной буквы
    if not any(char.isalpha() for char in password):
        raise ValidationError('Пароль должен содержать хотя бы одну букву.')
    return password

