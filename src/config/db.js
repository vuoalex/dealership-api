import Database from "better-sqlite3";

export function createConnection(filename = process.env.DB_PATH ?? "cars.db") {
  const db = new Database(filename);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS cars (
      id                  INTEGER PRIMARY KEY,
      registration_number TEXT NOT NULL UNIQUE,
      make                TEXT NOT NULL,
      model               TEXT NOT NULL,
      year                INTEGER NOT NULL,
      mileage             INTEGER NOT NULL,
      fuel                TEXT NOT NULL,
      transmission        TEXT NOT NULL,
      price               INTEGER NOT NULL,
      status              TEXT NOT NULL DEFAULT 'available',
      created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return db;
}

const db = createConnection();

export default db;
