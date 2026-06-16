-- BDV Monitor - PostgreSQL Schema
-- Ejecutar en cPanel → phpPgAdmin o en psql

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    monto TEXT NOT NULL,
    usd NUMERIC(12,2),
    referencia TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    package_name TEXT,
    raw_text TEXT,
    received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_monto ON notifications(monto);
CREATE INDEX IF NOT EXISTS idx_search_ref ON notifications(referencia);
