import re

from django.db.models import Q
from django.http import HttpResponseRedirect
from django.views.generic import ListView
from django.shortcuts import redirect
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

class BaseAdminView(ListView):
    model = User
    template_name = 'admin_app/admin_homepage_page.html'
    context_object_name = 'users'
    paginate_by = 10

    def get_queryset(self):
        queryset = User.objects.all().order_by('-date_joined')

        search_query = self.request.GET.get('search', '')
        if search_query:
            # Разделение поискового запроса на части
            search_terms = search_query.split()

            # Начальное фильтрование по тексту
            filters = Q()
            month = None
            day = None
            year = None

            for term in search_terms:
                # Нормализация и проверка
                normalized_month = normalize_month_name(term)
                if normalized_month:
                    month = MONTHS_RU_TO_NUM[normalized_month]

                # Проверка на день
                if re.match(r'^\d{1,2}$', term):
                    day = int(term)

                # Проверка на год
                if re.match(r'^\d{4}$', term):
                    year = int(term)

            # Фильтрация
            if year:
                if month and day:
                    filters |= Q(date_joined__year=year, date_joined__month=month, date_joined__day=day)
                elif day:
                    filters |= Q(date_joined__day=day, date_joined__year=year)
                elif month:
                    filters |= Q(date_joined__month=month, date_joined__year=year)
                else:
                    filters |= Q(date_joined__year=year)
            elif month:
                if day:
                    filters |= Q(date_joined__month=month, date_joined__day=day)
                else:
                    filters |= Q(date_joined__month=month)
            elif day:
                filters |= Q(date_joined__day=day)

            filters |= Q(first_name__icontains=search_query) | \
                       Q(last_name__icontains=search_query) | \
                       Q(patronymic__icontains=search_query) | \
                       Q(email__icontains=search_query)

            queryset = queryset.filter(filters)
        # Отправка данных
        return queryset


def get(self, request, *args, **kwargs):
        # Обязательно использовать во всех шаблонах!!!!!
        if not AccessUtils.user_has_access(request.user):
            return HttpResponseRedirect(f'{SITE_URL}/profile/login')

        self.object_list = self.get_queryset()
        context = self.get_context_data()

        # Добавление контекста
        context['current_user'] = request.user

        # Ответ
        return self.render_to_response(context)