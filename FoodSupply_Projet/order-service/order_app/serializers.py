from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from .models import BulkOrder, BulkOrderItem


class BulkOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrderItem
        fields = ("id", "product_id", "product_name", "product_price", "quantity", "subtotal")
        read_only_fields = ("id", "subtotal")


class BulkOrderItemWriteSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField(max_length=255)
    product_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField(min_value=1)


class BulkOrderSerializer(serializers.ModelSerializer):
    items = BulkOrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = BulkOrder
        fields = (
            "id",
            "restaurant_user_id",
            "supplier_id",
            "supplier_name",
            "status",
            "total_amount",
            "restaurant_phone",
            "contact_name",
            "restaurant_address",
            "created_at",
            "items",
        )
        read_only_fields = ("id", "restaurant_user_id", "status", "total_amount", "created_at")


class BulkOrderCreateSerializer(serializers.Serializer):
    supplier_id = serializers.IntegerField()
    supplier_name = serializers.CharField(max_length=255)
    restaurant_phone = serializers.CharField(max_length=40)
    contact_name = serializers.CharField(max_length=255)
    restaurant_address = serializers.CharField()
    items = BulkOrderItemWriteSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("At least one line item is required.")
        return value

    def create(self, validated_data):
        user = self.context["request"].user
        items_data = validated_data.pop("items")

        total = Decimal("0")
        rows = []
        for row in items_data:
            price = row["product_price"]
            qty = row["quantity"]
            subtotal = price * qty
            total += subtotal
            rows.append(
                {
                    "product_id": row["product_id"],
                    "product_name": row["product_name"],
                    "product_price": price,
                    "quantity": qty,
                    "subtotal": subtotal,
                }
            )

        with transaction.atomic():
            order = BulkOrder.objects.create(
                restaurant_user_id=user.id,
                supplier_id=validated_data["supplier_id"],
                supplier_name=validated_data["supplier_name"],
                restaurant_phone=validated_data["restaurant_phone"],
                contact_name=validated_data["contact_name"],
                restaurant_address=validated_data["restaurant_address"],
                total_amount=total,
            )
            for r in rows:
                BulkOrderItem.objects.create(order=order, **r)

        return order


class BulkOrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = BulkOrder
        fields = ("status",)

    def validate_status(self, value):
        allowed = {c[0] for c in BulkOrder.STATUS_CHOICES}
        if value not in allowed:
            raise serializers.ValidationError("Invalid status.")
        return value
