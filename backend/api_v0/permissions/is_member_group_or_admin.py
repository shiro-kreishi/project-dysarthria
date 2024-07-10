from rest_framework import permissions


class IsMemberOfGroupOrAdmin(permissions.BasePermission):
    """
    Пользователь должен быть членом определенной группы или администратором.
    """
    group_name = ''

    def has_permission(self, request, view):
        group_name = self.group_name
        is_group_member = request.user.groups.filter(name=group_name).exists()
        is_admin = request.user.is_superuser and request.user.is_staff
        return is_group_member or is_admin
