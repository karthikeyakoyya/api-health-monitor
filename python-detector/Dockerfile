FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# Default command runs the FastAPI backend (port 8000).
# The Kafka consumer role overrides this with: python consumer.py
EXPOSE 8000 8001
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]
