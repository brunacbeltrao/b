import React, { useMemo, useState } from 'react';
import { Plus, X, ArrowRight, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDaysLeft, todayISO } from '../../utils/dateUtils';
import { EventCategory } from '../../types';
import { bucketOf, useBills } from '../../bills/api';
import { useGoogleEvents, useGoogleStatus } from '../../google/api';

const CATEGORY_LABEL: Record<EventCategory, string> = {
  estagio: 'Trabalho',
  lds: 'Liga',
  fdr: 'Faculdade',
  descanso: 'Descanso',
  espiritualidade: 'Espiritualidade',
  pessoal: 'Pessoal',
};

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function relativeDays(days: number): string {
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

export const CockpitView: React.FC = () => {
  const {
    priorities,
    togglePriority,
    addPriority,
    deletePriority,
    events,
    quickNote,
    setQuickNote,
    setCurrentTab,
    toggleHabit,
    habits,
    fdrSubjects,
    ldsSessions,
    books,
    financialTransactions,
  } = useApp();

  const [newPriority, setNewPriority] = useState('');
  const [copied, setCopied] = useState(false);

  const today = todayISO();
  const { status: google } = useGoogleStatus();
  const { events: googleToday } = useGoogleEvents(today, today, !!google?.connected);
  const todayEvents = [
    ...events.filter((e) => e.date === today).map((e) => ({ ...e, source: CATEGORY_LABEL[e.category] || e.category })),
    ...googleToday.filter((g) => g.date === today).map((g) => ({ ...g, source: 'Google Agenda' })),
  ].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const { bills } = useBills();
  const billsDue = bills
    .filter((b) => ['atrasada', 'semana'].includes(bucketOf(b, today)))
    .sort((a, b) => a.date.localeCompare(b.date));
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
    const items = [
      ...(fdrSubjects || []).flatMap((s) => [
        ...(s.exams || [])
          .filter((e) => !e.completed)
          .map((e) => ({ title: e.title, source: s.name, date: e.date })),
        ...(s.assignments || [])
          .filter((a) => !a.completed)
          .map((a) => ({ title: a.title, source: s.name, date: a.deadline })),
        ...(s.fichamentos || [])
          .filter((f) => !f.completed)
          .map((f) => ({ title: f.title, source: s.name, date: f.deadline })),
      ]),
      ...(ldsSessions || [])
        .filter((sess) => sess.status !== 'concluida' && !sess.readingDone && sess.fullDate)
        .map((sess) => ({ title: `Leitura: ${sess.topic}`, source: 'Liga de Societário', date: sess.fullDate })),
    ];
    return items
      .map((item) => ({ ...item, daysLeft: calculateDaysLeft(item.date) }))
      .filter((item) => item.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  }, [fdrSubjects, ldsSessions]);

  // Money: the most recent month that has entries, so the panel never shows an empty month as zero
  const finance = useMemo(() => {
    if (!financialTransactions?.length) return null;
    const latest = [...financialTransactions].sort((a, b) => b.date.localeCompare(a.date))[0].date.slice(0, 7);
    const month = financialTransactions.filter((t) => t.date.startsWith(latest));
    const income = month.filter((t) => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const spent = month.filter((t) => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const [y, m] = latest.split('-').map(Number);
    const label = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' });
    return { income, spent, balance: income - spent, label };
  }, [financialTransactions]);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(quickNote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">
      <div className="space-y-5 min-w-0">
        <Panel title="Prioridades" meta={priorities.length ? `${doneCount} de ${priorities.length}` : undefined}>
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
              className="h-9 w-9 flex items-center justify-center rounded-md border border-[#e6e4e8] text-stone-600 hover:border-stone-300 disabled:opacity-40"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </Panel>

        <Panel
          title="Agenda de hoje"
          meta={todayEvents.length ? todayEvents.length : undefined}
          action={{ label: 'Agenda', onClick: () => setCurrentTab('calendario') }}
        >
          {todayEvents.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum compromisso hoje.</p>
          ) : (
            <ol className="divide-y divide-[#e6e4e8]">
              {todayEvents.map((ev) => (
                <li key={ev.id} className="flex gap-4 py-2.5 first:pt-0 last:pb-0">
                  <span className="w-24 shrink-0 text-sm text-stone-500 tabular-nums">{ev.time || 'Dia todo'}</span>
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

        <Panel
          title="Anotações"
          action={quickNote ? { label: copied ? 'Copiado' : 'Copiar', onClick: handleCopy, navigates: false } : undefined}
        >
          <textarea
            id="quick-capture-input"
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            rows={5}
            placeholder="Ideias, lembretes, o que não pode esquecer…"
            className="w-full p-3 text-sm leading-relaxed rounded-md border border-[#e6e4e8] bg-white resize-y focus:outline-none focus:border-[#8b1538]"
          />
        </Panel>
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
                      {days < 0 ? 'Atrasada' : relativeDays(days)}
                    </div>
                    <div className="min-w-0 flex-1 flex items-baseline justify-between gap-2">
                      <span className="text-sm text-[#1c1a1e] leading-snug truncate">{b.name}</span>
                      {b.amount ? <span className="text-sm tabular-nums text-stone-600 shrink-0">{BRL.format(b.amount)}</span> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        <Panel title="Próximos prazos" action={{ label: 'Faculdade', onClick: () => setCurrentTab('fdr') }}>
          {deadlines.length === 0 ? (
            <p className="text-sm text-stone-500">Nenhum prazo pela frente.</p>
          ) : (
            <ul className="space-y-3">
              {deadlines.map((d, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div
                    className={`w-16 shrink-0 text-xs font-medium pt-0.5 ${
                      d.daysLeft <= 2 ? 'text-[#8b1538]' : 'text-stone-500'
                    }`}
                  >
                    {relativeDays(d.daysLeft)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-[#1c1a1e] leading-snug">{d.title}</div>
                    <div className="text-xs text-stone-500 mt-0.5 truncate">
                      {d.source} · {formatShortDate(d.date)}
                    </div>
                  </div>
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
          <ul className="-mx-2">
            {habits.slice(0, 6).map((h) => (
              <li key={h.id}>
                <label className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={h.completed}
                    onChange={() => toggleHabit(h.id)}
                    className="w-4 h-4 accent-[#8b1538] shrink-0"
                  />
                  <span className={`flex-1 text-sm ${h.completed ? 'text-stone-500' : 'text-[#1c1a1e]'}`}>{h.name}</span>
                  {h.streak > 0 && <span className="text-xs text-stone-500 tabular-nums">{h.streak}d</span>}
                </label>
              </li>
            ))}
          </ul>
        </Panel>

        {finance && (
          <Panel title="Finanças" meta={finance.label} action={{ label: 'Detalhes', onClick: () => setCurrentTab('financeiro') }}>
            <dl className="grid grid-cols-3 gap-3">
              <div>
                <dt className="text-xs text-stone-500">Entrou</dt>
                <dd className="text-sm font-medium tabular-nums mt-0.5">{BRL.format(finance.income)}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Saiu</dt>
                <dd className="text-sm font-medium tabular-nums mt-0.5">{BRL.format(finance.spent)}</dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Saldo</dt>
                <dd
                  className={`text-sm font-medium tabular-nums mt-0.5 ${
                    finance.balance < 0 ? 'text-[#8b1538]' : 'text-emerald-700'
                  }`}
                >
                  {BRL.format(finance.balance)}
                </dd>
              </div>
            </dl>
          </Panel>
        )}

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
    </div>
  );
};
