import React, { useMemo, useState } from 'react';
import { Plus, X, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDaysLeft, todayISO } from '../../utils/dateUtils';
import { lastDays } from '../../utils/habits';
import { DeadlineOrigin, EventCategory } from '../../types';
import { bucketOf, useBills } from '../../bills/api';
import { useGoogleEvents, useGoogleStatus } from '../../google/api';
import { useFdrStore } from '../../fdr/store/useStore';
import { selectAulasDoDia } from '../../fdr/store/selectors';
import { cx } from '../ui';
import { useRecords } from '../../records/useRecords';
import { Assinatura, renewalsDue } from './SubscriptionsSection';
import { useWeekFocus } from './WeeklyReviewView';

const CATEGORY_LABEL: Record<EventCategory, string> = {
  estagio: 'Trabalho',
  lds: 'Liga',
  fdr: 'Faculdade',
  descanso: 'Descanso',
  espiritualidade: 'Espiritualidade',
  pessoal: 'Pessoal',
};

/** Where a deadline comes from; each origin keeps one muted colour across the app */
const ORIGINS: { id: DeadlineOrigin; label: string; dot: string }[] = [
  { id: 'faculdade', label: 'Faculdade', dot: 'bg-[#1c1a1e]' },
  { id: 'liga', label: 'Liga', dot: 'bg-[#8b1538]' },
  { id: 'estagio', label: 'Estágio', dot: 'bg-emerald-600' },
  { id: 'monitoria', label: 'Monitoria', dot: 'bg-sky-700' },
  { id: 'bev', label: 'Bevilaqua', dot: 'bg-amber-600' },
  { id: 'pessoal', label: 'Pessoal', dot: 'bg-stone-400' },
];
const originOf = (id: DeadlineOrigin) => ORIGINS.find((o) => o.id === id)!;

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function relativeDays(days: number): string {
  if (days < 0) return 'Atrasado';
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  return `Em ${days} dias`;
}

/** Accepts YYYY-MM-DD, DD/MM/YYYY or DD/MM and returns e.g. "10 nov" */
function formatShortDate(value: string): string {
  let y: number, m: number, d: number;
  if (value.includes('/')) {
    const parts = value.split('/').map(Number);
    [d, m] = parts;
    y = parts[2] || new Date().getFullYear();
  } else {
    [y, m, d] = value.split('-').map(Number);
  }
  if (!y || !m || !d) return value;
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace(/\.| de/g, '');
}

