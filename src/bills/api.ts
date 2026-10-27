// Bills to pay ("contas") live on the server as records of kind 'conta'; `date` is the due date.
import { useCallback, useEffect, useState } from 'react';
import { deleteFile, deleteRecord, fetchRecords, newId, saveRecord } from '../records/client';

export { newId };

export interface Conta {
  id: string;
  kind: 'conta';
  date: string; // due date, YYYY-MM-DD ('' when the e-mail didn't say)
  name: string;
  issuer?: string;
  amount?: number;
  category?: string;
  method?: 'boleto' | 'pix' | 'cartao' | 'debito' | 'outro';
  barcode?: string;
  status: 'aberta' | 'paga';
  paidAt?: string;
  recurrence?: 'mensal';
  source?: 'manual' | 'gmail';
  gmailLink?: string;
  needsReview?: boolean;
  fileId?: string;
  fileName?: string;
  notes?: string;
}

export type BillBucket = 'atrasada' | 'semana' | 'depois' | 'sem-data' | 'paga';

export function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function bucketOf(bill: Conta, today: string): BillBucket {
  if (bill.status === 'paga') return 'paga';
  if (!bill.date) return 'sem-data';
  if (bill.date < today) return 'atrasada';
  const [y, m, d] = today.split('-').map(Number);
  const inAWeek = isoDay(new Date(y, m - 1, d + 7));
  return bill.date <= inAWeek ? 'semana' : 'depois';
}

/** Same day next month, clamped to the month's last day (31 Jan → 28/29 Feb). */
export function nextMonth(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const last = new Date(y, m + 1, 0).getDate();
  return isoDay(new Date(y, m, Math.min(d, last)));
}

export function useBills() {
  const [bills, setBills] = useState<Conta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setBills(await fetchRecords<Conta>('conta'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (bill: Conta) => {
    const saved = await saveRecord(bill);
    setBills((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
    return saved;
  }, []);

  const remove = useCallback(async (bill: Conta) => {
    await deleteRecord(bill.id);
    if (bill.fileId) await deleteFile(bill.fileId);
    setBills((prev) => prev.filter((b) => b.id !== bill.id));
  }, []);

  return { bills, loading, error, reload: load, save, remove };
}
