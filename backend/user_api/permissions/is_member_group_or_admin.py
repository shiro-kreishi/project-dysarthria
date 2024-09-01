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


class IsMemberOfGroupsOrAdmin(permissions.BasePermission):
    """
    Пользователь должен быть членом одной из определенных групп или администратором.
    """
    group_names = []

    def has_permission(self, request, view):
        group_names = self.group_names
        is_group_member = any(request.user.groups.filter(name=group_name).exists() for group_name in group_names)
        is_admin = request.user.is_superuser and request.user.is_staff
        return is_group_member or is_admin


class CheckUserInGroupsOrAdmin:
    group_names = []
    def __init__(self, request):
        self.request = request

    def check(self):
        user = self.request.user
        is_group_member = any(user.groups.filter(name=group_name).exists() for group_name in self.group_names)
        is_admin = user.is_superuser and user.is_staff
        return is_group_member or is_admin

class IsSuperUserOrDoctorOrAdminPermission(IsMemberOfGroupsOrAdmin):
    group_names = ['Doctors', 'Administrators']

class IsSuperUserOrAdminPermission(IsMemberOfGroupsOrAdmin):
    group_names = ['Administrators']