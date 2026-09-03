CREATE TABLE IF NOT EXISTS api_endpoints (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS api_metrics (
    id SERIAL PRIMARY KEY,
    endpoint_id INTEGER NOT NULL REFERENCES api_endpoints(id),
    response_time INTEGER,
    status_code INTEGER,
    is_success BOOLEAN,
    error_message TEXT,
    checked_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS anomalies (
    id SERIAL PRIMARY KEY,
    endpoint_id INTEGER NOT NULL REFERENCES api_endpoints(id),
    anomaly_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    description TEXT,
    metric_value NUMERIC,
    threshold_value NUMERIC,
    detected_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_metrics_endpoint_checked ON api_metrics (endpoint_id, checked_at DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_detected ON anomalies (detected_at DESC);

INSERT INTO api_endpoints (name, url, is_active) VALUES
    ('GitHub API',         'https://api.github.com',                      true),
    ('JSONPlaceholder',    'https://jsonplaceholder.typicode.com/posts/1', true),
    ('httpbin GET',        'https://httpbin.org/get',                     true),
    ('Open Meteo Weather', 'https://api.open-meteo.com',                  true),
    ('CoinGecko Ping',     'https://api.coingecko.com/api/v3/ping',       true);
