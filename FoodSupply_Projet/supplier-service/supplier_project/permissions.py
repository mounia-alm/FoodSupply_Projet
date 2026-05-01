from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsSupplier(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        if not getattr(user, "is_authenticated", False):
            return False
        return getattr(user, "role", None) == "supplier"


class ReadOnlyOrRestaurantCatalog(BasePermission):
    """Allow anyone for safe methods on catalog-style reads."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return getattr(request.user, "is_authenticated", False)


class IsSupplierOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        supplier = getattr(obj, "supplier", obj)
        uid = getattr(request.user, "id", None)
        return getattr(supplier, "user_id", None) == uid
