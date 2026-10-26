// Client for the server's Google integration (server/google.ts).
import { useCallback, useEffect, useState } from 'react';
import { json } from '../records/client';

export interface GoogleStatus {
  configured: boolean;
  connected: boolean;
  email?: string;
}

export interface GoogleEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  allDay: boolean;
  location?: string;
  description?: string;
  link?: string;
}

export const GOOGLE_CONNECT_URL = '/api/google/connect';

export async function fetchGoogleStatus(): Promise<GoogleStatus> {
  try {
    return await json<GoogleStatus>(await fetch('/api/google/status', { cache: 'no-store' }));
  } catch {
    return { configured: false, connected: false };
  }
}

export async function disconnectGoogle(): Promise<void> {
  await json(await fetch('/api/google/disconnect', { method: 'POST' }));
}

export async function createGoogleEvent(event: {
  title: string;
  date: string;
  start?: string;
  end?: string;
  location?: string;
  description?: string;
}): Promise<{ id: string; link?: string }> {
  const res = await fetch('/api/google/calendar/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  if (res.status === 409) throw new Error('Reconecte o Google em Conta e conexões.');
  return json(res);
}

export async function scanGmail(): Promise<{ scanned: number; added: number }> {
  const res = await fetch('/api/google/gmail/scan', { method: 'POST' });
  if (res.status === 409) throw new Error('Reconecte o Google em Conta e conexões.');
  return json(res);
}

let statusCache: Promise<GoogleStatus> | null = null;

/** Google connection status, shared across components for the page's lifetime. */
export function useGoogleStatus() {
  const [status, setStatus] = useState<GoogleStatus | null>(null);
  const refresh = useCallback(async () => {
    statusCache = fetchGoogleStatus();
    setStatus(await statusCache);
  }, []);
  useEffect(() => {
    if (!statusCache) statusCache = fetchGoogleStatus();
    statusCache.then(setStatus);
  }, []);
  return { status, refresh };
}

/** Google Calendar events between two dates (inclusive), empty when not connected. */
export function useGoogleEvents(from: string, to: string, enabled: boolean) {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setEvents([]);
      return;
    }
    let cancelled = false;
    setError('');
    fetch(`/api/google/calendar/events?from=${from}&to=${to}`, { cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 409) throw new Error('O acesso ao Google expirou. Reconecte em Conta e conexões.');
        return json<{ events: GoogleEvent[] }>(res);
      })
      .then((data) => !cancelled && setEvents(data.events))
      .catch((e) => !cancelled && setError((e as Error).message));
    return () => {
      cancelled = true;
    };
  }, [from, to, enabled, version]);

  return { events, error, reload: () => setVersion((v) => v + 1) };
}
