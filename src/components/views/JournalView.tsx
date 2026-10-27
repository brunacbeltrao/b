import React, { useEffect, useMemo, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Modal } from '../../fdr/ui/components/Modal';
import { BaseRecord, daysUntil, newId, shortDate, todayLocal, useRecords } from '../../records/useRecords';
import { Button, EmptyState, Input, Label, Panel, SectionTabs, Select, Tag, Textarea, cx } from '../ui';

export interface DiaryEntry extends BaseRecord {
  kind: 'diario';
  date: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  text?: string;
  prompt?: string;
  answer?: string;
}

export interface Decisao extends BaseRecord {
  kind: 'decisao';
  date: string;
  title: string;
  context?: string;
  options?: string;
  choice?: string;
  reasoning?: string;
  expected?: string;
  reviewOn?: string;
  outcome?: string;
  verdict?: 'acertei' | 'em-parte' | 'errei';
}

const MOODS: { value: DiaryEntry['mood']; label: string }[] = [
  { value: 1, label: 'Péssimo' },
  { value: 2, label: 'Ruim' },
  { value: 3, label: 'Ok' },
  { value: 4, label: 'Bom' },
  { value: 5, label: 'Ótimo' },
];

const PROMPTS = [
  'O que deu certo hoje e por quê?',
  'O que você faria diferente se pudesse refazer o dia?',
  'Pelo que você é grata hoje?',
  'O que drenou mais a sua energia?',
  'Qual conversa ficou na sua cabeça?',
  'O que você aprendeu hoje que quer lembrar?',
  'O que está te preocupando, e o que está sob o seu controle?',
  'De que você se orgulha hoje, mesmo que pequeno?',
  'O que você está adiando, e qual é o primeiro passo?',
  'Quem te ajudou hoje, ou quem você ajudou?',
];

function promptFor(day: string, shift = 0) {
  const n = day.split('-').reduce((s, p) => s + Number(p), 0);
  return PROMPTS[(n + shift) % PROMPTS.length];
}

