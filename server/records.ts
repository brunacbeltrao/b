// Generic records API (health today, bills next) plus private file attachments.
import type { Express } from 'express';
import { del, get, put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAuth, vaultUnlocked } from './auth.js';
import { query } from './db.js';

export const RECORD_KINDS = [
  'consulta',
  'remedio',
  'exame',
  'conta',
  'assinatura',
  'desejo',
  'cv',
  'competencia',
  'diario',
  'decisao',
  'revisao',
  'documento',
] as const;
/** Kinds only readable or writable while the document vault is open */
const VAULT_KINDS: readonly string[] = ['documento'];
type Kind = (typeof RECORD_KINDS)[number];

const isKind = (v: unknown): v is Kind => typeof v === 'string' && (RECORD_KINDS as readonly string[]).includes(v);
const LOCAL_FILES = path.join(process.cwd(), '.data', 'files');
// Vercel functions accept ~4.5 MB request bodies; base64 adds a third on top of the file
const MAX_FILE_BYTES = 3 * 1024 * 1024;

function useBlob() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function toRecord(row: any) {
  return { ...row.data, id: row.id, kind: row.kind, date: row.date, updatedAt: row.updated_at };
}

export function registerRecordRoutes(app: Express) {
  app.get('/api/records', requireAuth, async (req, res) => {
    const kind = req.query.kind;
    if (kind !== undefined && !isKind(kind)) {
      res.status(400).json({ error: 'invalid-kind' });
      return;
    }
    if (isKind(kind) && VAULT_KINDS.includes(kind) && !vaultUnlocked(req)) {
      res.status(423).json({ error: 'vault-locked' });
      return;
    }
    try {
      const rows = kind
        ? await query('SELECT * FROM records WHERE kind = $1 ORDER BY date DESC NULLS LAST, created_at DESC', [kind])
        : await query('SELECT * FROM records WHERE NOT (kind = ANY($1)) ORDER BY date DESC NULLS LAST, created_at DESC', [
            VAULT_KINDS,
          ]);
      res.json({ records: rows.map(toRecord) });
    } catch (error) {
      console.error('Error listing records:', error);
      res.status(500).json({ error: 'read-failed' });
    }
  });

  app.put('/api/records/:id', requireAuth, async (req, res) => {
    const { kind, date, ...data } = req.body || {};
    delete data.id;
    delete data.updatedAt;
    if (!isKind(kind) || (date != null && typeof date !== 'string')) {
      res.status(400).json({ error: 'invalid-record' });
      return;
    }
    if (!vaultUnlocked(req)) {
      const existing = await query('SELECT kind FROM records WHERE id = $1', [req.params.id]).catch(() => []);
      if (VAULT_KINDS.includes(kind) || existing.some((r: any) => VAULT_KINDS.includes(r.kind))) {
        res.status(423).json({ error: 'vault-locked' });
        return;
      }
    }
    try {
      const rows = await query(
        `INSERT INTO records (id, kind, date, data) VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET kind = EXCLUDED.kind, date = EXCLUDED.date, data = EXCLUDED.data, updated_at = now()
         RETURNING *`,
        [req.params.id, kind, date || null, JSON.stringify(data)],
      );
      res.json({ record: toRecord(rows[0]) });
    } catch (error) {
      console.error('Error saving record:', error);
      res.status(500).json({ error: 'write-failed' });
    }
  });

  app.delete('/api/records/:id', requireAuth, async (req, res) => {
    try {
      if (!vaultUnlocked(req)) {
        const existing = await query('SELECT kind FROM records WHERE id = $1', [req.params.id]);
        if (existing.some((r: any) => VAULT_KINDS.includes(r.kind))) {
          res.status(423).json({ error: 'vault-locked' });
          return;
        }
      }
      await query('DELETE FROM records WHERE id = $1', [req.params.id]);
      res.json({ ok: true });
    } catch (error) {
      console.error('Error deleting record:', error);
      res.status(500).json({ error: 'write-failed' });
    }
  });

  app.post('/api/files', requireAuth, async (req, res) => {
    const { name, contentType, dataBase64, sensitive } = req.body || {};
    if (typeof name !== 'string' || typeof dataBase64 !== 'string') {
      res.status(400).json({ error: 'invalid-file' });
      return;
    }
    if (sensitive && !vaultUnlocked(req)) {
      res.status(423).json({ error: 'vault-locked' });
      return;
    }
    const bytes = Buffer.from(dataBase64, 'base64');
    if (bytes.length > MAX_FILE_BYTES) {
      res.status(413).json({ error: 'file-too-large' });
      return;
    }
    const id = randomUUID();
    const type = typeof contentType === 'string' && contentType ? contentType : 'application/octet-stream';
    const storagePath = `files/${id}`;
    try {
      if (useBlob()) {
        await put(storagePath, bytes, { access: 'private', addRandomSuffix: false, contentType: type });
      } else {
        await fs.mkdir(LOCAL_FILES, { recursive: true });
        await fs.writeFile(path.join(LOCAL_FILES, id), bytes);
      }
      await query(
        'INSERT INTO files (id, name, content_type, size, storage_path, sensitive) VALUES ($1, $2, $3, $4, $5, $6)',
        [id, name.slice(0, 200), type, bytes.length, storagePath, !!sensitive],
      );
      res.json({ file: { id, name, size: bytes.length, contentType: type } });
    } catch (error) {
      console.error('Error saving file:', error);
      res.status(500).json({ error: 'write-failed' });
    }
  });

  app.get('/api/files/:id', requireAuth, async (req, res) => {
    try {
      const rows = await query('SELECT * FROM files WHERE id = $1', [req.params.id]);
      const file = rows[0];
      if (!file) {
        res.status(404).end();
        return;
      }
      if (file.sensitive && !vaultUnlocked(req)) {
        res.status(423).send('Abra o cofre de documentos no app para ver este arquivo.');
        return;
      }
      res.setHeader('Content-Type', file.content_type);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(file.name)}"`);
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      if (useBlob()) {
        const result = await get(file.storage_path, { access: 'private' });
        if (!result || result.statusCode !== 200) {
          res.status(404).end();
          return;
        }
        res.send(Buffer.from(await new Response(result.stream).arrayBuffer()));
      } else {
        res.send(await fs.readFile(path.join(LOCAL_FILES, file.id)));
      }
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).end();
    }
  });

  app.delete('/api/files/:id', requireAuth, async (req, res) => {
    try {
      const found = await query('SELECT sensitive FROM files WHERE id = $1', [req.params.id]);
      if (found[0]?.sensitive && !vaultUnlocked(req)) {
        res.status(423).json({ error: 'vault-locked' });
        return;
      }
      const rows = await query('DELETE FROM files WHERE id = $1 RETURNING storage_path', [req.params.id]);
      if (rows[0]) {
        if (useBlob()) await del(rows[0].storage_path).catch(() => undefined);
        else await fs.rm(path.join(LOCAL_FILES, req.params.id), { force: true });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ error: 'write-failed' });
    }
  });
}
