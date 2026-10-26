// Cloud sync: one JSON snapshot of the app's localStorage.
// Stored in Postgres (app_state) when a database is available; the private Vercel Blob is the
// legacy store and is copied into the database the first time it is read.
import type { Express } from 'express';
import { get, put } from '@vercel/blob';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAuth } from './auth.js';
import { isDatabaseAvailable, query } from './db.js';

const STATE_PATH = 'bruna-os/state.json';
const STATE_KEY = 'snapshot';
const LEGACY_LOCAL_FILE = path.join(process.cwd(), '.data', 'state.json');

export interface SyncSnapshot {
  updatedAt: number;
  data: Record<string, string>;
}

function isSnapshot(value: unknown): value is SyncSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as SyncSnapshot;
  return (
    typeof v.updatedAt === 'number' &&
    !!v.data &&
    typeof v.data === 'object' &&
    Object.values(v.data).every((item) => typeof item === 'string')
  );
}

async function readLegacy(): Promise<SyncSnapshot | null> {
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const result = await get(STATE_PATH, { access: 'private', useCache: false });
      if (!result || result.statusCode !== 200) return null;
      return JSON.parse(await new Response(result.stream).text());
    }
    return JSON.parse(await fs.readFile(LEGACY_LOCAL_FILE, 'utf8'));
  } catch {
    return null;
  }
}

async function readSnapshot(): Promise<SyncSnapshot | null> {
  if (!isDatabaseAvailable()) return readLegacy();
  const rows = await query<{ value: SyncSnapshot }>('SELECT value FROM app_state WHERE key = $1', [STATE_KEY]);
  if (rows[0]) return rows[0].value;
  const legacy = await readLegacy();
  if (legacy && isSnapshot(legacy)) await writeSnapshot(legacy);
  return legacy;
}

async function writeSnapshot(snapshot: SyncSnapshot): Promise<void> {
  if (!isDatabaseAvailable()) {
    await put(STATE_PATH, JSON.stringify(snapshot), {
      access: 'private',
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json',
    });
    return;
  }
  await query(
    `INSERT INTO app_state (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [STATE_KEY, JSON.stringify(snapshot)],
  );
}

export function registerSyncRoutes(app: Express) {
  app.get('/api/state', requireAuth, async (_req, res) => {
    try {
      res.json({ state: await readSnapshot() });
    } catch (error) {
      console.error('Error reading synced state:', error);
      res.status(500).json({ error: 'read-failed' });
    }
  });

  app.put('/api/state', requireAuth, async (req, res) => {
    if (!isSnapshot(req.body)) {
      res.status(400).json({ error: 'invalid-snapshot' });
      return;
    }
    try {
      await writeSnapshot(req.body);
      res.json({ ok: true, updatedAt: req.body.updatedAt });
    } catch (error) {
      console.error('Error saving synced state:', error);
      res.status(500).json({ error: 'write-failed' });
    }
  });
}
