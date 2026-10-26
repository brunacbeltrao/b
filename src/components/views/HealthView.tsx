import React, { useMemo, useState } from 'react';
import { FileText, Paperclip, Pencil, Plus, X } from 'lucide-react';
import { Modal } from '../../fdr/ui/components/Modal';
import { todayISO } from '../../utils/dateUtils';
import {
  Consulta,
  Exame,
  HealthRecord,
  Remedio,
  markLegacyHealthHandled,
  newId,
  readLegacyHealth,
  uploadFile,
  useHealthRecords,
} from '../../health/api';
import { Button, EmptyState, Input, Label, Panel, SectionTabs, Select, Tag, Textarea, cx } from '../ui';

type Tab = 'geral' | 'consultas' | 'remedios' | 'exames';
type Editing = { record: HealthRecord; isNew: boolean } | null;

const STATUS_CONSULTA: Record<Consulta['status'], string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
};
const STATUS_EXAME: Record<Exame['status'], string> = {
  solicitado: 'Solicitado',
  agendado: 'Agendado',
  realizado: 'Realizado',
  resultado: 'Com resultado',
};
const INTERPRETATION: Record<NonNullable<Exame['interpretation']>, string> = {
  normal: 'Normal',
  atencao: 'Atenção',
  alterado: 'Alterado',
};

function formatDate(iso?: string) {
  if (!iso) return 'Sem data';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '').replace(/ de /g, ' ');
}

const blank = {
  consulta: (): Consulta => ({ id: newId('con'), kind: 'consulta', date: todayISO(), doctor: '', status: 'agendada' }),
  remedio: (): Remedio => ({ id: newId('rem'), kind: 'remedio', date: todayISO(), name: '', active: true }),
  exame: (): Exame => ({ id: newId('exa'), kind: 'exame', date: todayISO(), name: '', status: 'solicitado' }),
};

// ---------------------------------------------------------------------------

const RowActions: React.FC<{ onEdit: () => void; onDelete: () => void; label: string }> = ({ onEdit, onDelete, label }) => (
  <div className="flex items-center shrink-0 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100">
    <button onClick={onEdit} aria-label={`Editar ${label}`} className="p-1.5 rounded text-stone-400 hover:text-stone-700">
      <Pencil className="w-3.5 h-3.5" />
    </button>
    <button onClick={onDelete} aria-label={`Excluir ${label}`} className="p-1.5 rounded text-stone-400 hover:text-stone-700">
      <X className="w-4 h-4" />
    </button>
  </div>
);

