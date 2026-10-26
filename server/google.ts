// Google integration: OAuth (one account, the owner's), Calendar read/write and Gmail bill detection.
// Tokens are stored encrypted in app_state; nothing Google-related ever reaches the browser except event data.
import type { Express, Request, Response } from 'express';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { requireAuth } from './auth.js';
import { query } from './db.js';

const SCOPES = [
  'openid',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
];
const TOKEN_KEY = 'google';
const STATE_COOKIE = 'bos_gstate';
export const TIME_ZONE = 'America/Recife';

interface StoredTokens {
  refreshToken: string;
  accessToken?: string;
  expiresAt?: number;
  email?: string;
  scope?: string;
  connectedAt: number;
}

export function googleConfigured(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

// ---------------------------------------------------------------------------
// Encrypted token storage
// ---------------------------------------------------------------------------
function key(): Buffer {
  const base = process.env.SESSION_SECRET || process.env.SYNC_PASSWORD || 'dev-only';
  return createHash('sha256').update(`google-tokens:${base}`).digest();
}

function encrypt(value: object): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
}

function decrypt<T>(blob: string): T {
  const raw = Buffer.from(blob, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key(), raw.subarray(0, 12));
  decipher.setAuthTag(raw.subarray(12, 28));
  return JSON.parse(Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString('utf8'));
}

async function loadTokens(): Promise<StoredTokens | null> {
  const rows = await query<{ value: { sealed: string } }>('SELECT value FROM app_state WHERE key = $1', [TOKEN_KEY]);
  if (!rows[0]?.value?.sealed) return null;
  try {
    return decrypt<StoredTokens>(rows[0].value.sealed);
  } catch {
    return null; // secret rotated: the user reconnects
  }
}