function longDay(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).replace('-feira', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export const JournalView: React.FC = () => {
  const [section, setSection] = useState<'diario' | 'decisoes'>('diario');
  return (
    <div>
      <SectionTabs
        value={section}
        onChange={setSection}
        tabs={[
          { id: 'diario', label: 'Diário' },
          { id: 'decisoes', label: 'Decisões' },
        ]}
      />
      {section === 'diario' ? <Diary /> : <Decisions />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Diary: one entry per day
// ---------------------------------------------------------------------------
const Diary: React.FC = () => {
  const { items, loading, error, save } = useRecords<DiaryEntry>('diario');
  const [day, setDay] = useState(todayLocal);
  const existing = items.find((e) => e.date === day);
  const [draft, setDraft] = useState<DiaryEntry>(() => ({ id: `diario-${day}`, kind: 'diario', date: day }));
  const [promptShift, setPromptShift] = useState(0);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    setDraft(existing || { id: `diario-${day}`, kind: 'diario', date: day });
    setPromptShift(0);
    setStatus('idle');
  }, [day, existing?.id, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const prompt = draft.prompt || promptFor(day, promptShift);
  const past = useMemo(() => [...items].filter((e) => e.date !== day).sort((a, b) => b.date.localeCompare(a.date)), [items, day]);
  const streak = useMemo(() => {
    const days = new Set(items.map((e) => e.date));
    let count = 0;
    const cursor = new Date();
    if (!days.has(todayLocal())) cursor.setDate(cursor.getDate() - 1);
    for (;;) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
      if (!days.has(iso)) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [items]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await save({ ...draft, prompt: draft.answer ? prompt : undefined });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
      <Panel
        title={day === todayLocal() ? 'Hoje' : longDay(day)}
        meta={streak > 1 ? `${streak} dias seguidos` : undefined}
        actions={<Input type="date" value={day} max={todayLocal()} onChange={(e) => e.target.value && setDay(e.target.value)} className="w-auto" aria-label="Dia" />}
      >
        {loading ? (
          <p className="text-sm text-stone-500">Carregando…</p>
        ) : error ? (
          <p className="text-sm text-amber-800">{error}</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Como foi o dia?</Label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, mood: d.mood === m.value ? undefined : m.value }))}
                    aria-pressed={draft.mood === m.value}
                    className={cx(
                      'h-8 px-3 rounded-full border text-[13px]',
                      draft.mood === m.value ? 'border-[#ead3da] bg-[#f7ecef] text-[#6f0f2c] font-medium' : 'border-[#e6e4e8] text-stone-600 hover:border-stone-300',
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="diary-text">Em poucas linhas</Label>
              <Textarea id="diary-text" rows={4} value={draft.text || ''} onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))} />
            </div>
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label htmlFor="diary-answer" className="text-[13px] font-medium text-stone-700">
                  {prompt}
                </label>
                {!draft.answer && (
                  <button
                    type="button"
                    onClick={() => setPromptShift((s) => s + 1)}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-[#8b1538] shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Outra pergunta
                  </button>
                )}
              </div>
              <Textarea id="diary-answer" rows={3} value={draft.answer || ''} onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))} />
            </div>
            <div className="flex items-center justify-end gap-3">
              {status === 'saved' && <span className="text-[13px] text-emerald-700">Salvo</span>}
              {status === 'error' && <span className="text-[13px] text-amber-800">Não foi possível salvar.</span>}
              <Button type="submit" variant="primary" disabled={status === 'saving' || (!draft.text && !draft.answer && !draft.mood)}>
                Salvar
              </Button>
            </div>
          </form>
        )}
      </Panel>

      <Panel title="Dias anteriores" meta={past.length || undefined}>
        {past.length === 0 ? (
          <p className="text-sm text-stone-500">Os dias que você registrar aparecem aqui.</p>
        ) : (
          <ul className="divide-y divide-[#e6e4e8] -mt-2">
            {past.slice(0, 30).map((e) => (
              <li key={e.id}>
                <button onClick={() => setDay(e.date)} className="w-full text-left py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#1c1a1e]">{longDay(e.date)}</span>
                    {e.mood && <span className="text-xs text-stone-500">{MOODS.find((m) => m.value === e.mood)?.label}</span>}
                  </div>
                  {(e.text || e.answer) && <p className="text-[13px] text-stone-600 line-clamp-2 mt-0.5">{e.text || e.answer}</p>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Decision log
// ---------------------------------------------------------------------------
const Decisions: React.FC = () => {
  const { items, loading, error, save, remove } = useRecords<Decisao>('decisao');
  const [editing, setEditing] = useState<Decisao | null>(null);
  const today = todayLocal();
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  const toReview = sorted.filter((d) => d.reviewOn && !d.verdict && daysUntil(d.reviewOn, today) <= 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-stone-600 max-w-prose">
          Anote as decisões importantes com o raciocínio da época. Na data de revisão, volte e veja se a lógica se sustentou.
        </p>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            const review = new Date();
            review.setMonth(review.getMonth() + 3);
            setEditing({
              id: newId('dec'),
              kind: 'decisao',
              date: today,
              title: '',
              reviewOn: `${review.getFullYear()}-${String(review.getMonth() + 1).padStart(2, '0')}-${String(review.getDate()).padStart(2, '0')}`,
            });
          }}
        >
          Nova decisão
        </Button>
      </div>

      {toReview.length > 0 && (
        <Panel title="Hora de revisar" meta={toReview.length} className="mb-5" bodyClassName="!pt-0">
          <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
            {toReview.map((d) => (
              <li key={d.id}>
                <button onClick={() => setEditing(d)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left">
                  <span className="text-sm font-medium text-[#1c1a1e] truncate">{d.title}</span>
                  <span className="text-xs text-stone-500 shrink-0">decidido em {shortDate(d.date)}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel bodyClassName="!pt-2">
        {loading ? (
          <p className="text-sm text-stone-500 py-3">Carregando…</p>
        ) : error ? (
          <p className="text-sm text-amber-800 py-3">{error}</p>
        ) : sorted.length === 0 ? (
          <EmptyState>Nenhuma decisão registrada. Comece pela próxima escolha de estágio, projeto ou abordagem.</EmptyState>
        ) : (
          <ul className="divide-y divide-[#e6e4e8]">
            {sorted.map((d) => (
              <li key={d.id}>
                <button onClick={() => setEditing(d)} className="w-full text-left py-3 sm:grid sm:grid-cols-[120px_1fr] sm:gap-4">
                  <div className="text-xs text-stone-500 pt-0.5">{shortDate(d.date)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#1c1a1e]">{d.title}</span>
                      {d.verdict && (
                        <Tag tone={d.verdict === 'acertei' ? 'success' : d.verdict === 'errei' ? 'brand' : 'neutral'}>
                          {d.verdict === 'acertei' ? 'acertei' : d.verdict === 'errei' ? 'errei' : 'em parte'}
                        </Tag>
                      )}
                    </div>
                    {d.choice && <div className="text-[13px] text-stone-700 mt-0.5">Escolha: {d.choice}</div>}
                    {d.reasoning && <p className="text-[13px] text-stone-500 line-clamp-2 mt-0.5">{d.reasoning}</p>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {editing && (
        <DecisionModal
          key={editing.id}
          item={editing}
          isNew={!items.some((i) => i.id === editing.id)}
          onClose={() => setEditing(null)}
          onSave={async (d) => {
            await save(d);
            setEditing(null);
          }}
          onDelete={async () => {
            if (!window.confirm(`Excluir "${editing.title}"?`)) return;
            await remove(editing);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

const DecisionModal: React.FC<{
  item: Decisao;
  isNew: boolean;
  onClose: () => void;
  onSave: (d: Decisao) => Promise<void>;
  onDelete: () => Promise<void>;
}> = ({ item, isNew, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Decisao>) => setDraft((d) => ({ ...d, ...patch }));
  const reviewing = !isNew && !!draft.reviewOn && daysUntil(draft.reviewOn) <= 0;
  const area = (id: keyof Decisao, label: string, placeholder: string, rows = 2) => (
    <div>
      <Label htmlFor={`dec-${id}`}>{label}</Label>
      <Textarea
        id={`dec-${id}`}
        rows={rows}
        value={(draft[id] as string) || ''}
        onChange={(e) => set({ [id]: e.target.value || undefined } as Partial<Decisao>)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <Modal aberto aoFechar={onClose} titulo={isNew ? 'Nova decisão' : 'Decisão'} larguraMaxima="max-w-lg">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.title.trim()) return;
          setBusy(true);
          try {
            await onSave({ ...draft, title: draft.title.trim() });
          } finally {
            setBusy(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="dec-title">Decisão</Label>
          <Input id="dec-title" autoFocus={isNew} value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex.: Estágio no escritório A ou B" />
        </div>
        {area('context', 'Contexto', 'O que estava acontecendo, o que estava em jogo')}
        {area('options', 'Opções consideradas', 'Uma por linha')}
        <div>
          <Label htmlFor="dec-choice">O que você escolheu</Label>
          <Input id="dec-choice" value={draft.choice || ''} onChange={(e) => set({ choice: e.target.value || undefined })} />
        </div>
        {area('reasoning', 'Por quê', 'O raciocínio de hoje, com os prós e contras que pesaram', 3)}
        {area('expected', 'O que você espera que aconteça', 'Para comparar depois')}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dec-date">Data</Label>
            <Input id="dec-date" type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="dec-review">Revisar em</Label>
            <Input id="dec-review" type="date" value={draft.reviewOn || ''} onChange={(e) => set({ reviewOn: e.target.value || undefined })} />
          </div>
        </div>
        {(reviewing || draft.outcome || draft.verdict) && (
          <div className="space-y-3 pt-3 border-t border-[#e6e4e8]">
            <div className="text-[13px] font-medium text-stone-700">Revisão</div>
            {area('outcome', 'O que aconteceu de fato', 'Compare com o que você esperava', 3)}
            <div>
              <Label htmlFor="dec-verdict">Olhando hoje</Label>
              <Select id="dec-verdict" value={draft.verdict || ''} onChange={(e) => set({ verdict: (e.target.value || undefined) as Decisao['verdict'] })}>
                <option value="">—</option>
                <option value="acertei">A lógica se sustentou</option>
                <option value="em-parte">Em parte</option>
                <option value="errei">Eu decidiria diferente</option>
              </Select>
            </div>
          </div>
        )}
        <div className={cx('flex items-center gap-2 pt-1', isNew ? 'justify-end' : 'justify-between')}>
          {!isNew && (
            <Button variant="danger" onClick={onDelete}>
              Excluir
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!draft.title.trim() || busy}>
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
