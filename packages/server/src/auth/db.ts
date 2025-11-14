import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function initializeDatabase(filename: string) {
  db = await open({
    filename: filename,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS agora_passwords (
      id TEXT PRIMARY KEY,
      read_password TEXT NULLABLE,
      edit_password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS space_passwords (
      id TEXT PRIMARY KEY,
      edit_password TEXT NULLABLE
    );
  `);

  console.log('Database initialized');
}

export function getDb() {
  if (!db) throw new Error('Database not initialized');
  return db;
}
