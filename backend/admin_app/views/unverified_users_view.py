from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.views.generic import ListView

from admin_app.utils.filter_users import filter_users  # Импортируем функцию фильтрации
from users.models.users import User
from admin_app.utils.access_rights import AccessUtils
from project.settings import SITE_URL

class UnverifiedUsersView(LoginRequiredMixin, ListView):
    model = User
    template_name = 'admin_app/unverified_users_page.html'
    context_object_name = 'users'
    paginate_by = 10

    def get_queryset(self):
        # Фильтруем пользователей по состоянию подтверждения почты и активности
        queryset = User.objects.filter(email_confirmed=False).order_by('-date_joined')
        search_query = self.request.GET.get('search', '')
        return filter_users(queryset, search_query)  # Используем функцию фильтрации

    def get(self, request, *args, **kwargs):
        if not AccessUtils.user_has_access(request.user):
            return HttpResponseRedirect(f'{SITE_URL}/profile/login')

        self.object_list = self.get_queryset()
        context = self.get_context_data()

        context['current_user'] = request.user
        context['SITE_URL'] = SITE_URL

        return self.render_to_response(context)
