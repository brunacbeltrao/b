// Keeps the app's localStorage in sync with the private cloud snapshot (see server/sync.ts).
// The app itself keeps reading and writing localStorage; this module mirrors those writes
// to /api/state and, on startup or when the tab regains focus, pulls a newer snapshot.

const SYNCED_PREFIXES = ['bruna_os_v3_', 'bruna-fdr:', 'lds_fdr_'];
// Only read to migrate devices that stored the password before session cookies existed
const LEGACY_PASSWORD_KEY = 'bruna_os_sync_password';
const META_KEY = 'bruna_os_sync_meta';
const PUSH_DEBOUNCE_MS = 2000;

export type SyncStatus = 'off' | 'syncing' | 'synced' | 'offline' | 'unauthorized' | 'unavailable';

interface SyncMeta {
  // When this device's synced data last changed (or was replaced by a pull)
  localUpdatedAt: number;
  lastSyncedAt: number | null;
}

interface Snapshot {
  updatedAt: number;
  data: Record<string, string>;
}

const nativeSetItem = Storage.prototype.setItem;
const nativeRemoveItem = Storage.prototype.removeItem;
const nativeClear = Storage.prototype.clear;

let status: SyncStatus = 'off';
const listeners = new Set<(s: SyncStatus) => void>();
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;
let authenticated = false;

/** Called by the auth layer once the session is known */
export function setSyncAuthenticated(value: boolean) {
  authenticated = value;
  if (!value) setStatus('off');
}

/** Devices connected before sessions stored the password; exchange it once for a session cookie. */
export async function migrateLegacyPassword(): Promise<boolean> {
  let password: string | null = null;
  try {
    password = localStorage.getItem(LEGACY_PASSWORD_KEY);
  } catch {
    return false;
  }
  if (!password) return false;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      nativeRemoveItem.call(localStorage, LEGACY_PASSWORD_KEY);
      return true;
    }
    if (res.status === 401) nativeRemoveItem.call(localStorage, LEGACY_PASSWORD_KEY);
  } catch {
    // offline: try again next launch
  }
  return false;
}

function setStatus(next: SyncStatus) {
  status = next;
  listeners.forEach((fn) => fn(next));
}

export function getSyncStatus(): SyncStatus {
  return status;
}

export function subscribeSyncStatus(fn: (s: SyncStatus) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function isSyncedKey(key: string): boolean {
  return SYNCED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

export function isSyncConfigured(): boolean {
  return authenticated;
}

function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to default
  }
  return { localUpdatedAt: 0, lastSyncedAt: null };
}

function writeMeta(meta: SyncMeta) {
  try {
    nativeSetItem.call(localStorage, META_KEY, JSON.stringify(meta));
  } catch {
    // storage unavailable; sync simply won't remember its state
  }
}

export function getLastSyncedAt(): number | null {
  return readMeta().lastSyncedAt;
}

function collectLocal(): Record<string, string> {
  const data: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isSyncedKey(key)) {
      const value = localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
  }
  return data;
}

function applyRemote(snapshot: Snapshot) {
  applyingRemote = true;
  try {
    const existing: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && isSyncedKey(key)) existing.push(key);
    }
    existing.forEach((key) => nativeRemoveItem.call(localStorage, key));
    Object.entries(snapshot.data).forEach(([key, value]) => nativeSetItem.call(localStorage, key, value));
  } finally {
    applyingRemote = false;
  }
  writeMeta({ localUpdatedAt: snapshot.updatedAt, lastSyncedAt: Date.now() });
}

async function request(method: 'GET' | 'PUT', body?: Snapshot): Promise<Response | null> {
  if (!authenticated) return null;
  try {
    return await fetch('/api/state', {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    setStatus('offline');
    return null;
  }
}

function handleErrorStatus(res: Response) {
  if (res.status === 401) setStatus('unauthorized');
  else if (res.status === 503) setStatus('unavailable');
  else setStatus('offline');
}

async function fetchRemote(): Promise<Snapshot | null | undefined> {
  const res = await request('GET');
  if (!res) return undefined;
  if (!res.ok) {
    handleErrorStatus(res);
    return undefined;
  }
  const json = await res.json();
  return json.state ?? null;
}

export async function pushNow(): Promise<boolean> {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (!authenticated) return false;
  setStatus('syncing');
  const meta = readMeta();
  const snapshot: Snapshot = { updatedAt: meta.localUpdatedAt || Date.now(), data: collectLocal() };
  const res = await request('PUT', snapshot);
  if (!res) return false;
  if (!res.ok) {
    handleErrorStatus(res);
    return false;
  }
  writeMeta({ localUpdatedAt: snapshot.updatedAt, lastSyncedAt: Date.now() });
  setStatus('synced');
  return true;
}

function schedulePush() {
  if (!authenticated) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    void pushNow();
  }, PUSH_DEBOUNCE_MS);
}

function markLocalChange() {
  const meta = readMeta();
  writeMeta({ ...meta, localUpdatedAt: Date.now() });
  schedulePush();
}

/**
 * Compares this device with the cloud: the newer side wins.
 * Returns true when the cloud copy replaced local data (the page must reload to show it).
 */
export async function reconcile(): Promise<boolean> {
  if (!authenticated) {
    setStatus('off');
    return false;
  }
  setStatus('syncing');
  const remote = await fetchRemote();
  if (remote === undefined) return false;
  const meta = readMeta();
  // A device that has never synced adopts the cloud copy instead of overwriting it
  if (remote && (meta.lastSyncedAt === null || remote.updatedAt > meta.localUpdatedAt)) {
    applyRemote(remote);
    setStatus('synced');
    return true;
  }
  if (!remote || remote.updatedAt < meta.localUpdatedAt) {
    await pushNow();
  } else {
    writeMeta({ ...meta, lastSyncedAt: Date.now() });
    setStatus('synced');
  }
  return false;
}

export function disconnect() {
  if (pushTimer) clearTimeout(pushTimer);
  nativeRemoveItem.call(localStorage, META_KEY);
  setSyncAuthenticated(false);
}

/** Run once before rendering the app. */
let hooksInstalled = false;

export async function initCloudSync(): Promise<void> {
  if (hooksInstalled) {
    await reconcile();
    return;
  }
  hooksInstalled = true;
  try {
    // The app re-saves unchanged state on every load, so only real changes count
    Storage.prototype.setItem = function (key: string, value: string) {
      const tracked = this === localStorage && !applyingRemote && isSyncedKey(key);
      const changed = tracked && this.getItem(key) !== String(value);
      nativeSetItem.call(this, key, value);
      if (changed) markLocalChange();
    };
    Storage.prototype.removeItem = function (key: string) {
      const changed = this === localStorage && !applyingRemote && isSyncedKey(key) && this.getItem(key) !== null;
      nativeRemoveItem.call(this, key);
      if (changed) markLocalChange();
    };
    // "Restaurar dados" clears everything; keep this device connected to the cloud
    Storage.prototype.clear = function () {
      if (this !== localStorage) return nativeClear.call(this);
      nativeClear.call(this);
      markLocalChange();
    };
  } catch {
    return;
  }

  // Pull a newer copy before the app reads localStorage, but don't hold the first render for long
  const firstSync = reconcile();
  const finishedInTime = await Promise.race([
    firstSync.then(() => true),
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 4000)),
  ]);
  if (!finishedInTime) {
    firstSync.then((replaced) => {
      if (replaced) window.location.reload();
    });
  }

  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'hidden') {
      if (pushTimer) void pushNow();
      return;
    }
    if (pushTimer || !authenticated) return;
    if (await reconcile()) window.location.reload();
  });
}
