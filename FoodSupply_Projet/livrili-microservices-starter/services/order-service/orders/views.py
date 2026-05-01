import json
import pika
from django.conf import settings
from rest_framework import viewsets
from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-id")
    serializer_class = OrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        restaurant_id = self.request.query_params.get("restaurant_id")
        supplier_id = self.request.query_params.get("supplier_id")
        if restaurant_id:
            qs = qs.filter(restaurant_id=restaurant_id)
        if supplier_id:
            qs = qs.filter(supplier_id=supplier_id)
        return qs

    def perform_create(self, serializer):
        order = serializer.save()
        self._publish({"event": "order.created", "order_id": order.id, "status": order.status})

    def perform_update(self, serializer):
        order = serializer.save()
        self._publish({"event": f"order.{order.status}", "order_id": order.id, "status": order.status})

    def _publish(self, payload):
        try:
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=settings.RABBITMQ_HOST))
            channel = connection.channel()
            channel.queue_declare(queue="order_notifications", durable=True)
            channel.basic_publish(exchange="", routing_key="order_notifications", body=json.dumps(payload))
            connection.close()
        except Exception:
            pass
