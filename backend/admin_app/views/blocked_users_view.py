import re
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Q
from django.http import HttpResponseRedirect
from django.views.generic import ListView
from django.shortcuts import redirect

from admin_app.utils.filter_users import filter_users
from users.models.users import User
from admin_app.utils.access_rights import AccessUtils
from project.settings import SITE_URL

MONTHS_RU_TO_NUM = {
    'январ': 1, 'феврал': 2, 'март': 3, 'апрел': 4, 'ма': 5, 'июн': 6,
    'июл': 7, 'август': 8, 'сентябр': 9, 'октябр': 10, 'ноябр': 11, 'декабр': 12
}

def normalize_month_name(month_name):
    # Преобразуем в нижний регистр и убираем окончания
    month_name = month_name.lower().strip()
    # Обрабатываем окончания
    for month in MONTHS_RU_TO_NUM.keys():
        if month_name.startswith(month):
            return month
    return None

class BlockedUsersView(ListView):
    model = User
    template_name = 'admin_app/blocked_users_page.html'
    context_object_name = 'users'
    paginate_by = 10

    def get_queryset(self):
        queryset = User.objects.filter(is_active=False, email_confirmed=True).order_by('-date_joined')
        search_query = self.request.GET.get('search', '')
        return filter_users(queryset, search_query)  # Используем функцию фильтрации

    def get(self, request, *args, **kwargs):
        # Обязательно использовать во всех шаблонах!!!!!
        if not AccessUtils.user_has_access(request.user):
            return HttpResponseRedirect(f'{SITE_URL}/profile/login')

        self.object_list = self.get_queryset()
        context = self.get_context_data()

        # Добавление контекста
        context['current_user'] = request.user
        context['SITE_URL'] = SITE_URL

        # Ответ
        return self.render_to_response(context)