async function saveTokens(tokens: StoredTokens) {
  await query(
    `INSERT INTO app_state (key, value, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [TOKEN_KEY, JSON.stringify({ sealed: encrypt(tokens) })],
  );
}

// ---------------------------------------------------------------------------
// OAuth
// ---------------------------------------------------------------------------
function origin(req: Request): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http')).split(',')[0];
  return `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`;
}

const redirectUri = (req: Request) => `${origin(req)}/api/google/callback`;

async function tokenRequest(params: Record<string, string>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      ...params,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`google-token: ${data.error || res.status}`);
  return data as { access_token: string; refresh_token?: string; expires_in: number; scope?: string };
}

export class GoogleNotConnected extends Error {}

/** A valid access token, refreshing it when needed. */
export async function accessToken(): Promise<string> {
  const tokens = await loadTokens();
  if (!tokens) throw new GoogleNotConnected('google-not-connected');
  if (tokens.accessToken && tokens.expiresAt && tokens.expiresAt > Date.now() + 60_000) return tokens.accessToken;
  try {
    const fresh = await tokenRequest({ grant_type: 'refresh_token', refresh_token: tokens.refreshToken });
    const next = { ...tokens, accessToken: fresh.access_token, expiresAt: Date.now() + fresh.expires_in * 1000 };
    await saveTokens(next);
    return next.accessToken;
  } catch (error) {
    if (String(error).includes('invalid_grant')) throw new GoogleNotConnected('google-reconnect-needed');
    throw error;
  }
}

async function google<T = any>(url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (res.status === 401) throw new GoogleNotConnected('google-reconnect-needed');
  if (!res.ok) throw new Error(`google-api ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

function sendError(res: Response, error: unknown) {
  if (error instanceof GoogleNotConnected) {
    res.status(409).json({ error: error.message });
    return;
  }
  console.error('Google error:', error);
  res.status(502).json({ error: 'google-failed' });
}

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------
export interface GoogleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // "HH:MM - HH:MM"
  allDay: boolean;
  location?: string;
  description?: string;
  link?: string;
}

function localParts(iso: string) {
  const d = new Date(iso);
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const get = (t: string) => fmt.find((p) => p.type === t)?.value || '';
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
}

export async function listEvents(fromISO: string, toISO: string): Promise<GoogleEvent[]> {
  const params = new URLSearchParams({
    timeMin: new Date(`${fromISO}T00:00:00-03:00`).toISOString(),
    timeMax: new Date(`${toISO}T23:59:59-03:00`).toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    timeZone: TIME_ZONE,
  });
  const data = await google<{ items?: any[] }>(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
  );
  return (data.items || [])
    .filter((e) => e.status !== 'cancelled')
    .map((e) => {
      const allDay = !!e.start?.date;
      const start = allDay ? { date: e.start.date, time: '' } : localParts(e.start.dateTime);
      const end = allDay || !e.end?.dateTime ? null : localParts(e.end.dateTime);
      return {
        id: e.id,
        title: e.summary || '(sem título)',
        date: start.date,
        time: allDay ? undefined : end ? `${start.time} - ${end.time}` : start.time,
        allDay,
        location: e.location,
        description: e.description,
        link: e.htmlLink,
      };
    });
}

export async function createEvent(input: {
  title: string;
  date: string;
  start?: string;
  end?: string;
  location?: string;
  description?: string;
}) {
  const body: any = { summary: input.title, location: input.location, description: input.description };
  if (input.start) {
    const end = input.end || addMinutes(input.start, 60);
    body.start = { dateTime: `${input.date}T${input.start}:00`, timeZone: TIME_ZONE };
    body.end = { dateTime: `${input.date}T${end}:00`, timeZone: TIME_ZONE };
  } else {
    const next = new Date(`${input.date}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    body.start = { date: input.date };
    body.end = { date: next.toISOString().slice(0, 10) };
  }
  return google('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

function addMinutes(hhmm: string, minutes: number) {
  const [h, m] = hhmm.split(':').map(Number);
  const total = Math.min(23 * 60 + 59, h * 60 + m + minutes);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Gmail → bills
// ---------------------------------------------------------------------------
const BILL_QUERY =
  'newer_than:40d -category:promotions -category:social (fatura OR boleto OR vencimento OR "segunda via" OR "conta disponível" OR "pagamento pendente")';

function decodeBody(part: any): string {
  if (!part) return '';
  if (part.body?.data && (part.mimeType === 'text/plain' || part.mimeType === 'text/html')) {
    const text = Buffer.from(part.body.data, 'base64url').toString('utf8');
    return part.mimeType === 'text/html'
      ? text.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ')
      : text;
  }
  const parts: any[] = part.parts || [];
  const plain = parts.find((p) => p.mimeType === 'text/plain');
  return plain ? decodeBody(plain) : parts.map(decodeBody).join('\n');
}

export interface DetectedBill {
  name: string;
  amount?: number;
  dueDate?: string;
  barcode?: string;
  issuer?: string;
}

/** Rule-based extraction; used directly, or as a fallback when there is no Gemini key. */
export function extractBillHeuristic(subject: string, from: string, text: string): DetectedBill | null {
  const all = `${subject}\n${text}`;
  const amountMatch = all.match(/R\$\s*([\d.]{1,9},\d{2})/);
  const dueMatch =
    all.match(/venc\w*[^\d]{0,30}(\d{2})\/(\d{2})\/(\d{4})/i) || all.match(/venc\w*[^\d]{0,30}(\d{2})\/(\d{2})/i);
  const barcodeMatch = all.match(/\b(\d{5}[.\s]?\d{5}\s?\d{5}[.\s]?\d{6}\s?\d{5}[.\s]?\d{6}\s?\d\s?\d{14})\b/);
  if (!amountMatch && !dueMatch && !barcodeMatch) return null;
  const year = dueMatch?.[3] || String(new Date().getFullYear());
  const issuer = (from.match(/^"?([^"<]+)"?\s*</)?.[1] || from.split('@')[1] || from).trim();
  return {
    name: subject.slice(0, 120) || issuer,
    issuer,
    amount: amountMatch ? Number(amountMatch[1].replace(/\./g, '').replace(',', '.')) : undefined,
    dueDate: dueMatch ? `${year}-${dueMatch[2]}-${dueMatch[1]}` : undefined,
    barcode: barcodeMatch ? barcodeMatch[1].replace(/[.\s]/g, '') : undefined,
  };
}

async function extractBillWithGemini(subject: string, from: string, text: string): Promise<DetectedBill | null> {
  if (!process.env.GEMINI_API_KEY) return extractBillHeuristic(subject, from, text);
  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Este e-mail é uma cobrança a pagar (fatura de cartão, boleto, conta de consumo, mensalidade)?
Responda só JSON: {"isBill": boolean, "name": "nome curto da conta, ex.: Fatura Nubank, Conta de luz Neoenergia", "issuer": string, "amount": number|null, "dueDate": "YYYY-MM-DD"|null, "barcode": "linha digitável só com dígitos"|null}.
Se for apenas propaganda, recibo de algo já pago ou aviso sem valor a pagar, use isBill=false.

De: ${from}
Assunto: ${subject}
Corpo:
${text.slice(0, 6000)}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    const parsed = JSON.parse(response.text || '{}');
    if (!parsed.isBill) return null;
    return {
      name: parsed.name || subject,
      issuer: parsed.issuer || undefined,
      amount: typeof parsed.amount === 'number' ? parsed.amount : undefined,
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(parsed.dueDate || '') ? parsed.dueDate : undefined,
      barcode: parsed.barcode ? String(parsed.barcode).replace(/\D/g, '') : undefined,
    };
  } catch (error) {
    console.error('Gemini bill extraction failed, using rules:', error);
    return extractBillHeuristic(subject, from, text);
  }
}

/** Finds bills in recent e-mail and stores new ones as "conta" records. Returns how many were added. */
export async function scanGmailForBills(): Promise<{ scanned: number; added: number }> {
  const list = await google<{ messages?: { id: string; threadId: string }[] }>(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?${new URLSearchParams({ q: BILL_QUERY, maxResults: '25' })}`,
  );
  const messages = list.messages || [];
  let added = 0;
  for (const m of messages) {
    const id = `gmail-${m.id}`;
    const exists = await query('SELECT 1 FROM records WHERE id = $1', [id]);
    if (exists.length) continue;
    const msg = await google<any>(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`);
    const header = (name: string) =>
      msg.payload?.headers?.find((h: any) => h.name.toLowerCase() === name)?.value || '';
    const subject = header('subject');
    const from = header('from');
    const text = decodeBody(msg.payload).replace(/\s+/g, ' ').trim() || msg.snippet || '';
    const bill = await extractBillWithGemini(subject, from, text);
    // Remember skipped messages too, so they aren't analysed again tomorrow
    const data = bill
      ? {
          name: bill.name,
          issuer: bill.issuer,
          amount: bill.amount,
          barcode: bill.barcode,
          method: bill.barcode ? 'boleto' : undefined,
          status: 'aberta',
          source: 'gmail',
          gmailLink: `https://mail.google.com/mail/u/0/#all/${m.threadId}`,
          needsReview: !bill.amount || !bill.dueDate,
        }
      : { ignored: true, source: 'gmail', name: subject };
    await query(
      `INSERT INTO records (id, kind, date, data) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
      [id, bill ? 'conta' : 'gmail_ignorado', bill?.dueDate || null, JSON.stringify(data)],
    );
    if (bill) added++;
  }
  return { scanned: messages.length, added };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export function registerGoogleRoutes(app: Express) {
  app.get('/api/google/status', requireAuth, async (_req, res) => {
    if (!googleConfigured()) {
      res.json({ configured: false, connected: false });
      return;
    }
    try {
      const tokens = await loadTokens();
      res.json({ configured: true, connected: !!tokens, email: tokens?.email, connectedAt: tokens?.connectedAt });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get('/api/google/connect', requireAuth, (req, res) => {
    if (!googleConfigured()) {
      res.status(503).send('Google ainda não configurado.');
      return;
    }
    const state = randomBytes(16).toString('hex');
    const secure = process.env.VERCEL ? '; Secure' : '';
    res.setHeader('Set-Cookie', `${STATE_COOKIE}=${state}; Path=/api/google; HttpOnly; SameSite=Lax; Max-Age=600${secure}`);
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri(req),
      response_type: 'code',
      scope: SCOPES.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state,
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  app.get('/api/google/callback', requireAuth, async (req, res) => {
    const cookieState = (req.headers.cookie || '').match(new RegExp(`${STATE_COOKIE}=([a-f0-9]+)`))?.[1];
    if (req.query.error || !req.query.code || !cookieState || cookieState !== req.query.state) {
      res.redirect('/?google=erro');
      return;
    }
    try {
      const tokens = await tokenRequest({
        grant_type: 'authorization_code',
        code: String(req.query.code),
        redirect_uri: redirectUri(req),
      });
      const previous = await loadTokens();
      const refreshToken = tokens.refresh_token || previous?.refreshToken;
      if (!refreshToken) throw new Error('google-no-refresh-token');
      const info = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      }).then((r) => (r.ok ? r.json() : {}));
      await saveTokens({
        refreshToken,
        accessToken: tokens.access_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        email: (info as any).email,
        scope: tokens.scope,
        connectedAt: Date.now(),
      });
      res.redirect('/?google=conectado');
    } catch (error) {
      console.error('Google callback failed:', error);
      res.redirect('/?google=erro');
    }
  });

  app.post('/api/google/disconnect', requireAuth, async (_req, res) => {
    try {
      const tokens = await loadTokens();
      if (tokens) {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(tokens.refreshToken)}`, {
          method: 'POST',
        }).catch(() => undefined);
      }
      await query('DELETE FROM app_state WHERE key = $1', [TOKEN_KEY]);
      res.json({ connected: false });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.get('/api/google/calendar/events', requireAuth, async (req, res) => {
    const from = String(req.query.from || '');
    const to = String(req.query.to || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
      res.status(400).json({ error: 'invalid-range' });
      return;
    }
    try {
      res.json({ events: await listEvents(from, to) });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post('/api/google/calendar/events', requireAuth, async (req, res) => {
    const { title, date, start, end, location, description } = req.body || {};
    if (typeof title !== 'string' || !title.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
      res.status(400).json({ error: 'invalid-event' });
      return;
    }
    const time = (v: unknown) => (typeof v === 'string' && /^\d{2}:\d{2}$/.test(v) ? v : undefined);
    try {
      const created = await createEvent({ title: title.trim(), date, start: time(start), end: time(end), location, description });
      res.json({ id: created.id, link: created.htmlLink });
    } catch (error) {
      sendError(res, error);
    }
  });

  app.post('/api/google/gmail/scan', requireAuth, async (_req, res) => {
    try {
      res.json(await scanGmailForBills());
    } catch (error) {
      sendError(res, error);
    }
  });
}
