from django.contrib.auth.mixins import UserPassesTestMixin, LoginRequiredMixin
from django.http import HttpResponseRedirect
from django.urls import reverse_lazy
from django.views.generic import UpdateView

from admin_app.utils.access_rights import AccessUtils
from project.settings import SITE_URL
from users.models.users import User

class UserUpdateView(UpdateView):
    model = User
    template_name = 'admin_app/user_edit_page.html'
    fields = ['first_name', 'last_name', 'email', 'patronymic', 'date_joined']
    context_object_name = 'user'
    success_url = reverse_lazy('admin_homepage')

    def test_func(self):
        return AccessUtils.user_has_access(self.request.user)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['current_user_id'] = self.request.user.id
        return context

    def get(self, request, *args, **kwargs):
        if not AccessUtils.user_has_access(request.user):
            return HttpResponseRedirect(f'{SITE_URL}/profile/login')
        return super().get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        if not AccessUtils.user_has_access(request.user):
            return HttpResponseRedirect(f'{SITE_URL}/profile/login')
        return super().post(request, *args, **kwargs)

    def get_success_url(self):
        return reverse_lazy('user_edit', kwargs={'pk': self.object.pk})