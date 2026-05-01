from django.db import models


class Order(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("preparing", "Preparing"),
        ("shipped", "Shipped"),
        ("delivered", "Delivered"),
    )
    restaurant_id = models.PositiveIntegerField()
    restaurant_name = models.CharField(max_length=200)
    manager_name = models.CharField(max_length=200)
    restaurant_address = models.TextField()
    phone = models.CharField(max_length=30)
    supplier_id = models.PositiveIntegerField()
    supplier_name = models.CharField(max_length=200)
    product_id = models.PositiveIntegerField()
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField()
    additional_details = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
