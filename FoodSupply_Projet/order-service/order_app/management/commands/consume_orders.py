import json

import pika
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Consumes asynchronous order_notification messages from RabbitMQ (demo worker)."

    def handle(self, *args, **options):
        params = pika.ConnectionParameters(host=settings.RABBITMQ_HOST)
        connection = pika.BlockingConnection(params)
        channel = connection.channel()
        channel.queue_declare(queue="order_notifications", durable=True)
        self.stdout.write(self.style.SUCCESS("Waiting for messages on order_notifications…"))

        def callback(ch, method, properties, body):
            try:
                payload = json.loads(body)
                self.stdout.write(self.style.NOTICE(json.dumps(payload)))
            except json.JSONDecodeError:
                self.stdout.write(self.style.WARNING(body.decode(errors="replace")))
            ch.basic_ack(delivery_tag=method.delivery_tag)

        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue="order_notifications", on_message_callback=callback)
        channel.start_consuming()
