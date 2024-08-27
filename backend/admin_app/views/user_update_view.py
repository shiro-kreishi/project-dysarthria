from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import UpdateView
from django.shortcuts import redirect

from admin_app.utils.access_rights import AccessUtils
from project.settings import SITE_URL
from users.models.users import User

class UserUpdateView(LoginRequiredMixin, UserPassesTestMixin, UpdateView):
    model = User
    template_name = 'admin_app/user_edit_page.html'
    fields = ['first_name', 'last_name', 'email', 'patronymic', 'date_joined']
    context_object_name = 'user'
    success_url = reverse_lazy('admin_homepage')

    def test_func(self):
        # Проверяем, что пользователь аутентифицирован и является администратором или суперпользователем
        return self.request.user.is_authenticated and (
            self.request.user.is_superuser or self.request.user.groups.filter(name='Administrator').exists()
        )

    def get(self, request, *args, **kwargs):
        if not self.test_func():
            return HttpResponseRedirect(f'{SITE_URL}/profile/login')
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if not self.test_func():
            return HttpResponseRedirect(f'{SITE_URL}/profile/login')
        return super().post(request, *args, **kwargs)

    def get_success_url(self):
        return reverse_lazy('user_edit', kwargs={'pk': self.object.pk})