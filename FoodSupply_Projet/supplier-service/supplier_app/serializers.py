from rest_framework import serializers

from .models import Category, Product, Supplier


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ("id", "user_id", "company_name", "phone", "address", "is_approved", "created_at")
        read_only_fields = ("id", "created_at")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    supplier_name = serializers.CharField(source="supplier.company_name", read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "supplier",
            "supplier_name",
            "category",
            "name",
            "description",
            "unit",
            "price_per_unit",
            "stock",
            "image",
            "is_available",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class ProductWriteSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Product
        fields = (
            "category",
            "name",
            "description",
            "unit",
            "price_per_unit",
            "stock",
            "image",
            "is_available",
        )