/** Section wrapper: one white panel per topic, with a plain heading and an optional link */
const Panel: React.FC<{
  title: string;
  meta?: React.ReactNode;
  action?: { label: string; onClick: () => void; navigates?: boolean };
  children: React.ReactNode;
  className?: string;
}> = ({ title, meta, action, children, className = '' }) => (
  <section className={`bg-white border border-[#e6e4e8] rounded-xl ${className}`}>
    <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
      <div className="flex items-baseline gap-2 min-w-0">
        <h2 className="text-[15px] font-semibold text-[#1c1a1e]">{title}</h2>
        {meta && <span className="text-sm text-stone-500 tabular-nums">{meta}</span>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-1 text-sm text-stone-500 hover:text-[#8b1538] shrink-0"
        >
          {action.label}
          {action.navigates !== false && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      )}
    </header>
    <div className="px-5 pb-5">{children}</div>
  </section>
);

function monthTotals(txs: { date: string; type: string; amount: number }[], month: string) {
  const inMonth = txs.filter((t) => t.date.startsWith(month));
  const income = inMonth.filter((t) => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
  const spent = inMonth.filter((t) => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
  return { income, spent, balance: income - spent, count: inMonth.length };
}

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthName(month: string) {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
}

export const CockpitView: React.FC = () => {
  const {
    priorities,
    togglePriority,
    addPriority,
    deletePriority,
    events,
    setCurrentTab,
    toggleHabit,
    habits,
    fdrSubjects,
    ldsSessions,
    books,
    financialTransactions,
    personalDeadlines,
    addPersonalDeadline,
    togglePersonalDeadline,
    deletePersonalDeadline,
  } = useApp();

  const [newPriority, setNewPriority] = useState('');
  const [originFilter, setOriginFilter] = useState<DeadlineOrigin | 'todos'>('todos');
  const [addingDeadline, setAddingDeadline] = useState(false);

  const today = todayISO();
  const now = new Date();

  // Today's agenda: own events, Google Agenda and the Faculdade timetable
  const { status: google } = useGoogleStatus();
  const { events: googleToday } = useGoogleEvents(today, today, !!google?.connected);
  const fdrState = useFdrStore();
  const classesToday = selectAulasDoDia(fdrState, now.getDay(), today);
  const todayEvents = [
    ...events.filter((e) => e.date === today).map((e) => ({ ...e, source: CATEGORY_LABEL[e.category] || e.category })),
    ...googleToday.filter((g) => g.date === today).map((g) => ({ ...g, source: 'Google Agenda' })),
    ...classesToday.map((a) => ({
      id: `aula-${a.id}`,
      title: a.nome,
      time: `${a.horarioInicio} - ${a.horarioFim}`,
      location: a.sala,
      source: 'Aula',
    })),
  ].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const { bills } = useBills();
  const { items: subscriptions } = useRecords<Assinatura>('assinatura');
  const weekFocus = useWeekFocus();
  // Bills due this week and subscriptions about to renew share one panel
  const billsDue = [
    ...bills
      .filter((b) => ['atrasada', 'semana'].includes(bucketOf(b, today)))
      .map((b) => ({ id: b.id, name: b.name, date: b.date, amount: b.amount, renewal: false })),
    ...renewalsDue(subscriptions, today).map((s) => ({ id: s.id, name: s.name, date: s.date, amount: s.amount, renewal: true })),
  ].sort((a, b) => a.date.localeCompare(b.date));
  const openBills = () => {
    try {
      sessionStorage.setItem('bruna_os_finance_section', 'contas');
    } catch {
      // ignore
    }
    setCurrentTab('financeiro');
  };

  const doneCount = priorities.filter((p) => p.completed).length;

  const deadlines = useMemo(() => {
    const items: { id: string; title: string; source: string; date: string; origin: DeadlineOrigin; personal?: boolean }[] = [
      ...(fdrSubjects || []).flatMap((s) => [
        ...(s.exams || [])
          .filter((e) => !e.completed)
          .map((e, i) => ({ id: `ex-${s.id}-${i}`, title: e.title, source: s.name, date: e.date, origin: 'faculdade' as const })),
        ...(s.assignments || [])
          .filter((a) => !a.completed)
          .map((a, i) => ({ id: `as-${s.id}-${i}`, title: a.title, source: s.name, date: a.deadline, origin: 'faculdade' as const })),
        ...(s.fichamentos || [])
          .filter((f) => !f.completed)
          .map((f, i) => ({ id: `fi-${s.id}-${i}`, title: f.title, source: s.name, date: f.deadline, origin: 'faculdade' as const })),
      ]),
      ...(ldsSessions || [])
        .filter((sess) => sess.status !== 'concluida' && !sess.readingDone && sess.fullDate)
        .map((sess) => ({
          id: `lds-${sess.id}`,
          title: `Leitura: ${sess.topic}`,
          source: 'Liga de Societário',
          date: sess.fullDate,
          origin: 'liga' as const,
        })),
      ...personalDeadlines
        .filter((d) => !d.done)
        .map((d) => ({ id: d.id, title: d.title, source: originOf(d.origin).label, date: d.date, origin: d.origin, personal: true })),
    ];
    return items
      .map((item) => ({ ...item, daysLeft: calculateDaysLeft(item.date) }))
      .filter((item) => item.daysLeft >= (item.personal ? -30 : 0))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [fdrSubjects, ldsSessions, personalDeadlines]);

  const usedOrigins = ORIGINS.filter((o) => deadlines.some((d) => d.origin === o.id));
  const visibleDeadlines = deadlines.filter((d) => originFilter === 'todos' || d.origin === originFilter).slice(0, 6);

  // Suggest the closest deadlines as priorities, unless they are already on the list
  const suggestions = deadlines
    .filter((d) => d.daysLeft <= 3)
    .filter((d) => !priorities.some((p) => p.text.toLowerCase().includes(d.title.toLowerCase())))
    .slice(0, 3);

  // Money: always the current month, compared with the previous one
  const month = today.slice(0, 7);
  const finance = useMemo(() => {
    const current = monthTotals(financialTransactions || [], month);
    const previous = monthTotals(financialTransactions || [], shiftMonth(month, -1));
    return { current, previous };
  }, [financialTransactions, month]);
  const spentDelta = finance.previous.spent ? (finance.current.spent - finance.previous.spent) / finance.previous.spent : null;

  const week = lastDays(today, 7);

  const currentBook = books.find((b) => b.status === 'lendo');
  const bookProgress = currentBook
    ? Math.round((currentBook.currentPage / Math.max(1, currentBook.totalPages)) * 100)
    : 0;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriority.trim()) return;
    addPriority(newPriority.trim(), 'executivo');
    setNewPriority('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
      <div className="space-y-5 min-w-0">
        <Panel title="Prioridades" meta={priorities.length ? `${doneCount} de ${priorities.length}` : undefined}>
          {weekFocus.length > 0 && (
            <div className="mb-3 pb-3 border-b border-[#e6e4e8]">
              <div className="text-xs font-medium text-stone-500 mb-1">Foco da semana</div>
              <ol className="space-y-0.5">
                {weekFocus.map((f, i) => (
                  <li key={i} className="text-sm text-[#1c1a1e] leading-snug">
                    <span className="text-stone-400 tabular-nums mr-1.5">{i + 1}.</span>
                    {f}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {priorities.length === 0 && (
            <p className="text-sm text-stone-500 py-1">Nada definido ainda. O que precisa sair hoje?</p>
          )}
          <ul className="-mx-2">
            {priorities.map((p) => (
              <li key={p.id} className="group flex items-start gap-3 px-2 py-2 rounded-md hover:bg-stone-50">
                <input
                  type="checkbox"
                  checked={p.completed}
                  onChange={() => togglePriority(p.id)}
                  aria-label={p.text}
                  className="mt-0.5 w-4 h-4 accent-[#8b1538] shrink-0 cursor-pointer"
                />
                <span
                  onClick={() => togglePriority(p.id)}
                  className={`flex-1 text-sm leading-snug cursor-pointer ${
                    p.completed ? 'line-through text-stone-400' : 'text-[#1c1a1e]'
                  }`}
                >
                  {p.text}
                  {!p.completed && p.date && p.date < today && (
                    <span className="ml-2 text-xs text-stone-500 whitespace-nowrap">
                      desde {calculateDaysLeft(p.date) === -1 ? 'ontem' : formatShortDate(p.date)}
                    </span>
                  )}
                </span>
                <button
                  onClick={() => deletePriority(p.id)}
                  aria-label="Remover prioridade"
                  className="p-0.5 rounded text-stone-400 hover:text-stone-700 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAdd} className="mt-2 flex items-center gap-2">
            <input
              id="new-priority-input"
              type="text"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              placeholder="Adicionar prioridade"
              className="flex-1 h-9 px-3 text-sm rounded-md border border-[#e6e4e8] bg-white focus:outline-none focus:border-[#8b1538]"
            />
            <button
              type="submit"
              disabled={!newPriority.trim()}
              aria-label="Adicionar"
              className="h-9 w-9 flex items-center justify-center rounded-md border border-[#e6e4e8] text-stone-600 hover:text-[#8b1538] hover:border-stone-300 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
          {suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 text-xs text-stone-500 mr-1">
                <Sparkles className="w-3.5 h-3.5" />
                Vence logo:
              </span>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => addPriority(s.title, s.origin === 'faculdade' ? 'academico' : 'executivo')}
                  className="max-w-full truncate h-7 px-2.5 rounded-full border border-[#e6e4e8] text-[13px] text-stone-700 hover:border-[#ead3da] hover:text-[#8b1538]"
                  title={`Adicionar "${s.title}" às prioridades`}
                >
                  + {s.title}
                </button>
              ))}
            </div>
          )}
          {priorities.some((p) => p.completed) && (
            <p className="mt-3 text-xs text-stone-500">As concluídas saem amanhã; as pendentes continuam aqui.</p>
          )}
        </Panel>

        <Panel
          title="Agenda de hoje"
          meta={todayEvents.length ? todayEvents.length : undefined}
          action={{ label: 'Agenda', onClick: () => setCurrentTab('calendario') }}
        >
          {todayEvents.length === 0 ? (
            <p className="text-sm text-stone-500">
              Nenhum compromisso hoje.
              {google && google.configured && !google.connected && (
                <> Conecte o Google em Conta e conexões para ver a sua agenda aqui.</>
              )}
            </p>
          ) : (
            <ol className="divide-y divide-[#e6e4e8]">
              {todayEvents.map((ev) => (
                <li key={ev.id} className="flex gap-4 py-2.5 first:pt-0 last:pb-0">
                  <span className="w-24 shrink-0 text-sm text-stone-500 tabular-nums whitespace-nowrap">
                    {ev.time ? ev.time.replace(/\s*-\s*/, '–') : 'Dia todo'}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#1c1a1e]">{ev.title}</div>
                    <div className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <span>{ev.source}</span>
                      {ev.location && (
                        <>
                          <span aria-hidden>·</span>
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{ev.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        {currentBook && (
          <Panel title="Lendo agora" action={{ label: 'Leituras', onClick: () => setCurrentTab('livros') }}>
            <div className="text-sm font-medium text-[#1c1a1e] leading-snug">{currentBook.title}</div>
            <div className="text-xs text-stone-500 mt-0.5">{currentBook.author}</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div className="h-full bg-[#8b1538] rounded-full" style={{ width: `${bookProgress}%` }} />
              </div>
              <span className="text-xs text-stone-500 tabular-nums">
                {currentBook.currentPage}/{currentBook.totalPages}
              </span>
            </div>
          </Panel>
        )}
      </div>

      <div className="space-y-5 min-w-0">
        {billsDue.length > 0 && (
          <Panel
            title="Contas a vencer"
            meta={billsDue.some((b) => b.amount) ? BRL.format(billsDue.reduce((s, b) => s + (b.amount || 0), 0)) : undefined}
            action={{ label: 'Contas', onClick: openBills }}
          >
            <ul className="space-y-3">
              {billsDue.slice(0, 4).map((b) => {
                const days = calculateDaysLeft(b.date);
                return (
                  <li key={b.id} className="flex items-start gap-3">
                    <div className={`w-16 shrink-0 text-xs font-medium pt-0.5 ${days <= 2 ? 'text-[#8b1538]' : 'text-stone-500'}`}>
                      {days < 0 ? (b.renewal ? 'Renovou' : 'Atrasada') : relativeDays(days)}
                    </div>
                    <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
                      <span className="text-sm text-[#1c1a1e] leading-snug truncate">
                        {b.name}
                        {b.renewal && <span className="ml-1.5 text-xs text-stone-500">renovação</span>}
                      </span>
                      {b.amount ? <span className="text-sm tabular-nums text-stone-600 shrink-0">{BRL.format(b.amount)}</span> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        <Panel
          title="Próximos prazos"
          action={{ label: addingDeadline ? 'Fechar' : 'Novo prazo', onClick: () => setAddingDeadline((v) => !v), navigates: false }}
        >
          {addingDeadline && (
            <NewDeadlineForm
              onSave={(d) => {
                addPersonalDeadline(d);
                setAddingDeadline(false);
              }}
            />
          )}
          {usedOrigins.length > 1 && (
            <div className="flex flex-wrap gap-1 mb-3" aria-label="Filtrar prazos por origem">
              {[{ id: 'todos' as const, label: 'Todos', dot: '' }, ...usedOrigins].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setOriginFilter(o.id)}
                  aria-pressed={originFilter === o.id}
                  className={cx(
                    'flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[13px]',
                    originFilter === o.id
                      ? 'border-[#ead3da] bg-[#f7ecef] text-[#6f0f2c]'
                      : 'border-[#e6e4e8] text-stone-600 hover:border-stone-300',
                  )}
                >
                  {o.dot && <span className={cx('w-1.5 h-1.5 rounded-full', o.dot)} />}
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {visibleDeadlines.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum prazo pela frente.</p>
          ) : (
            <ul className="space-y-3">
              {visibleDeadlines.map((d) => (
                <li key={d.id} className="group flex items-start gap-3">
                  <div
                    className={`w-16 shrink-0 text-xs font-medium pt-0.5 ${
                      d.daysLeft <= 2 ? 'text-[#8b1538]' : 'text-stone-500'
                    }`}
                  >
                    {relativeDays(d.daysLeft)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-[#1c1a1e] leading-snug">{d.title}</div>
                    <div className="text-xs text-stone-500 mt-0.5 truncate flex items-center gap-1.5">
                      <span className={cx('w-1.5 h-1.5 rounded-full shrink-0', originOf(d.origin).dot)} aria-hidden />
                      {d.source} · {formatShortDate(d.date)}
                    </div>
                  </div>
                  {d.personal && (
                    <div className="flex items-center gap-0.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        onClick={() => togglePersonalDeadline(d.id)}
                        className="h-6 px-1.5 rounded text-xs text-stone-500 hover:text-emerald-700 hover:bg-stone-100"
                      >
                        Feito
                      </button>
                      <button
                        onClick={() => deletePersonalDeadline(d.id)}
                        aria-label={`Remover ${d.title}`}
                        className="p-1 rounded text-stone-400 hover:text-stone-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Hábitos"
          meta={habits.length ? `${habits.filter((h) => h.completed).length} de ${habits.length}` : undefined}
          action={{ label: 'Rotina', onClick: () => setCurrentTab('rotina') }}
        >
          {habits.length === 0 ? (
            <p className="text-sm text-stone-500">
              Nenhum hábito ainda.{' '}
              <button onClick={() => setCurrentTab('rotina')} className="text-[#8b1538] hover:underline">
                Criar em Rotina
              </button>
            </p>
          ) : (
            <ul className="-mx-2">
              {habits.slice(0, 6).map((h) => {
                const done = new Set(h.history || []);
                return (
                  <li key={h.id}>
                    <label className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-stone-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={h.completed}
                        onChange={() => toggleHabit(h.id)}
                        className="w-4 h-4 accent-[#8b1538] shrink-0"
                      />
                      <span className={`flex-1 min-w-0 text-sm leading-snug ${h.completed ? 'text-stone-500' : 'text-[#1c1a1e]'}`}>
                        {h.name}
                      </span>
                      <span
                        className="flex items-center gap-0.5 shrink-0"
                        title={`${h.streak} ${h.streak === 1 ? 'dia seguido' : 'dias seguidos'}`}
                        aria-label={`${h.streak} dias seguidos`}
                      >
                        {week.map((d) => (
                          <span
                            key={d}
                            className={cx(
                              'w-1.5 h-3 rounded-sm',
                              done.has(d) ? 'bg-[#8b1538]' : 'bg-stone-200',
                              d === today && !done.has(d) && 'ring-1 ring-stone-300 bg-white',
                            )}
                          />
                        ))}
                      </span>
                      <span className="w-6 text-right text-xs text-stone-500 tabular-nums shrink-0">
                        {h.streak > 0 ? `${h.streak}d` : ''}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Finanças"
          meta={monthName(month)}
          action={{ label: 'Detalhes', onClick: () => setCurrentTab('financeiro') }}
        >
          {finance.current.count === 0 ? (
            <p className="text-sm text-stone-500">
              Nenhum lançamento em {monthName(month)} ainda.
              {finance.previous.count > 0 && (
                <> Em {monthName(shiftMonth(month, -1))} saíram {BRL.format(finance.previous.spent)}.</>
              )}
            </p>
          ) : (
            <>
              <dl className="grid grid-cols-3 gap-3">
                <div>
                  <dt className="text-xs text-stone-500">Entrou</dt>
                  <dd className="text-sm font-medium tabular-nums mt-0.5">{BRL.format(finance.current.income)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Saiu</dt>
                  <dd className="text-sm font-medium tabular-nums mt-0.5">{BRL.format(finance.current.spent)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-500">Saldo</dt>
                  <dd
                    className={`text-sm font-medium tabular-nums mt-0.5 ${
                      finance.current.balance < 0 ? 'text-[#8b1538]' : 'text-emerald-700'
                    }`}
                  >
                    {BRL.format(finance.current.balance)}
                  </dd>
                </div>
              </dl>
              {spentDelta !== null && (
                <p className="mt-3 text-xs text-stone-500">
                  Gastos {spentDelta >= 0 ? `${Math.round(spentDelta * 100)}% acima` : `${Math.round(-spentDelta * 100)}% abaixo`} de{' '}
                  {monthName(shiftMonth(month, -1))} até agora.
                </p>
              )}
            </>
          )}
        </Panel>
      </div>
    </div>
  );
};

const NewDeadlineForm: React.FC<{ onSave: (d: { title: string; date: string; origin: DeadlineOrigin }) => void }> = ({
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO);
  const [origin, setOrigin] = useState<DeadlineOrigin>('estagio');
  const field = 'h-9 px-2.5 text-sm rounded-md border border-[#e6e4e8] bg-white focus:outline-none focus:border-[#8b1538]';
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (title.trim() && date) onSave({ title: title.trim(), date, origin });
      }}
      className="mb-4 space-y-2"
    >
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="O que vence?"
        aria-label="Prazo"
        className={cx(field, 'w-full')}
      />
      <div className="flex gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Data" className={cx(field, 'flex-1 min-w-0')} />
        <select value={origin} onChange={(e) => setOrigin(e.target.value as DeadlineOrigin)} aria-label="Origem" className={cx(field, 'flex-1 min-w-0')}>
          {ORIGINS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={!title.trim()}
          className="h-9 px-3 rounded-md bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-sm font-medium disabled:opacity-50"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};
