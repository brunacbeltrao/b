// Single-user login: the app password (SYNC_PASSWORD) is exchanged for a signed, HttpOnly session cookie.
// The raw password never needs to live in the browser after login.
import type { Express, NextFunction, Request, Response } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE = 'bos_session';
const MAX_AGE_DAYS = 30;

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

function issueToken(): string {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE_DAYS * 86_400_000 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function validToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const [payload, mac] = token.split('.');
  if (!payload || !mac || !safeEqual(mac, sign(payload))) return false;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now();
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

function setSessionCookie(res: Response, value: string, maxAgeSeconds: number) {
  const secure = process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`,
  );
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
    res.json({ authenticated: false });
  });
}
