from __future__ import unicode_literals

import random
from datetime import timedelta

from django.contrib.auth.base_user import BaseUserManager
from django.core.signing import Signer
from django.db import models
from django.contrib.auth.models import PermissionsMixin, AbstractUser
from django.contrib.auth.base_user import AbstractBaseUser
from django.utils.translation import gettext_lazy as _
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password

from project import settings


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """
        Creates and saves a User with the given email and password.
        """
        if not email:
            raise ValueError('The given email must be set')
        if not password:
            raise ValueError('The password must be set')
        if not validate_password(password, user=None):
            raise ValueError('The given password must be at least 8 characters long')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError('The mail id must be set')
        if not password:
            raise ValueError('The password must be set')

        user = self.model(email=email, **extra_fields)
        user.password = make_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('email_confirmed', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    # поле не обязательно, но нужно для работы системы
    username = models.CharField(_('username'), max_length=32, unique=False, null=True, blank=True)
    first_name = models.CharField(_('first name'), max_length=100, blank=True)
    last_name = models.CharField(_('last name'), max_length=100, blank=True)
    patronymic = models.CharField(_('Отчество'), max_length=100, blank=True)
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)
    is_staff = models.BooleanField(_('staff'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    email_confirmed = models.BooleanField(
        default=False,
        verbose_name='Подтверждение почты',
        blank=True,
        null=True,
        help_text='Прошел ли пользователь проверку почты после регистрации.'
    )

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        """
        Returns the short name for the user.
        """
        return self.first_name

    def email_user(self, subject, message, from_email=None, **kwargs):
        """
        Sends an email to this User.
        """
        send_mail(subject, message, from_email, [self.email], **kwargs)

    def is_doctor(self) -> bool:
        return self.groups.filter(name='Doctors').exists()

    def is_administrator(self) -> bool:
        return self.groups.filter(name='Administrators').exists()

    def check_delete_if_inactive_unconfirmed(self) -> bool:
        """
        Удаляет текущего пользователя, если он неактивен и у него отсутствует подтверждение email.
        """
        if not self.email_confirmed and not self.is_active:
            tokens = EmailConfirmationToken.objects.filter(user=self)
            if not tokens.exists() or all(token.has_expired() for token in tokens):
                self.delete()
                return True
        return False


class EmailConfirmationToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(
        max_length=255,
        unique=True,
        verbose_name='Токен подтверждения почты.',
        help_text='Токен который указывается в GET запросе на подтверждения почты.\n'
                  'Состоит из id пользователя и email, зашифрованных django.signer.'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Время создания токена.'
    )

    is_changing_email = models.BooleanField(
        default=False,
        verbose_name='Флаг ',
        help_text='Флаг для токена,назначается в случае если пользователь решил изменить '
                  'почту (или зарегистрироваться).\n'
                  'В случае если пользователь регистрируется = False. В ином True.'
    )

    changed_email = models.EmailField(
        blank=True,
        help_text='Почта на которую пользователь хочет изменить свою текущую.'
    )

    def has_expired(self) -> bool:
        """
        Проверка действительности токена подтверждения почты
        Метод удалит токен если он уже был просрочен
        :return: Возвращает True если токен просрочен и уже недействителен
        """

        expiration_time = timedelta(minutes=settings.EMAIL_CONFIRMATION_TOKEN_LIFETIME)
        response = timezone.now() > self.created_at + expiration_time

        if response:
            self.delete()
        return response

    def __str__(self):
        return f"Email change token for {self.user.email}"


class PasswordChangeToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.IntegerField(
        verbose_name='Токен смены пароля.',
        help_text='6-ти значный код из цифр.'
    )

    url = models.CharField(
        verbose_name='URL для смены пароля.',
        help_text='Уникальный url для смены пароля.'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Время создания токена.'
    )

    def has_expired(self) -> bool:
        """
        Проверка действительности токена подтверждения пароля
        Метод удалит токен если он уже был просрочен
        :return: Возвращает True если токен просрочен и уже недействителен
        """

        expiration_time = timedelta(minutes=settings.EMAIL_CONFIRMATION_TOKEN_LIFETIME)
        response = timezone.now() > self.created_at + expiration_time

        if response:
            self.delete()
        return response

    def url_generator(self):
        signer = Signer()
        self.url = signer.sign_object(f'{self.user.id}%{self.user.email}')
        return f"{self.url}"

    def save(self, *args, **kwargs):
        """
        Переопределяем метод save, чтобы автоматически генерировать
        6-значный токен и URL перед сохранением объекта в базе данных.
        """
        PasswordChangeToken.objects.filter(user=self.user).delete()

        if not self.token:
            self.token = random.randint(100000, 999999)  # Генерируем 6-значный токен

        if not self.url:
            self.url = self.url_generator()  # Генерируем URL

        super().save(*args, **kwargs)  # Вызываем стандартный метод сохранения

    def __str__(self):
        return f"Password change token for {self.user.email}"
