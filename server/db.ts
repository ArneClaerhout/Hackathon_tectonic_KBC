import { DatabaseSync } from 'node:sqlite'
import { PERSONAS } from '../src/data/personas'

export const db = new DatabaseSync(process.env.KBC_DB ?? 'kbc.db')

db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS customers (
    id   TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS context_events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    hour        INTEGER NOT NULL,
    location    TEXT NOT NULL,
    transport   TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS signals (
    event_id  INTEGER NOT NULL REFERENCES context_events(id),
    signal_id TEXT NOT NULL,
    label     TEXT NOT NULL,
    source    TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS recommendations (
    event_id  INTEGER NOT NULL REFERENCES context_events(id),
    action_id TEXT NOT NULL,
    surface   TEXT NOT NULL,
    rank      INTEGER NOT NULL,
    score     INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS interactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id TEXT NOT NULL REFERENCES customers(id),
    action_id   TEXT NOT NULL,
    kind        TEXT NOT NULL CHECK (kind IN ('click', 'why')),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// src/data/personas.ts is the source of truth for the demo customers: sync them on every start.
const upsert = db.prepare('INSERT INTO customers (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data')
for (const p of PERSONAS) upsert.run(p.id, JSON.stringify(p))
console.log(`Synced ${PERSONAS.length} customers`)

// Runs fn inside a transaction (node:sqlite has no transaction helper).
export function tx<T>(fn: () => T): T {
  db.exec('BEGIN')
  try {
    const out = fn()
    db.exec('COMMIT')
    return out
  } catch (e) {
    db.exec('ROLLBACK')
    throw e
  }
}
