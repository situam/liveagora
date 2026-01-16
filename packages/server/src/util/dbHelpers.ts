import { getDb } from '../auth/db.ts';

export interface WithId {
  id: string;
}

// Generic query helpers
export async function getRowById<T extends WithId>(
  table: string,
  id: string
): Promise<T | null> {
  const db = getDb();
  const row = await db.get<T>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  return row ?? null;
}

export async function getRowsByIdPrefix<T extends WithId>(
  table: string,
  prefix: string,
): Promise<T[]> {
  const db = getDb();
  return db.all<T[]>(`SELECT * FROM ${table} WHERE id LIKE ? ORDER BY id`, [`${prefix}%`]);
}

export async function getRows<T>(
  table: string,
  orderBy: string | null = null,
): Promise<T[]> {
  const db = getDb();
  const orderQuery = orderBy ? ` ORDER BY ${orderBy}` : '';
  const rows = await db.all<T[]>(`SELECT * FROM ${table}${orderQuery}`);
  return rows;
}

export async function upsertRow<T extends WithId>(
  table: string,
  row: T
): Promise<void> {
  const db = getDb();
  const columns = Object.keys(row);
  const placeholders = columns.map(() => '?').join(', ');
  const assignments = columns
    .filter((c) => c !== 'id')
    .map((c) => `${c} = excluded.${c}`)
    .join(', ');

  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT(id) DO UPDATE SET ${assignments};
  `;
  await db.run(sql, Object.values(row));
}

export async function deleteRowById(
  table: string,
  id: string
): Promise<boolean> {
  const db = getDb();
  const result = await db.run(
    `DELETE FROM ${table} WHERE id = ?`,
    [id]
  );

  return result.changes > 0;
}