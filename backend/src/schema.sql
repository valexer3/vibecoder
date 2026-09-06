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

-- Расширенные поля из detail-ответа Encar (без контактов продавца/дилера -
-- они намеренно не собираются, см. parsers/encar.js). ALTER TABLE ... ADD
-- COLUMN IF NOT EXISTS - безопасно применять повторно, существующие строки
-- получат NULL в новых колонках и не потеряются.
ALTER TABLE cars ADD COLUMN IF NOT EXISTS vin TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS body_type TEXT;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS accident_info JSONB;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS seizing_info JSONB;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS warranty_info JSONB;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS origin_price NUMERIC(12,2);
ALTER TABLE cars ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]';
ALTER TABLE cars ADD COLUMN IF NOT EXISTS registered_at TIMESTAMPTZ;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS encar_verified JSONB;
-- Официальный отчёт техосмотра Encar (/v1/readside/inspection/vehicle/{id}) -
-- пробег по одометру, состояние VIN-таблички, выбросы, тюнинг, спецотметки,
-- смена назначения, отзыв, конкретные заменённые/повреждённые панели кузова.
-- НЕ страховая история (см. аудит) - это собственная диагностика Encar.
ALTER TABLE cars ADD COLUMN IF NOT EXISTS inspection_report JSONB;
ALTER TABLE cars ADD COLUMN IF NOT EXISTS inspection_report_url TEXT;
-- Город продажи из карточки списка Che168 (см. parsers/che168.js) - один
-- из немногих полезных фасетов, доступных для этого источника без похода
-- на detail-страницу (которая эскалирует в капчу - см. шапку che168.js).
ALTER TABLE cars ADD COLUMN IF NOT EXISTS city TEXT;

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

-- Курсор пагинации sync.js: с какой страницы продолжать при следующем
-- запуске, если предыдущий проход прервался из-за серии сбоев API (см.
-- parsers/encar.js). При штатном завершении прохода строка удаляется -
-- следующий цикл снова начинает со страницы 0 (свежие объявления).
CREATE TABLE IF NOT EXISTS sync_progress (
  source TEXT PRIMARY KEY,
  next_page INT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
