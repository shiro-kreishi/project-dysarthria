from django.contrib.auth import get_user_model, password_validation
from django.contrib.auth.forms import UserCreationForm
from django import forms
from django.utils.translation import gettext_lazy as _
from captcha.fields import CaptchaField, CaptchaTextInput
from users.models.users import User as UserModel



User = get_user_model()


class UserRegisterForm(UserCreationForm):

    username = forms.CharField(
        label="Имя пользователя*",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите ваше имя пользователя'
        }),
        required=True
    )

    last_name = forms.CharField(
        label="Фамилия*",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите вашу фамилию'
        }),
        required=True
    )

    first_name = forms.CharField(
        label="Имя*",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Введите ваше имя'
        }),
        required=True
    )

    email = forms.EmailField(
        label=_("Email*"),
        max_length=254,
        widget=forms.EmailInput(attrs={
            'autocomplete': 'email',
            'class': 'form-control',
            'placeholder': 'Введите ваш email'
        }),
        required=True
    )


    error_messages = {
        "password_mismatch": _("The two password fields didn’t match."),
    }
    password1 = forms.CharField(
        label=_("Пароль*"),
        strip=False,
        widget=forms.PasswordInput(attrs={
            "autocomplete": "new-password",
            'placeholder': 'Введите ваш пароль'
        }),
        help_text=password_validation.password_validators_help_text_html(),
    )
    password2 = forms.CharField(
        label=_("Подтверждение пароля*"),
        widget=forms.PasswordInput(attrs={
            "autocomplete": "new-password",
            'placeholder': 'Подтвердите ваш пароль'
        }),
        strip=False,
        help_text=_("Enter the same password as before, for verification."),
    )

    captcha = CaptchaField(
        label="Подтвердите проверку*",
        widget=CaptchaTextInput(attrs={
            'placeholder': 'введите текст с картинки',
        }),
        required=True
    )

    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            "username", "last_name", "first_name", "email",
            "password1", "password2", "captcha"
        )

    def clean(self):
        cleaned_data = super().clean()
        username = cleaned_data.get('username')
        email = cleaned_data.get('email'),
        if username and email:
            user = UserModel.objects.filter(username=username, email=email,)
            if user.exists():
                self.add_error(None, f'Пользователь с  именем {username} существует')