from django.db import models


class Profile(models.Model):
    ROLE_CHOICES = (("restaurant", "Restaurant"), ("supplier", "Supplier"))
    account_id = models.PositiveIntegerField(unique=True)
    national_id = models.CharField(max_length=64)
    full_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=30)
    address = models.TextField()
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
