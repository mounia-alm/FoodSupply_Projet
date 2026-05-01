import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Category",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("description", models.TextField(blank=True)),
            ],
        ),
        migrations.CreateModel(
            name="Supplier",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("user_id", models.PositiveIntegerField(unique=True)),
                ("company_name", models.CharField(max_length=200)),
                ("phone", models.CharField(max_length=20)),
                ("address", models.TextField()),
                ("is_approved", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name="Product",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("description", models.TextField(blank=True)),
                (
                    "unit",
                    models.CharField(
                        choices=[
                            ("kg", "kg"),
                            ("g", "g"),
                            ("l", "l"),
                            ("ml", "ml"),
                            ("piece", "piece"),
                            ("carton", "carton"),
                        ],
                        default="kg",
                        max_length=20,
                    ),
                ),
                ("price_per_unit", models.DecimalField(decimal_places=2, max_digits=10)),
                ("stock", models.IntegerField(default=0)),
                ("image", models.ImageField(blank=True, null=True, upload_to="products/")),
                ("is_available", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("category", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="supplier_app.category")),
                ("supplier", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="products", to="supplier_app.supplier")),
            ],
        ),
    ]
