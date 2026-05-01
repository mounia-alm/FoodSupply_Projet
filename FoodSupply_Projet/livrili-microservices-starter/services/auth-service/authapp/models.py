from django.contrib.auth.models import AbstractUser
from django.db import models


class Account(AbstractUser):
    ROLE_CHOICES = (("restaurant", "Restaurant"), ("supplier", "Supplier"))
    national_id = models.CharField(max_length=64, blank=True, default="")
    full_name = models.CharField(max_length=200, blank=True, default="")
    phone_number = models.CharField(max_length=30, blank=True, default="")
    address = models.TextField(blank=True, default="")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="restaurant")