const ConsultaRow: React.FC<{ c: Consulta; onEdit: () => void; onDelete: () => void }> = ({ c, onEdit, onDelete }) => (
  <li className="group flex gap-4 py-3 first:pt-0 last:pb-0">
    <div className="w-24 shrink-0 text-sm text-stone-500 tabular-nums">
      {formatDate(c.date)}
      {c.time && <div className="text-xs">{c.time}</div>}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[#1c1a1e]">{c.doctor || 'Sem nome'}</span>
        {c.status !== 'realizada' && <Tag tone={c.status === 'agendada' ? 'brand' : 'neutral'}>{STATUS_CONSULTA[c.status]}</Tag>}
      </div>
      <div className="text-xs text-stone-500 mt-0.5">{[c.specialty, c.clinic].filter(Boolean).join(' · ')}</div>
      {c.reason && <p className="text-[13px] text-stone-600 mt-1">{c.reason}</p>}
      {c.notes && <p className="text-[13px] text-stone-600 mt-1 whitespace-pre-line">{c.notes}</p>}
      {c.prescription && (
        <p className="text-[13px] text-stone-600 mt-1">
          <span className="text-stone-500">Receita: </span>
          {c.prescription}
        </p>
      )}
      {c.returnDate && <p className="text-xs text-stone-500 mt-1">Retorno: {formatDate(c.returnDate)}</p>}
    </div>
    <RowActions onEdit={onEdit} onDelete={onDelete} label={`consulta com ${c.doctor}`} />
  </li>
);

const RemedioRow: React.FC<{ r: Remedio; onEdit: () => void; onDelete: () => void }> = ({ r, onEdit, onDelete }) => (
  <li className="group flex gap-3 py-3 first:pt-0 last:pb-0">
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[#1c1a1e]">{r.name}</span>
        {r.controlled && <Tag>Controlado</Tag>}
        {typeof r.pillsRemaining === 'number' && r.active && r.pillsRemaining <= 7 && (
          <Tag tone="warning">Restam {r.pillsRemaining}</Tag>
        )}
      </div>
      <div className="text-xs text-stone-500 mt-0.5">
        {[r.dosage, r.schedule && `às ${r.schedule}`].filter(Boolean).join(' · ')}
      </div>
      <div className="text-xs text-stone-500 mt-0.5">
        {[
          r.prescribedBy && `Receitado por ${r.prescribedBy}`,
          r.date && `desde ${formatDate(r.date)}`,
          !r.active && r.endDate && `até ${formatDate(r.endDate)}`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </div>
      {r.notes && <p className="text-[13px] text-stone-600 mt-1 whitespace-pre-line">{r.notes}</p>}
    </div>
    <RowActions onEdit={onEdit} onDelete={onDelete} label={r.name} />
  </li>
);

const ExameRow: React.FC<{ e: Exame; onEdit: () => void; onDelete: () => void }> = ({ e, onEdit, onDelete }) => (
  <li className="group flex gap-4 py-3 first:pt-0 last:pb-0">
    <div className="w-24 shrink-0 text-sm text-stone-500 tabular-nums">{formatDate(e.date)}</div>
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[#1c1a1e]">{e.name}</span>
        {e.interpretation ? (
          <Tag tone={e.interpretation === 'normal' ? 'success' : 'warning'}>{INTERPRETATION[e.interpretation]}</Tag>
        ) : (
          e.status !== 'resultado' && <Tag>{STATUS_EXAME[e.status]}</Tag>
        )}
      </div>
      <div className="text-xs text-stone-500 mt-0.5">{[e.lab, e.doctor && `pedido por ${e.doctor}`].filter(Boolean).join(' · ')}</div>
      {e.result && (
        <p className="text-[13px] text-[#1c1a1e] mt-1">
          {e.result}
          {e.reference && <span className="text-stone-500"> (referência: {e.reference})</span>}
        </p>
      )}
      {e.notes && <p className="text-[13px] text-stone-600 mt-1 whitespace-pre-line">{e.notes}</p>}
      {e.fileId && (
        <a
          href={`/api/files/${e.fileId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 mt-1.5 text-[13px] text-[#8b1538] hover:underline"
        >
          <FileText className="w-3.5 h-3.5" />
          {e.fileName || 'Ver resultado'}
        </a>
      )}
    </div>
    <RowActions onEdit={onEdit} onDelete={onDelete} label={e.name} />
  </li>
);

// ---------------------------------------------------------------------------

export const HealthView: React.FC = () => {
  const { records, loading, error, reload, save, remove } = useHealthRecords();
  const [tab, setTab] = useState<Tab>('geral');
  const [editing, setEditing] = useState<Editing>(null);
  const [legacy, setLegacy] = useState<HealthRecord[]>(() => readLegacyHealth());
  const [importing, setImporting] = useState(false);

  const consultas = useMemo(
    () => records.filter((r): r is Consulta => r.kind === 'consulta').sort((a, b) => b.date.localeCompare(a.date)),
    [records],
  );
  const remedios = useMemo(() => records.filter((r): r is Remedio => r.kind === 'remedio'), [records]);
  const exames = useMemo(
    () => records.filter((r): r is Exame => r.kind === 'exame').sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [records],
  );
  const today = todayISO();
  const proximas = consultas.filter((c) => c.status === 'agendada' && c.date >= today).reverse();
  const emUso = remedios.filter((r) => r.active);
  const pendentes = exames.filter((e) => e.status !== 'resultado');

  const confirmDelete = async (r: HealthRecord) => {
    const label = r.kind === 'consulta' ? `a consulta com ${r.doctor}` : r.kind === 'remedio' ? r.name : r.name;
    if (!window.confirm(`Excluir ${label}?`)) return;
    try {
      await remove(r);
    } catch (e) {
      window.alert((e as Error).message);
    }
  };

  const edit = (record: HealthRecord) => setEditing({ record, isNew: false });
  const add = (kind: keyof typeof blank) => setEditing({ record: blank[kind](), isNew: true });

  const importLegacy = async () => {
    setImporting(true);
    try {
      for (const r of legacy) await save(r);
      markLegacyHealthHandled();
      setLegacy([]);
    } catch (e) {
      window.alert((e as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const showImport = !loading && !error && legacy.length > 0 && records.length === 0;

  return (
    <div>
      <SectionTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'geral', label: 'Visão geral' },
          { id: 'consultas', label: 'Consultas' },
          { id: 'remedios', label: 'Remédios' },
          { id: 'exames', label: 'Exames' },
        ]}
      />

      {error && (
        <Panel className="mb-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#8b1538]">{error}</p>
            <Button size="sm" onClick={reload}>
              Tentar de novo
            </Button>
          </div>
        </Panel>
      )}

      {showImport && (
        <Panel title="Dados de saúde encontrados neste aparelho" className="mb-5">
          <p className="text-sm text-stone-600 max-w-2xl">
            O protótipo guardava {legacy.filter((r) => r.kind === 'consulta').length} consultas,{' '}
            {legacy.filter((r) => r.kind === 'exame').length} exames e {legacy.filter((r) => r.kind === 'remedio').length}{' '}
            remédio no navegador. Se forem seus dados reais, importe para guardá-los na nuvem privada. Se forem só exemplos,
            descarte.
          </p>
          <ul className="mt-3 text-[13px] text-stone-600 list-disc pl-5 space-y-0.5">
            {legacy.slice(0, 6).map((r) => (
              <li key={r.id}>
                {r.kind === 'consulta' ? `${r.doctor} (${r.specialty || 'consulta'})` : r.name} · {formatDate(r.date)}
              </li>
            ))}
            {legacy.length > 6 && <li>e mais {legacy.length - 6}</li>}
          </ul>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" onClick={importLegacy} disabled={importing}>
              {importing ? 'Importando…' : 'Importar'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                markLegacyHealthHandled();
                setLegacy([]);
              }}
            >
              Descartar
            </Button>
          </div>
        </Panel>
      )}

      {loading ? (
        <Panel>
          <EmptyState>Carregando…</EmptyState>
        </Panel>
      ) : (
        <>
          {tab === 'geral' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              <Panel
                title="Remédios em uso"
                meta={emUso.length || undefined}
                actions={
                  <Button size="sm" icon={Plus} onClick={() => add('remedio')}>
                    Remédio
                  </Button>
                }
              >
                {emUso.length === 0 ? (
                  <p className="text-sm text-stone-500">Nenhum remédio em uso.</p>
                ) : (
                  <ul className="divide-y divide-[#e6e4e8]">
                    {emUso.map((r) => (
                      <RemedioRow key={r.id} r={r} onEdit={() => edit(r)} onDelete={() => confirmDelete(r)} />
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel
                title="Próximas consultas"
                meta={proximas.length || undefined}
                actions={
                  <Button size="sm" icon={Plus} onClick={() => add('consulta')}>
                    Consulta
                  </Button>
                }
              >
                {proximas.length === 0 ? (
                  <p className="text-sm text-stone-500">Nenhuma consulta marcada.</p>
                ) : (
                  <ul className="divide-y divide-[#e6e4e8]">
                    {proximas.map((c) => (
                      <ConsultaRow key={c.id} c={c} onEdit={() => edit(c)} onDelete={() => confirmDelete(c)} />
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel
                title="Exames aguardando resultado"
                meta={pendentes.length || undefined}
                actions={
                  <Button size="sm" icon={Plus} onClick={() => add('exame')}>
                    Exame
                  </Button>
                }
              >
                {pendentes.length === 0 ? (
                  <p className="text-sm text-stone-500">Nada pendente.</p>
                ) : (
                  <ul className="divide-y divide-[#e6e4e8]">
                    {pendentes.map((e) => (
                      <ExameRow key={e.id} e={e} onEdit={() => edit(e)} onDelete={() => confirmDelete(e)} />
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="Últimas consultas">
                {consultas.filter((c) => c.status === 'realizada').length === 0 ? (
                  <p className="text-sm text-stone-500">Nenhuma consulta registrada ainda.</p>
                ) : (
                  <ul className="divide-y divide-[#e6e4e8]">
                    {consultas
                      .filter((c) => c.status === 'realizada')
                      .slice(0, 4)
                      .map((c) => (
                        <ConsultaRow key={c.id} c={c} onEdit={() => edit(c)} onDelete={() => confirmDelete(c)} />
                      ))}
                  </ul>
                )}
              </Panel>
            </div>
          )}

          {tab === 'consultas' && (
            <Panel
              title="Consultas"
              meta={consultas.length || undefined}
              actions={
                <Button size="sm" variant="primary" icon={Plus} onClick={() => add('consulta')}>
                  Nova consulta
                </Button>
              }
            >
              {consultas.length === 0 ? (
                <EmptyState>Registre aqui cada consulta: médico, o que foi dito e o que foi receitado.</EmptyState>
              ) : (
                <ul className="divide-y divide-[#e6e4e8]">
                  {consultas.map((c) => (
                    <ConsultaRow key={c.id} c={c} onEdit={() => edit(c)} onDelete={() => confirmDelete(c)} />
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {tab === 'remedios' && (
            <div className="space-y-5">
              <Panel
                title="Em uso"
                meta={emUso.length || undefined}
                actions={
                  <Button size="sm" variant="primary" icon={Plus} onClick={() => add('remedio')}>
                    Novo remédio
                  </Button>
                }
              >
                {emUso.length === 0 ? (
                  <EmptyState>Nenhum remédio em uso.</EmptyState>
                ) : (
                  <ul className="divide-y divide-[#e6e4e8]">
                    {emUso.map((r) => (
                      <RemedioRow key={r.id} r={r} onEdit={() => edit(r)} onDelete={() => confirmDelete(r)} />
                    ))}
                  </ul>
                )}
              </Panel>
              <Panel title="Já tomei" meta={remedios.length - emUso.length || undefined}>
                {remedios.length === emUso.length ? (
                  <p className="text-sm text-stone-500">Os remédios que você parar de tomar aparecem aqui.</p>
                ) : (
                  <ul className="divide-y divide-[#e6e4e8]">
                    {remedios
                      .filter((r) => !r.active)
                      .map((r) => (
                        <RemedioRow key={r.id} r={r} onEdit={() => edit(r)} onDelete={() => confirmDelete(r)} />
                      ))}
                  </ul>
                )}
              </Panel>
            </div>
          )}

          {tab === 'exames' && (
            <Panel
              title="Exames"
              meta={exames.length || undefined}
              actions={
                <Button size="sm" variant="primary" icon={Plus} onClick={() => add('exame')}>
                  Novo exame
                </Button>
              }
            >
              {exames.length === 0 ? (
                <EmptyState>Guarde aqui pedidos e resultados, com o PDF do laboratório.</EmptyState>
              ) : (
                <ul className="divide-y divide-[#e6e4e8]">
                  {exames.map((e) => (
                    <ExameRow key={e.id} e={e} onEdit={() => edit(e)} onDelete={() => confirmDelete(e)} />
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </>
      )}

      {editing && (
        <RecordModal
          key={editing.record.id}
          initial={editing.record}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={async (r) => {
            await save(r);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------

const TITLES = { consulta: ['Nova consulta', 'Editar consulta'], remedio: ['Novo remédio', 'Editar remédio'], exame: ['Novo exame', 'Editar exame'] };

const RecordModal: React.FC<{
  initial: HealthRecord;
  isNew: boolean;
  onClose: () => void;
  onSave: (r: HealthRecord) => Promise<void>;
}> = ({ initial, isNew, onClose, onSave }) => {
  const [r, setR] = useState<HealthRecord>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<HealthRecord>) => setR((prev) => ({ ...prev, ...patch }) as HealthRecord);

  const valid = r.kind === 'consulta' ? !!r.doctor.trim() : !!r.name.trim();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError('');
    try {
      await onSave(r);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  const attach = async (file: File | undefined) => {
    if (!file || r.kind !== 'exame') return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadFile(file);
      set({ fileId: uploaded.id, fileName: uploaded.name } as Partial<Exame>);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal aberto aoFechar={onClose} titulo={TITLES[r.kind][isNew ? 0 : 1]} larguraMaxima="max-w-lg">
      <form onSubmit={submit} className="space-y-4">
        {r.kind === 'consulta' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="h-doctor">Médico(a)</Label>
                <Input id="h-doctor" value={r.doctor} onChange={(e) => set({ doctor: e.target.value })} autoFocus />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="h-spec">Especialidade</Label>
                <Input id="h-spec" value={r.specialty || ''} onChange={(e) => set({ specialty: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="h-date">Data</Label>
                <Input id="h-date" type="date" value={r.date} onChange={(e) => set({ date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="h-time">Hora</Label>
                <Input id="h-time" type="time" value={r.time || ''} onChange={(e) => set({ time: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="h-status">Situação</Label>
                <Select id="h-status" value={r.status} onChange={(e) => set({ status: e.target.value as Consulta['status'] })}>
                  {Object.entries(STATUS_CONSULTA).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="h-clinic">Local</Label>
              <Input id="h-clinic" value={r.clinic || ''} onChange={(e) => set({ clinic: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="h-reason">Motivo</Label>
              <Input id="h-reason" value={r.reason || ''} onChange={(e) => set({ reason: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="h-notes">O que foi dito</Label>
              <Textarea id="h-notes" rows={3} value={r.notes || ''} onChange={(e) => set({ notes: e.target.value })} />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <Label htmlFor="h-rx">Receita</Label>
                <Input id="h-rx" value={r.prescription || ''} onChange={(e) => set({ prescription: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="h-return">Retorno</Label>
                <Input id="h-return" type="date" value={r.returnDate || ''} onChange={(e) => set({ returnDate: e.target.value })} />
              </div>
            </div>
          </>
        )}

        {r.kind === 'remedio' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="h-name">Remédio</Label>
                <Input id="h-name" value={r.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Label htmlFor="h-dose">Dose</Label>
                <Input id="h-dose" value={r.dosage || ''} onChange={(e) => set({ dosage: e.target.value })} placeholder="Ex.: 30 mg, 1 cápsula" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="h-schedule">Horários</Label>
                <Input id="h-schedule" value={r.schedule || ''} onChange={(e) => set({ schedule: e.target.value })} placeholder="08:00, 20:00" />
              </div>
              <div>
                <Label htmlFor="h-by">Quem receitou</Label>
                <Input id="h-by" value={r.prescribedBy || ''} onChange={(e) => set({ prescribedBy: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="h-start">Início</Label>
                <Input id="h-start" type="date" value={r.date} onChange={(e) => set({ date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="h-end">Fim</Label>
                <Input
                  id="h-end"
                  type="date"
                  value={r.endDate || ''}
                  onChange={(e) => set({ endDate: e.target.value, active: !e.target.value || e.target.value >= todayISO() })}
                />
              </div>
              <div>
                <Label htmlFor="h-pills">Comprimidos</Label>
                <Input
                  id="h-pills"
                  inputMode="numeric"
                  value={r.pillsRemaining ?? ''}
                  onChange={(e) => set({ pillsRemaining: e.target.value === '' ? undefined : Number(e.target.value.replace(/\D/g, '')) })}
                  placeholder="restantes"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#1c1a1e]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={r.active} onChange={(e) => set({ active: e.target.checked })} className="w-4 h-4 accent-[#8b1538]" />
                Estou tomando
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!r.controlled}
                  onChange={(e) => set({ controlled: e.target.checked })}
                  className="w-4 h-4 accent-[#8b1538]"
                />
                Receita controlada
              </label>
            </div>
            <div>
              <Label htmlFor="h-rnotes">Observações</Label>
              <Textarea id="h-rnotes" rows={2} value={r.notes || ''} onChange={(e) => set({ notes: e.target.value })} />
            </div>
          </>
        )}

        {r.kind === 'exame' && (
          <>
            <div>
              <Label htmlFor="h-ename">Exame</Label>
              <Input id="h-ename" value={r.name} onChange={(e) => set({ name: e.target.value })} autoFocus placeholder="Ex.: Hemograma completo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="h-edate">Data</Label>
                <Input id="h-edate" type="date" value={r.date} onChange={(e) => set({ date: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="h-estatus">Situação</Label>
                <Select id="h-estatus" value={r.status} onChange={(e) => set({ status: e.target.value as Exame['status'] })}>
                  {Object.entries(STATUS_EXAME).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="h-lab">Laboratório</Label>
                <Input id="h-lab" value={r.lab || ''} onChange={(e) => set({ lab: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="h-edoctor">Pedido por</Label>
                <Input id="h-edoctor" value={r.doctor || ''} onChange={(e) => set({ doctor: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
              <div>
                <Label htmlFor="h-result">Resultado</Label>
                <Input id="h-result" value={r.result || ''} onChange={(e) => set({ result: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="h-ref">Referência</Label>
                <Input id="h-ref" value={r.reference || ''} onChange={(e) => set({ reference: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="h-interp">Avaliação</Label>
                <Select
                  id="h-interp"
                  value={r.interpretation || ''}
                  onChange={(e) => set({ interpretation: (e.target.value || undefined) as Exame['interpretation'] })}
                >
                  <option value="">—</option>
                  {Object.entries(INTERPRETATION).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="h-enotes">Observações</Label>
              <Textarea id="h-enotes" rows={2} value={r.notes || ''} onChange={(e) => set({ notes: e.target.value })} />
            </div>
            <div>
              <Label>Arquivo do resultado</Label>
              {r.fileId ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="w-4 h-4 text-stone-500" />
                  <a href={`/api/files/${r.fileId}`} target="_blank" rel="noreferrer" className="text-[#8b1538] hover:underline truncate">
                    {r.fileName || 'arquivo'}
                  </a>
                  <button
                    type="button"
                    onClick={() => set({ fileId: undefined, fileName: undefined } as Partial<Exame>)}
                    className="text-stone-500 hover:text-stone-800 text-[13px]"
                  >
                    remover
                  </button>
                </div>
              ) : (
                <label
                  className={cx(
                    'flex items-center gap-2 h-9 px-3 rounded-md border border-dashed border-stone-300 text-sm text-stone-600 cursor-pointer hover:border-stone-400 w-fit',
                    busy && 'opacity-50 pointer-events-none',
                  )}
                >
                  <Paperclip className="w-4 h-4" />
                  Anexar PDF ou foto (até 3 MB)
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="sr-only"
                    onChange={(e) => attach(e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          </>
        )}

        {error && (
          <p className="text-[13px] text-[#8b1538]" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!valid || busy}>
            {busy ? 'Salvando…' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
