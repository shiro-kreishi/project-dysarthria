from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.views import View
from users.forms.registration import UserRegisterForm


class Register(View):
    template_name = "auth/registration.html"

    def get(self, request):
        context = {
            'title': 'Регистрация пользователя',
            'form': UserRegisterForm
        }
        return render(request, self.template_name, context)

    def post(self, request):
        form = UserRegisterForm(request.POST)

        if form.is_valid():
            form.instance.is_verificated = False
            user = form.save()  # Сохранение пользователя и получение экземпляра пользователя
            email = form.cleaned_data.get('email')
            password = form.cleaned_data.get('password1')

            # Аутентификация пользователя используя email и пароль
            user = authenticate(email=email, password=password)
            if user is not None:
                login(request, user)
                return redirect('homepage')

        context = {
            'title': 'Регистрация пользователя',
            'form': form
        }
        return render(request, self.template_name, context)