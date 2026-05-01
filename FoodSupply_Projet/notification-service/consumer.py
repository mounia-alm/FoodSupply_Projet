import pika
import json

def callback(ch, method, properties, body):
    data = json.loads(body)
    print(f"\n📨 [NOUVELLE COMMANDE RECUE]")
    print(f"   ID Commande: {data.get('order_id')}")
    print(f"   Client: {data.get('customer_name')}")
    print(f"   Restaurant: {data.get('supplier_name')}")
    print(f"   Montant: {data.get('total_amount')} DA")
    print("-" * 50)

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='order_notifications', durable=True)

print("🟢 Service de notifications démarré...")
print("📡 En attente de nouvelles commandes...")

channel.basic_consume(queue='order_notifications', on_message_callback=callback, auto_ack=True)

try:
    channel.start_consuming()
except KeyboardInterrupt:
    print("\n🔴 Service arrêté")
    connection.close()