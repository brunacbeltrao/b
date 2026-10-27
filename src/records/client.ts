// Client helpers for the server's generic records and private files API (see server/records.ts).

/** The document vault closed (it stays open for a few minutes after the password). */
export class VaultLockedError extends Error {
  constructor() {
    super('O cofre foi trancado. Digite a senha de novo.');
  }
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function json<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Error('Sua sessão expirou. Entre de novo.');
  if (res.status === 423) throw new VaultLockedError();
  if (!res.ok) throw new Error('Não foi possível falar com o servidor.');
  return res.json();
}

export async function saveRecord<T extends { id: string }>(record: T): Promise<T> {
  const res = await fetch(`/api/records/${encodeURIComponent(record.id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  return (await json<{ record: T }>(res)).record;
}

export async function deleteRecord(id: string): Promise<void> {
  await json(await fetch(`/api/records/${encodeURIComponent(id)}`, { method: 'DELETE' }));
}

export async function uploadFile(file: File, options: { sensitive?: boolean } = {}): Promise<{ id: string; name: string }> {
  if (file.size > 3 * 1024 * 1024) throw new Error('O arquivo passa de 3 MB. Reduza o PDF ou envie uma foto menor.');
  const dataBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
  const res = await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: file.name, contentType: file.type, dataBase64, sensitive: !!options.sensitive }),
  });
  if (res.status === 413) throw new Error('O arquivo é grande demais (máximo 3 MB).');
  return (await json<{ file: { id: string; name: string } }>(res)).file;
}

export async function deleteFile(id: string): Promise<void> {
  await fetch(`/api/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function fetchRecords<T>(kind?: string): Promise<T[]> {
  const url = kind ? `/api/records?kind=${encodeURIComponent(kind)}` : '/api/records';
  return (await json<{ records: T[] }>(await fetch(url, { cache: 'no-store' }))).records;
}
