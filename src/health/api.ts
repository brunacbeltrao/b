// Health records live only on the server (Postgres), behind the login. Nothing here is cached locally.
import { useCallback, useEffect, useState } from 'react';
import { deleteFile, deleteRecord, json, newId, saveRecord, uploadFile } from '../records/client';

export { newId, uploadFile };

export interface Consulta {
  id: string;
  kind: 'consulta';
  date: string; // YYYY-MM-DD
  time?: string;
  doctor: string;
  specialty?: string;
  clinic?: string;
  status: 'agendada' | 'realizada' | 'cancelada';
  reason?: string;
  notes?: string;
  prescription?: string;
  returnDate?: string;
}

export interface Remedio {
  id: string;
  kind: 'remedio';
  date: string; // start date
  name: string;
  dosage?: string;
  schedule?: string; // e.g. "08:00, 20:00"
  prescribedBy?: string;
  endDate?: string;
  active: boolean;
  controlled?: boolean;
  pillsRemaining?: number;
  notes?: string;
}

export interface Exame {
  id: string;
  kind: 'exame';
  date: string;
  name: string;
  lab?: string;
  doctor?: string;
  status: 'solicitado' | 'agendado' | 'realizado' | 'resultado';
  result?: string;
  reference?: string;
  interpretation?: 'normal' | 'atencao' | 'alterado';
  notes?: string;
  fileId?: string;
  fileName?: string;
}

export type HealthRecord = Consulta | Remedio | Exame;
export type HealthKind = HealthRecord['kind'];

/** All health records, with helpers that keep the list in sync after each change. */
export function useHealthRecords() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const all = (await json<{ records: any[] }>(await fetch('/api/records', { cache: 'no-store' }))).records;
      setRecords(all.filter((r) => r.kind === 'consulta' || r.kind === 'remedio' || r.kind === 'exame'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (record: HealthRecord) => {
    const saved = await saveRecord(record);
    setRecords((prev) => [saved, ...prev.filter((r) => r.id !== saved.id)]);
    return saved;
  }, []);

  const remove = useCallback(async (record: HealthRecord) => {
    await deleteRecord(record.id);
    if (record.kind === 'exame' && record.fileId) await deleteFile(record.fileId);
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
  }, []);

  return { records, loading, error, reload: load, save, remove };
}

// ---------------------------------------------------------------------------
// One-time import of the health data the prototype kept in this browser
// ---------------------------------------------------------------------------
const LEGACY_KEY = 'bruna_os_v3_health_v3';
const IMPORTED_KEY = 'bruna_os_health_imported';

export function readLegacyHealth(): HealthRecord[] {
  try {
    if (localStorage.getItem(IMPORTED_KEY)) return [];
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const legacy = JSON.parse(raw);
    const out: HealthRecord[] = [];
    for (const a of legacy.appointments || []) {
      out.push({
        id: `legacy-${a.id}`,
        kind: 'consulta',
        date: a.date,
        time: a.time,
        doctor: a.doctorName,
        specialty: a.specialty,
        clinic: a.clinic,
        status: a.status === 'realizada' || a.status === 'cancelada' ? a.status : 'agendada',
        notes: a.notes,
        prescription: a.prescriptionSummary,
      });
    }
    for (const e of legacy.exams || []) {
      const iso = /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : '';
      out.push({
        id: `legacy-${e.id}`,
        kind: 'exame',
        date: iso,
        name: e.title || e.name,
        lab: e.laboratory,
        doctor: e.doctorName,
        status: e.resultValue ? 'resultado' : e.status === 'agendado' ? 'agendado' : e.status === 'solicitado' ? 'solicitado' : 'realizado',
        result: e.resultValue,
        reference: e.referenceRange,
        interpretation:
          e.interpretation === 'normal' || e.interpretation === 'otimo'
            ? 'normal'
            : e.interpretation === 'atencao'
              ? 'atencao'
              : e.interpretation
                ? 'alterado'
                : undefined,
        notes: e.resultNotes,
      });
    }
    if (legacy.adhd?.medication) {
      const d = legacy.adhd;
      const [dd, mm, yyyy] = String(d.lastPrescriptionDate || '').split('/');
      out.push({
        id: 'legacy-adhd',
        kind: 'remedio',
        date: yyyy ? `${yyyy}-${mm}-${dd}` : '',
        name: d.medication,
        dosage: [d.dosage, d.frequency].filter(Boolean).join(' · '),
        prescribedBy: d.psychiatristName,
        active: true,
        controlled: /receitu|notifica/i.test(d.prescriptionType || ''),
        pillsRemaining: typeof d.currentPillsRemaining === 'number' ? d.currentPillsRemaining : undefined,
        notes: d.notes,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function markLegacyHealthHandled() {
  try {
    localStorage.setItem(IMPORTED_KEY, new Date().toISOString());
  } catch {
    // ignore
  }
}
