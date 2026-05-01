from django.contrib import admin
from .models import Supplier, Category, Product

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ("id", "user_id", "company_name", "phone", "is_approved")
    list_filter = ("is_approved",)
    search_fields = ("company_name",)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'supplier', 'category', 'price_per_unit', 'unit', 'stock', 'is_available')
    list_filter = ('is_available', 'supplier', 'category')
    search_fields = ('name', 'supplier__company_name')