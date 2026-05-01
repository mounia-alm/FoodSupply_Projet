import json
from urllib import error, request

from django.conf import settings
from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    def _fetch_product(self, product_id):
        base_url = settings.PRODUCT_SERVICE_URL.rstrip("/")
        url = f"{base_url}/{product_id}/"
        req = request.Request(url, headers={"Accept": "application/json"})
        try:
            with request.urlopen(req, timeout=5) as resp:
                payload = resp.read().decode("utf-8")
        except error.HTTPError as exc:
            if exc.code == 404:
                raise serializers.ValidationError({"product_id": "Product not found."})
            raise serializers.ValidationError({"detail": "Unable to validate product stock right now."})
        except Exception:
            raise serializers.ValidationError({"detail": "Unable to validate product stock right now."})
        try:
            return json.loads(payload)
        except json.JSONDecodeError:
            raise serializers.ValidationError({"detail": "Invalid product service response."})

    def validate(self, attrs):
        product_id = attrs.get("product_id", getattr(self.instance, "product_id", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", None))
        if product_id is None or quantity is None:
            return attrs

        product = self._fetch_product(product_id)
        available = int(product.get("quantity_available") or 0)
        if int(quantity) > available:
            raise serializers.ValidationError(
                {"quantity": f"Requested quantity ({quantity}) exceeds available stock ({available})."}
            )
        return attrs

    class Meta:
        model = Order
        fields = "__all__"
