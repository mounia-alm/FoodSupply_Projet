from django.db import models


class Product(models.Model):
    supplier_id = models.PositiveIntegerField()
    supplier_name = models.CharField(max_length=200)
    image_url = models.URLField(blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    quantity_available = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_time = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
