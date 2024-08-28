from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from django.core.validators import validate_email

UserModel = get_user_model()


def custom_validation(data):
    email = data['email'].strip()
    username = data['username'].strip()
    password = data['password'].strip()
    ##
    if not email or UserModel.objects.filter(email=email).exists():
        raise ValidationError('choose another email')
    ##
    if not password or len(password) < 8:
        raise ValidationError('choose another password, min 8 characters')
    ##
    if not username:
        raise ValidationError('choose another username')
    return data


def custom_validate_email(email):
    email = email.strip()  # Убираем пробелы

    # Проверка на пустой email
    if not email:
        raise ValidationError('Поле почты пустое.')

    # Проверка формата email
    try:
        validate_email(email)
    except ValidationError:
        raise ValidationError('Неправильный формат почты.')

    # Проверка уникальности email
    if UserModel.objects.filter(email=email).exists():
        raise ValidationError('Эта почта уже используется.')

    # Проверка на запрещенные или одноразовые домены
    blocked_domains = ['tempmail.com', 'mailinator.com']
    domain = email.split('@')[-1]
    if domain in blocked_domains:
        raise ValidationError(f'Почта с доменом {domain} запрещена.')

    return True



def validate_password(data):
    password = data['password'].strip()
    if not password:
        raise ValidationError('a password is needed')
    return True

def validate_password_change(data):
    old_password = data.get('old_password', '').strip()
    new_password = data.get('new_password', '').strip()

    if not old_password or not new_password:
        raise ValidationError('Нужно заполнить все поля')

    if len(new_password) < 8:
        raise ValidationError('Выберете пароль больше 8 символов')
