// Single-user login: the app password (SYNC_PASSWORD) is exchanged for a signed, HttpOnly session cookie.
// The raw password never needs to live in the browser after login.
import type { Express, NextFunction, Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE = 'bos_session';
const MAX_AGE_DAYS = 30;
// The document vault asks for the password again and stays open for a short while
const VAULT_COOKIE = 'bos_vault';
const VAULT_MINUTES = 15;

function secret(): string | undefined {
  // A dedicated secret is preferred; falling back to the password keeps local dev zero-config
  return process.env.SESSION_SECRET || process.env.SYNC_PASSWORD;
}

export function authConfigured(): boolean {
  return !!process.env.SYNC_PASSWORD;
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function sign(payload: string): string {
  return createHmac('sha256', secret() || '').update(payload).digest('base64url');
}

function issueToken(ttlMs = MAX_AGE_DAYS * 86_400_000, scope = 'session'): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + ttlMs, scope })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function validToken(token: string | undefined, scope = 'session'): boolean {
  if (!token || !secret()) return false;
  const [payload, mac] = token.split('.');
  if (!payload || !mac || !safeEqual(mac, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    // Session tokens issued before scopes existed carry none
    return data.exp > Date.now() && (data.scope || 'session') === scope;
  } catch {
    return false;
  }
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

function setCookie(res: Response, name: string, value: string, maxAgeSeconds: number, sameSite: 'Lax' | 'Strict' = 'Lax') {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  // Lax keeps the session on the return from Google's consent screen
  const cookie = `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAgeSeconds}${secure}`;
  const previous = res.getHeader('Set-Cookie');
  res.setHeader('Set-Cookie', [...(Array.isArray(previous) ? previous : previous ? [String(previous)] : []), cookie]);
}

function setSessionCookie(res: Response, value: string, maxAgeSeconds: number) {
  setCookie(res, COOKIE, value, maxAgeSeconds);
}

/** True while the document vault is unlocked for this browser. */
export function vaultUnlocked(req: Request): boolean {
  if (!authConfigured()) return true;
  return validToken(readCookie(req, VAULT_COOKIE), 'vault');
}

export function requireVault(req: Request, res: Response, next: NextFunction) {
  if (isAuthenticated(req) && vaultUnlocked(req)) return next();
  res.status(423).json({ error: 'vault-locked' });
}

export function isAuthenticated(req: Request): boolean {
  if (!authConfigured()) return true; // local dev without a password
  if (validToken(readCookie(req, COOKIE))) return true;
  // Legacy: devices connected before sessions existed send the password as a bearer token
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') && safeEqual(header.slice(7), process.env.SYNC_PASSWORD || '');
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (isAuthenticated(req)) return next();
  res.status(401).json({ error: 'unauthorized' });
}

// Naive per-instance throttle against password guessing
const failures = new Map<string, { count: number; until: number }>();

export function registerAuthRoutes(app: Express) {
  app.get('/api/auth/me', (req, res) => {
    res.json({ configured: authConfigured(), authenticated: isAuthenticated(req) });
  });

  app.post('/api/auth/login', (req, res) => {
    if (!authConfigured()) {
      res.json({ authenticated: true });
      return;
    }
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0];
    const state = failures.get(ip);
    if (state && state.until > Date.now()) {
      res.status(429).json({ error: 'too-many-attempts' });
      return;
    }
    const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
    if (!safeEqual(password, process.env.SYNC_PASSWORD || '')) {
      const count = (state?.count || 0) + 1;
      failures.set(ip, { count, until: count >= 5 ? Date.now() + 5 * 60_000 : 0 });
      res.status(401).json({ error: 'invalid-password' });
      return;
    }
    failures.delete(ip);
    setSessionCookie(res, issueToken(), MAX_AGE_DAYS * 86_400);
    res.json({ authenticated: true });
  });

  app.post('/api/auth/logout', (_req, res) => {
    setSessionCookie(res, '', 0);
    setCookie(res, VAULT_COOKIE, '', 0);
    res.json({ authenticated: false });
  });

  app.get('/api/auth/vault', requireAuth, (req, res) => {
    res.json({ unlocked: vaultUnlocked(req) });
  });

  // Re-enter the password to open the document vault for a few minutes
  app.post('/api/auth/vault', requireAuth, (req, res) => {
    if (!authConfigured()) {
      res.json({ unlocked: true });
      return;
    }
    const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0];
    const state = failures.get(ip);
    if (state && state.until > Date.now()) {
      res.status(429).json({ error: 'too-many-attempts' });
      return;
    }
    const password = typeof req.body?.password === 'string' ? req.body.password.trim() : '';
    if (!safeEqual(password, process.env.SYNC_PASSWORD || '')) {
      const count = (state?.count || 0) + 1;
      failures.set(ip, { count, until: count >= 5 ? Date.now() + 5 * 60_000 : 0 });
      res.status(401).json({ error: 'invalid-password' });
      return;
    }
    failures.delete(ip);
    setCookie(res, VAULT_COOKIE, issueToken(VAULT_MINUTES * 60_000, 'vault'), VAULT_MINUTES * 60, 'Strict');
    res.json({ unlocked: true, minutes: VAULT_MINUTES });
  });

  app.post('/api/auth/vault/lock', (_req, res) => {
    setCookie(res, VAULT_COOKIE, '', 0);
    res.json({ unlocked: false });
  });
}
