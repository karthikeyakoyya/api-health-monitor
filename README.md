<img width="1911" height="925" alt="image" src="https://github.com/user-attachments/assets/fd60ce87-8e34-4cea-a213-a3817244cb77" /># ⚡ Real-Time API Health Monitoring System

> A production-grade observability platform that monitors live APIs in real-time, detects anomalies, and displays metrics on a live dashboard — built with Java, Kafka, Python, PostgreSQL, and React.

🔗 **Live Demo:** https://api-health-monitor-dashboard.onrender.com  
💻 **Backend API:** https://api-health-monitor-backend-wodm.onrender.com/api/endpoints/status

---

## 📸 Dashboard Preview
![Uploading image.png…]()


![API Health Monitor Dashboard](https://api-health-monitor-dashboard.onrender.com)

---

## 🏗️ System Architecture

```
┌─────────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Java Spring    │────▶│    Apache   │────▶│  Python Anomaly  │
│  Boot Pinger    │     │    Kafka    │     │    Detector      │
│  (every 10s)   │     │  (Stream)   │     │  (Consumer)      │
└─────────────────┘     └─────────────┘     └────────┬─────────┘
                                                      │
                                                      ▼
┌─────────────────┐     ┌─────────────┐     ┌──────────────────┐
│  React.js       │◀────│  FastAPI    │◀────│   PostgreSQL     │
│  Dashboard      │     │  Backend    │     │   Database       │
│  (live 5s)     │     │  (REST API) │     │   (Cloud)        │
└─────────────────┘     └─────────────┘     └──────────────────┘
```

---

## 🚀 Features

- ✅ **Real-time API monitoring** — pings 5 live APIs every 10 seconds
- ✅ **Kafka event streaming** — metrics flow through a distributed message queue
- ✅ **Anomaly detection** — automatic detection of downtime, slow responses, high latency
- ✅ **Severity alerts** — CRITICAL / HIGH / MEDIUM / LOW classification
- ✅ **Live dashboard** — React frontend updates every 5 seconds
- ✅ **Response time charts** — historical performance graphs per endpoint
- ✅ **Cloud deployed** — fully live on Render (backend + frontend + database)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| API Pinger | Java 17, Spring Boot 3.x, Maven |
| Message Queue | Apache Kafka, Zookeeper (Docker) |
| Anomaly Detector | Python 3, kafka-python |
| Backend API | Python FastAPI, Uvicorn |
| Database | PostgreSQL 16 |
| Frontend | React.js, Recharts |
| Deployment | Render (Backend + DB + Frontend) |

---

## 📁 Project Structure

```
api-health-monitor/
├── java-pinger/          # Spring Boot API pinger
│   ├── src/
│   │   └── main/java/com/apimonitor/pinger/
│   │       ├── ApiEndpoint.java
│   │       ├── ApiMetric.java
│   │       ├── ApiEndpointRepository.java
│   │       ├── ApiMetricRepository.java
│   │       ├── PingerService.java
│   │       └── PingerApplication.java
│   └── pom.xml
│
├── python-detector/      # Kafka consumer + FastAPI backend
│   ├── consumer.py       # Anomaly detection engine
│   ├── api_server.py     # REST API server
│   └── requirements.txt
│
├── dashboard/            # React frontend
│   └── src/
│       └── App.js
│
└── docker-compose.yml    # Kafka + Zookeeper setup
```

---

## ⚙️ How It Works

1. **Java Pinger** sends HTTP requests to 5 APIs every 10 seconds and publishes results to a Kafka topic `api-metrics`
2. **Python Consumer** reads from Kafka, applies anomaly detection rules, and saves metrics + anomalies to PostgreSQL
3. **FastAPI Backend** exposes REST endpoints that query PostgreSQL for live data
4. **React Dashboard** polls the backend every 5 seconds and displays real-time status, charts, and alerts

---

## 🔍 Anomaly Detection Rules

| Rule | Condition | Severity |
|------|-----------|----------|
| Downtime | HTTP status 0 (connection failed) | CRITICAL |
| Slow Response | Response time > 2000ms | HIGH |
| High Avg Latency | Average of last 5 checks > 1500ms | MEDIUM |

---

## 🌐 APIs Being Monitored

| API | URL |
|-----|-----|
| GitHub API | https://api.github.com |
| JSONPlaceholder | https://jsonplaceholder.typicode.com/posts/1 |
| httpbin GET | https://httpbin.org/get |
| Open Meteo Weather | https://api.open-meteo.com |
| CoinGecko Ping | https://api.coingecko.com/api/v3/ping |

---

## 🖥️ Running Locally

### Prerequisites
- Java 17+
- Maven 3.9+
- Python 3.10+
- Docker Desktop
- PostgreSQL 16+
- Node.js 18+

### 1. Start Kafka
```bash
docker-compose up -d
```

### 2. Setup PostgreSQL
```sql
CREATE DATABASE api_monitor;
CREATE USER monitor_user WITH PASSWORD 'monitor_pass123';
GRANT ALL PRIVILEGES ON DATABASE api_monitor TO monitor_user;
```

### 3. Start Java Pinger
```bash
cd java-pinger
mvn spring-boot:run
```

### 4. Start Python Consumer
```bash
cd python-detector
pip install -r requirements.txt
python consumer.py
```

### 5. Start FastAPI Backend
```bash
cd python-detector
uvicorn api_server:app --port 8000
```

### 6. Start React Dashboard
```bash
cd dashboard
npm install
npm start
```

Open http://localhost:3000

---

## 🌍 Deployment

| Service | Platform | URL |
|---------|----------|-----|
| React Dashboard | Render (Static) | https://api-health-monitor-dashboard.onrender.com |
| FastAPI Backend | Render (Web Service) | https://api-health-monitor-backend-wodm.onrender.com |
| PostgreSQL | Render (Database) | Render Cloud |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/endpoints/status` | Get live status of all APIs |
| GET | `/api/endpoints/{id}/history` | Get response time history |
| GET | `/api/anomalies` | Get recent anomalies |

---

## 👨‍💻 Author

**Karthikeya Koyya**  
B.Tech CSE — NIT Durgapur  
GitHub: [@karthikeyakoyya](https://github.com/karthikeyakoyya)

---

## 📄 License

MIT License — feel free to use and modify!
