// Session handling for the single-user app. The server keeps the session in an HttpOnly cookie;
// the browser only remembers that it has logged in before, so the app can open offline.
import { initCloudSync, migrateLegacyPassword, setSyncAuthenticated, disconnect } from '../sync/cloudSync';

const SEEN_KEY = 'bruna_os_authed';

export type BootResult = 'app' | 'login';
export type LoginResult = 'ok' | 'invalid' | 'throttled' | 'offline';

function remember(value: boolean) {
  try {
    if (value) localStorage.setItem(SEEN_KEY, '1');
    else localStorage.removeItem(SEEN_KEY);
  } catch {
    // private mode: the app simply asks to log in again
  }
}

function seenBefore(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

async function fetchSession(): Promise<{ configured: boolean; authenticated: boolean } | null> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Decides whether to show the app or the login screen, syncing the cloud copy first. */
export async function boot(): Promise<BootResult> {
  await migrateLegacyPassword();
  const session = await fetchSession();
  if (!session) {
    // Offline: let a device that has logged in before use its local copy
    setSyncAuthenticated(false);
    await initCloudSync();
    return seenBefore() ? 'app' : 'login';
  }
  if (!session.configured) {
    setSyncAuthenticated(false);
    await initCloudSync();
    return 'app';
  }
  if (!session.authenticated) {
    remember(false);
    return 'login';
  }
  remember(true);
  setSyncAuthenticated(true);
  await initCloudSync();
  return 'app';
}

export async function login(password: string): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.status === 429) return 'throttled';
    if (!res.ok) return 'invalid';
  } catch {
    return 'offline';
  }
  remember(true);
  setSyncAuthenticated(true);
  await initCloudSync();
  return 'ok';
}

export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch {
    // the cookie expires on its own; local state is cleared below either way
  }
  remember(false);
  disconnect();
  window.location.reload();
}
