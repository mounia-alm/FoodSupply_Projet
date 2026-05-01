from rest_framework.permissions import BasePermission


class IsRestaurant(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        return getattr(user, "role", None) == "restaurant"


class IsSupplier(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        return getattr(user, "role", None) == "supplier"
