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
    year                INTEGER NOT NULL CHECK (year BETWEEN 1900 AND 2100),
    mileage             INTEGER NOT NULL CHECK (mileage >= 0),
    fuel                TEXT NOT NULL CHECK (fuel IN ('petrol', 'diesel', 'electric', 'hybrid')),
    transmission        TEXT NOT NULL CHECK (transmission IN ('manual', 'automatic')),
    price               INTEGER NOT NULL CHECK (price > 0),
    status              TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return db;
}

const db = createConnection();

export default db;
