from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os

def get_conn():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        database=os.environ.get("DB_NAME", "api_monitor"),
        user=os.environ.get("DB_USER", "monitor_user"),
        password=os.environ.get("DB_PASSWORD", "monitor_pass123")
    )

@app.get("/api/endpoints/status")
def get_status():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, url FROM api_endpoints WHERE is_active = true")
    endpoints = cursor.fetchall()
    result = []
    for ep in endpoints:
        ep_id, name, url = ep
        cursor.execute("""
            SELECT response_time, status_code, is_success, checked_at
            FROM api_metrics
            WHERE endpoint_id = %s
            ORDER BY checked_at DESC LIMIT 1
        """, (ep_id,))
        latest = cursor.fetchone()
        cursor.execute("""
            SELECT AVG(response_time) FROM api_metrics
            WHERE endpoint_id = %s AND checked_at > NOW() - INTERVAL '5 minutes'
        """, (ep_id,))
        avg = cursor.fetchone()[0]
        result.append({
            "id": ep_id,
            "name": name,
            "url": url,
            "response_time": latest[0] if latest else None,
            "status_code": latest[1] if latest else None,
            "is_up": latest[2] if latest else None,
            "last_checked": latest[3].isoformat() if latest else None,
            "avg_response_time": round(float(avg), 1) if avg else None
        })
    conn.close()
    return result

@app.get("/api/endpoints/{endpoint_id}/history")
def get_history(endpoint_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT response_time, status_code, is_success, checked_at
        FROM api_metrics
        WHERE endpoint_id = %s
        ORDER BY checked_at DESC LIMIT 50
    """, (endpoint_id,))
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "response_time": r[0],
            "status_code": r[1],
            "is_success": r[2],
            "checked_at": r[3].isoformat()
        } for r in rows
    ]

@app.get("/api/anomalies")
def get_anomalies():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT a.id, a.anomaly_type, a.severity, a.description,
               a.detected_at, e.name
        FROM anomalies a
        JOIN api_endpoints e ON a.endpoint_id = e.id
        ORDER BY a.detected_at DESC LIMIT 20
    """)
    rows = cursor.fetchall()
    conn.close()
    return [
        {
            "id": r[0],
            "type": r[1],
            "severity": r[2],
            "description": r[3],
            "detected_at": r[4].isoformat(),
            "endpoint_name": r[5]
        } for r in rows
    ]