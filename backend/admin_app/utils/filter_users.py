import re
from django.db.models import Q
from users.models.users import User

MONTHS_RU_TO_NUM = {
    'январ': 1, 'феврал': 2, 'март': 3, 'апрел': 4, 'ма': 5, 'июн': 6,
    'июл': 7, 'август': 8, 'сентябр': 9, 'октябр': 10, 'ноябр': 11, 'декабр': 12
}

def normalize_month_name(month_name) -> str:
    month_name = month_name.lower().strip()
    for month in MONTHS_RU_TO_NUM.keys():
        if month_name.startswith(month):
            return month
    return ''

def filter_users(queryset=None, search_query=None):
    if search_query:
        search_terms = search_query.split()

        filters = Q()
        month = None
        day = None
        year = None

        for term in search_terms:
            normalized_month = normalize_month_name(term)
            if normalized_month:
                month = MONTHS_RU_TO_NUM[normalized_month]

            if re.match(r'^\d{1,2}$', term):
                day = int(term)

            if re.match(r'^\d{4}$', term):
                year = int(term)

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

    return queryset
