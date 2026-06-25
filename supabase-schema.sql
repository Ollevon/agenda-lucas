-- Execute este SQL no painel do Supabase:
-- Dashboard → SQL Editor → New Query → cola e clica em RUN

CREATE TABLE IF NOT EXISTS agenda (
  user_id   TEXT PRIMARY KEY DEFAULT 'default',
  items     JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insere a linha inicial (vazia) para o usuário padrão
INSERT INTO agenda (user_id, items)
VALUES ('default', '[]')
ON CONFLICT (user_id) DO NOTHING;
