from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from supplier_project.jwt_auth import JWTAuthentication
from supplier_project.permissions import IsSupplier

from .models import Category, Product, Supplier
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    ProductWriteSerializer,
    SupplierSerializer,
)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy", "resolve_me"):
            return [permissions.IsAuthenticated(), IsSupplier()]
        return [permissions.AllowAny()]

    def get_authenticators(self):
        if self.action in ("create", "update", "partial_update", "destroy", "resolve_me"):
            return [JWTAuthentication()]
        return super().get_authenticators()

    def perform_create(self, serializer):
        serializer.save(user_id=self.request.user.id)

    def perform_update(self, serializer):
        if serializer.instance.user_id != self.request.user.id:
            raise permissions.PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user_id != self.request.user.id:
            raise permissions.PermissionDenied()
        instance.delete()

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.IsAuthenticated, IsSupplier],
        authentication_classes=[JWTAuthentication],
    )
    def resolve_me(self, request):
        supplier = get_object_or_404(Supplier, user_id=request.user.id)
        return Response(SupplierSerializer(supplier).data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("supplier").all()

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return ProductWriteSerializer
        return ProductSerializer

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [permissions.IsAuthenticated(), IsSupplier()]
        return [permissions.AllowAny()]

    def get_authenticators(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [JWTAuthentication()]
        return super().get_authenticators()

    def get_queryset(self):
        qs = super().get_queryset().order_by("supplier_id", "name")
        supplier_only = self.request.query_params.get("mine")
        user = getattr(self.request, "user", None)
        if supplier_only == "1" and getattr(user, "is_authenticated", False):
            return qs.filter(supplier__user_id=user.id)
        return qs

    def perform_create(self, serializer):
        supplier = get_object_or_404(Supplier, user_id=self.request.user.id)
        serializer.save(supplier=supplier)

    def perform_update(self, serializer):
        if serializer.instance.supplier.user_id != self.request.user.id:
            raise permissions.PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if instance.supplier.user_id != self.request.user.id:
            raise permissions.PermissionDenied()
        instance.delete()
