from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from order_project.jwt_auth import JWTAuthentication
from order_project.permissions import IsRestaurant, IsSupplier

from .models import BulkOrder
from .serializers import (
    BulkOrderCreateSerializer,
    BulkOrderSerializer,
    BulkOrderStatusSerializer,
)
from .services import fetch_supplier_id_for_token, publish_order_created


class BulkOrderViewSet(viewsets.ModelViewSet):
    queryset = BulkOrder.objects.prefetch_related("items").all()
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return BulkOrderCreateSerializer
        if self.action == "partial_update":
            return BulkOrderStatusSerializer
        return BulkOrderSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.IsAuthenticated(), IsRestaurant()]
        if self.action == "partial_update":
            return [permissions.IsAuthenticated(), IsSupplier()]
        return [permissions.IsAuthenticated()]

    def get_authenticators(self):
        return [JWTAuthentication()]

    def get_queryset(self):
        qs = super().get_queryset().order_by("-created_at")
        user = self.request.user
        role = getattr(user, "role", None)
        if role == "restaurant":
            return qs.filter(restaurant_user_id=user.id)
        if role == "supplier":
            pk = fetch_supplier_id_for_token(self.request.META.get("HTTP_AUTHORIZATION", ""))
            if pk is None:
                return qs.none()
            return qs.filter(supplier_id=pk)
        return qs.none()

    def create(self, request, *args, **kwargs):
        serializer = BulkOrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        publish_order_created(order)
        output = BulkOrderSerializer(order)
        return Response(output.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        order = self.get_object()
        supplier_pk = fetch_supplier_id_for_token(request.META.get("HTTP_AUTHORIZATION", ""))
        if supplier_pk is None or order.supplier_id != supplier_pk:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        order.refresh_from_db()
        order = BulkOrder.objects.prefetch_related("items").get(pk=order.pk)
        return Response(BulkOrderSerializer(order).data)
