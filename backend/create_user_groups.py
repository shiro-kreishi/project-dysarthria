import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')
django.setup()

from django.contrib.auth.models import Group, Permission

try:
    new_group, created = Group.objects.get_or_create(name='Doctors')

    if created:
        try:
            permissions = Permission.objects.filter(content_type__app_label='testing')
            new_group.permissions.set(permissions)
            new_group.save()
            print(f"Группа Doctor успешно создана.")
        except Exception as e:
            print(f"Ошибка при добавлении прав доступа к группе Doctor: {e}")
    else:
        print("Группа Doctor уже существует.")
except Exception as e:
    print(f"Ошибка при создании группы Doctor: {e}")

try:
    new_group, created = Group.objects.get_or_create(name='Administrators')

    if created:
        try:
            testing_permissions = Permission.objects.filter(content_type__app_label='testing')
            user_permissions = Permission.objects.filter(
                content_type__app_label='users',
                codename__in=['change_user', 'delete_user', 'view_user']
            )
            new_group.permissions.set(list(testing_permissions) + list(user_permissions))
            new_group.save()
            print(f"Группа Administrator успешно создана.")
        except Exception as e:
            print(f"Ошибка при добавлении прав доступа к группе 'Administrator': {e}")
    else:
        print("Группа Administrator уже существует.")
except Exception as e:
    print(f"Ошибка при создании группы Administrator: {e}")