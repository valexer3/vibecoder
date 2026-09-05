import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function upsertCar(car) {
  const q = `
    INSERT INTO cars (
      source, source_id, brand, model, trim, year, mileage_km, fuel_type,
      transmission, engine_volume, power_hp, color, price_origin, currency,
      price_rub, photos, url, raw, last_seen_at, is_active,
      vin, body_type, accident_info, seizing_info, warranty_info,
      origin_price, options, registered_at, encar_verified
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18, now(), true,
      $19,$20,$21,$22,$23,$24,$25,$26,$27
    )
    ON CONFLICT (source, source_id) DO UPDATE SET
      brand = EXCLUDED.brand,
      model = EXCLUDED.model,
      trim = EXCLUDED.trim,
      year = EXCLUDED.year,
      mileage_km = EXCLUDED.mileage_km,
      fuel_type = EXCLUDED.fuel_type,
      transmission = EXCLUDED.transmission,
      engine_volume = EXCLUDED.engine_volume,
      power_hp = EXCLUDED.power_hp,
      color = EXCLUDED.color,
      price_origin = EXCLUDED.price_origin,
      currency = EXCLUDED.currency,
      price_rub = EXCLUDED.price_rub,
      photos = EXCLUDED.photos,
      url = EXCLUDED.url,
      raw = EXCLUDED.raw,
      last_seen_at = now(),
      is_active = true,
      vin = EXCLUDED.vin,
      body_type = EXCLUDED.body_type,
      accident_info = EXCLUDED.accident_info,
      seizing_info = EXCLUDED.seizing_info,
      warranty_info = EXCLUDED.warranty_info,
      origin_price = EXCLUDED.origin_price,
      options = EXCLUDED.options,
      registered_at = EXCLUDED.registered_at,
      encar_verified = EXCLUDED.encar_verified
    RETURNING id;
  `;
  const vals = [
    car.source, car.source_id, car.brand, car.model, car.trim ?? null,
    car.year, car.mileage_km ?? null, car.fuel_type ?? null,
    car.transmission ?? null, car.engine_volume ?? null, car.power_hp ?? null,
    car.color ?? null, car.price_origin, car.currency, car.price_rub ?? null,
    JSON.stringify(car.photos ?? []), car.url, JSON.stringify(car.raw ?? {}),
    car.vin ?? null, car.body_type ?? null,
    car.accident_info ? JSON.stringify(car.accident_info) : null,
    car.seizing_info ? JSON.stringify(car.seizing_info) : null,
    car.warranty_info ? JSON.stringify(car.warranty_info) : null,
    car.origin_price ?? null,
    JSON.stringify(car.options ?? []),
    car.registered_at ?? null,
    car.encar_verified ? JSON.stringify(car.encar_verified) : null,
  ];
  const { rows } = await pool.query(q, vals);
  return rows[0].id;
}

export async function getFxRate(currency) {
  const { rows } = await pool.query(
    'SELECT rub_rate FROM fx_rates WHERE currency = $1',
    [currency]
  );
  return rows[0] ? Number(rows[0].rub_rate) : null;
}

export async function markStaleInactive(source, seenSourceIds) {
  if (seenSourceIds.length === 0) return;
  await pool.query(
    `UPDATE cars SET is_active = false
     WHERE source = $1 AND source_id <> ALL($2::text[])`,
    [source, seenSourceIds]
  );
}

export async function getSyncProgress(source) {
  const { rows } = await pool.query(
    'SELECT next_page FROM sync_progress WHERE source = $1',
    [source]
  );
  return rows[0] ? rows[0].next_page : 0;
}

export async function setSyncProgress(source, nextPage) {
  await pool.query(
    `INSERT INTO sync_progress (source, next_page, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (source) DO UPDATE SET next_page = $2, updated_at = now()`,
    [source, nextPage]
  );
}

export async function clearSyncProgress(source) {
  await pool.query('DELETE FROM sync_progress WHERE source = $1', [source]);
}
