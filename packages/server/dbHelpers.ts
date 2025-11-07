import { getDb } from './db.ts';

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
