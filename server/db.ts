// Postgres access: Neon (serverless HTTP) when DATABASE_URL is set, an embedded PGlite in .data/ otherwise.
// Data lives in a few generic tables so new modules (health, bills, …) don't need a migration each.
import path from 'path';
import { mkdir } from 'fs/promises';

type Row = Record<string, any>;
type Runner = (text: string, params?: unknown[]) => Promise<Row[]>;

let runner: Promise<Runner> | null = null;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS records (
     id TEXT PRIMARY KEY,
     kind TEXT NOT NULL,
     date TEXT,
     data JSONB NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE INDEX IF NOT EXISTS records_kind_date ON records (kind, date)`,
  `CREATE TABLE IF NOT EXISTS app_state (
     key TEXT PRIMARY KEY,
     value JSONB NOT NULL,
     updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  `CREATE TABLE IF NOT EXISTS files (
     id TEXT PRIMARY KEY,
     name TEXT NOT NULL,
     content_type TEXT NOT NULL,
     size INTEGER NOT NULL,
     storage_path TEXT NOT NULL,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   )`,
  // Files attached to vault documents are only served while the vault is open
  `ALTER TABLE files ADD COLUMN IF NOT EXISTS sensitive BOOLEAN NOT NULL DEFAULT false`,
];

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL;
}

async function createRunner(): Promise<Runner> {
  const url = databaseUrl();
  let run: Runner;
  if (url) {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(url);
    run = async (text, params = []) => (await sql.query(text, params as any[])) as Row[];
  } else if (process.env.VERCEL) {
    throw new Error('DATABASE_URL is not configured');
  } else {
    const { PGlite } = await import('@electric-sql/pglite');
    const dir = path.join(process.cwd(), '.data', 'pg');
    await mkdir(path.dirname(dir), { recursive: true });
    const db = new PGlite(dir);
    run = async (text, params = []) => (await db.query(text, params as any[])).rows as Row[];
  }
  for (const statement of SCHEMA) await run(statement);
  return run;
}

export async function query<T extends Row = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  if (!runner) {
    runner = createRunner().catch((err) => {
      runner = null; // let the next request retry
      throw err;
    });
  }
  return (await (await runner)(text, params)) as T[];
}

export function isDatabaseAvailable(): boolean {
  return !!databaseUrl() || !process.env.VERCEL;
}
