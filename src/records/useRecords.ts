// One kind of server record as React state, with save and delete kept in sync.
import { useCallback, useEffect, useState } from 'react';
import { deleteFile, deleteRecord, fetchRecords, newId, saveRecord } from './client';

export { newId };

export interface BaseRecord {
  id: string;
  kind: string;
  date: string;
  fileId?: string;
}

export function useRecords<T extends BaseRecord>(kind: T['kind'], enabled = true) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    try {
      setItems(await fetchRecords<T>(kind));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [kind, enabled]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (item: T) => {
    const saved = await saveRecord(item);
    setItems((prev) => [saved, ...prev.filter((i) => i.id !== saved.id)]);
    return saved;
  }, []);

  const remove = useCallback(async (item: T) => {
    await deleteRecord(item.id);
    if (item.fileId) await deleteFile(item.fileId);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }, []);

  return { items, loading, error, reload: load, save, remove };
}

export function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "R$ 1.250,00" ⇄ 1250 for money inputs typed the Brazilian way */
export function parseMoney(text: string): number | undefined {
  const value = Number(String(text).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'));
  return value > 0 ? value : undefined;
}

export function moneyInput(value?: number) {
  return value ? String(value.toFixed(2)).replace('.', ',') : '';
}

export function shortDate(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\.| de/g, '');
}

export function daysUntil(iso: string, today = todayLocal()) {
  const [y, m, d] = iso.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - new Date(ty, tm - 1, td).getTime()) / 86_400_000);
}
