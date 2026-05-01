from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("auth_app", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="role",
            field=models.CharField(
                choices=[
                    ("restaurant", "Restaurant"),
                    ("supplier", "Supplier"),
                    ("admin", "Admin"),
                ],
                default="restaurant",
                max_length=20,
            ),
        ),
    ]
