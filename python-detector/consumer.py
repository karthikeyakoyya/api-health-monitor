import json
import psycopg2
from kafka import KafkaConsumer
from datetime import datetime

# Database connection
conn = psycopg2.connect(
    host="localhost",
    database="api_monitor",
    user="monitor_user",
    password="monitor_pass123"
)
cursor = conn.cursor()

# Kafka consumer
consumer = KafkaConsumer(
    'api-metrics',
    bootstrap_servers=['localhost:9092'],
    auto_offset_reset='latest',
    group_id='anomaly-detector'
)

print("Python detector started — listening for messages...")

# Track recent response times per endpoint for anomaly detection
history = {}

def detect_anomaly(endpoint_id, endpoint_name, response_time, status_code, is_success):
    anomalies = []

    # Track history
    if endpoint_id not in history:
        history[endpoint_id] = []
    history[endpoint_id].append(response_time)
    if len(history[endpoint_id]) > 10:
        history[endpoint_id].pop(0)

    # Rule 1: Slow response (>2000ms)
    if response_time > 2000:
        anomalies.append({
            'type': 'SLOW_RESPONSE',
            'severity': 'HIGH',
            'description': f'{endpoint_name} responded in {response_time}ms (threshold: 2000ms)',
            'metric_value': response_time,
            'threshold_value': 2000
        })

    # Rule 2: Downtime (status 0 = connection failed)
    if not is_success:
        anomalies.append({
            'type': 'DOWNTIME',
            'severity': 'CRITICAL',
            'description': f'{endpoint_name} is down (HTTP {status_code})',
            'metric_value': status_code,
            'threshold_value': 0
        })

    # Rule 3: High error rate in last 5 checks
    if len(history[endpoint_id]) >= 5:
        recent = history[endpoint_id][-5:]
        avg = sum(recent) / len(recent)
        if avg > 1500:
            anomalies.append({
                'type': 'HIGH_RESPONSE_TIME',
                'severity': 'MEDIUM',
                'description': f'{endpoint_name} avg response {avg:.0f}ms over last 5 checks',
                'metric_value': avg,
                'threshold_value': 1500
            })

    return anomalies

for message in consumer:
    try:
        data = message.value.decode('utf-8')
        parts = data.split('|')
        endpoint_id = int(parts[0])
        endpoint_name = parts[1]
        response_time = int(parts[2])
        status_code = int(parts[3])
        is_success = parts[4].strip() == 'true'

        print(f"Received: {endpoint_name} | {response_time}ms | HTTP {status_code}")

        # Save metric to DB
        cursor.execute("""
            INSERT INTO api_metrics (endpoint_id, response_time, status_code, is_success, checked_at)
            VALUES (%s, %s, %s, %s, %s)
        """, (endpoint_id, response_time, status_code, is_success, datetime.now()))
        conn.commit()

        # Detect anomalies
        anomalies = detect_anomaly(endpoint_id, endpoint_name, response_time, status_code, is_success)
        for anomaly in anomalies:
            cursor.execute("""
                INSERT INTO anomalies (endpoint_id, anomaly_type, severity, description, metric_value, threshold_value)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (endpoint_id, anomaly['type'], anomaly['severity'],
                  anomaly['description'], anomaly['metric_value'], anomaly['threshold_value']))
            conn.commit()
            print(f"ANOMALY DETECTED: {anomaly['severity']} - {anomaly['description']}")

    except Exception as e:
        print(f"Error processing message: {e}")