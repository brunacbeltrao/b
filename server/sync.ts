// Cloud sync: one JSON snapshot of the app's localStorage, kept in a private Vercel Blob store.
// Access requires the SYNC_PASSWORD set in the project's environment variables.
import type { Express, Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { get, put } from '@vercel/blob';
import { timingSafeEqual } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

const STATE_PATH = 'bruna-os/state.json';
// Outside Vercel (local dev) without a Blob token, the snapshot lives in a git-ignored file
const LOCAL_FILE = path.join(process.cwd(), '.data', 'state.json');

function useLocalFile(): boolean {
  return !process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL;
}

async function readSnapshot(): Promise<unknown | null> {
  if (useLocalFile()) {
    try {
      return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'));
    } catch {
      return null;
    }
  }
  const result = await get(STATE_PATH, { access: 'private', useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return JSON.parse(await new Response(result.stream).text());
}

async function writeSnapshot(snapshot: SyncSnapshot): Promise<void> {
  if (useLocalFile()) {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(snapshot));
    return;
  }
  await put(STATE_PATH, JSON.stringify(snapshot), {
    access: 'private',
    allowOverwrite: true,
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

export interface SyncSnapshot {
  updatedAt: number;
  data: Record<string, string>;
}

function isAuthorized(req: ExpressRequest, res: ExpressResponse): boolean {
  const password = process.env.SYNC_PASSWORD;
  if (!password || (!process.env.BLOB_READ_WRITE_TOKEN && process.env.VERCEL)) {
    res.status(503).json({ error: 'sync-disabled' });
    return false;
  }
  const header = req.headers.authorization || '';
  const given = Buffer.from(header.startsWith('Bearer ') ? header.slice(7) : '');
  const expected = Buffer.from(password);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }
  return true;
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

export function registerSyncRoutes(app: Express) {
  app.get('/api/state', async (req, res) => {
    if (!isAuthorized(req, res)) return;
    try {
      res.json({ state: await readSnapshot() });
    } catch (error) {
      console.error('Error reading synced state:', error);
      res.status(500).json({ error: 'read-failed' });
    }
  });

  app.put('/api/state', async (req, res) => {
    if (!isAuthorized(req, res)) return;
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
