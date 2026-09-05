-- AJ Import: каталог автомобилей из Encar (Корея) и Che168 (Китай)

CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('encar', 'che168')),
  source_id TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  year INT NOT NULL,
  mileage_km INT,
  fuel_type TEXT,
  transmission TEXT,
  engine_volume NUMERIC(3,1),
  power_hp INT,
  color TEXT,
  price_origin NUMERIC(12,2) NOT NULL,   -- цена в валюте источника (KRW / CNY)
  currency TEXT NOT NULL,                 -- KRW / CNY
  price_rub NUMERIC(12,0),                -- пересчитанная цена под ключ в РФ (заполняется калькулятором)
  photos JSONB DEFAULT '[]',
  url TEXT NOT NULL,
  raw JSONB,                              -- сырой ответ источника на всякий случай
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,      -- вручную закреплено в "Лучшие предложения"
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (source, source_id)
);

CREATE INDEX IF NOT EXISTS idx_cars_brand_model ON cars (brand, model);
CREATE INDEX IF NOT EXISTS idx_cars_year ON cars (year);
CREATE INDEX IF NOT EXISTS idx_cars_price ON cars (price_rub);
CREATE INDEX IF NOT EXISTS idx_cars_source ON cars (source);
CREATE INDEX IF NOT EXISTS idx_cars_active ON cars (is_active);

CREATE TABLE IF NOT EXISTS leads (
  id SERIAL PRIMARY KEY,
  car_id INT REFERENCES cars(id) ON DELETE SET NULL,
  name TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fx_rates (
  currency TEXT PRIMARY KEY,
  rub_rate NUMERIC(10,4) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
