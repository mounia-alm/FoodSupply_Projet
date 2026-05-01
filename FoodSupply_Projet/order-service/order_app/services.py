from django.conf import settings


def fetch_supplier_id_for_token(auth_header: str) -> int | None:
    import requests

    if not auth_header:
        return None
    url = f"{settings.SUPPLIER_SERVICE_URL.rstrip('/')}/api/suppliers/resolve_me/"
    try:
        r = requests.get(url, headers={"Authorization": auth_header}, timeout=10)
        if r.status_code != 200:
            return None
        data = r.json()
        return int(data["id"])
    except (requests.RequestException, ValueError, KeyError, TypeError):
        return None


def publish_order_created(order):
    import json

    import pika
    from django.conf import settings as dj_settings

    payload = {
        "order_id": order.id,
        "supplier_name": order.supplier_name,
        "contact_name": order.contact_name,
        "total_amount": str(order.total_amount),
        "restaurant_phone": order.restaurant_phone,
    }
    try:
        params = pika.ConnectionParameters(host=dj_settings.RABBITMQ_HOST)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue="order_notifications", durable=True)
        channel.basic_publish(
            exchange="",
            routing_key="order_notifications",
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=pika.spec.PERSISTENT_DELIVERY_MODE),
        )
        connection.close()
    except Exception:
        # Broker might be offline during local dev — order stays valid.
        pass
