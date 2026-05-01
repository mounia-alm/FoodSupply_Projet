import json
import os
import time

import pika


def connect(host):
    while True:
        try:
            return pika.BlockingConnection(pika.ConnectionParameters(host=host))
        except Exception:
            time.sleep(2)


def main():
    host = os.environ.get("RABBITMQ_HOST", "rabbitmq")
    connection = connect(host)
    channel = connection.channel()
    channel.queue_declare(queue="order_notifications", durable=True)
    print("notification-worker listening on order_notifications")

    def callback(ch, method, properties, body):
        payload = json.loads(body.decode())
        print(f"[worker] {payload}")
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(queue="order_notifications", on_message_callback=callback)
    channel.start_consuming()


if __name__ == "__main__":
    main()
