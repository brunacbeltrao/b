import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useBills } from '../../bills/api';
import { BaseRecord, todayLocal, useRecords } from '../../records/useRecords';
import type { DiaryEntry } from './JournalView';
import { BRL, Button, Input, Label, Panel, Textarea, cx } from '../ui';

export interface Revisao extends BaseRecord {
  kind: 'revisao';
  date: string; // Monday of the reviewed week
  wentWell?: string;
  change?: string;
  nextPriorities: string[];
  energy?: 1 | 2 | 3 | 4 | 5;
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function weekStart(dayIso: string) {
  const [y, m, d] = dayIso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const offset = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - offset);
  return iso(date);
}

export function addDays(dayIso: string, days: number) {
  const [y, m, d] = dayIso.split('-').map(Number);
  return iso(new Date(y, m - 1, d + days));
}

/** The week being reviewed: on Sunday (and Monday morning) that's the week ending, otherwise the current one. */
function defaultWeek() {
  const now = new Date();
  const today = todayLocal();
  if (now.getDay() === 1 && now.getHours() < 12) return weekStart(addDays(today, -1));
  return weekStart(today);
}

function rangeLabel(start: string) {
  const fmt = (dIso: string) => {
    const [y, m, d] = dIso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace(/\.| de/g, '');
  };
  return `${fmt(start)} – ${fmt(addDays(start, 6))}`;
}

/** Next week's three priorities from the latest review, for the Hoje page. */
export function useWeekFocus() {
  const { items } = useRecords<Revisao>('revisao');
  const current = weekStart(todayLocal());
  const previous = addDays(current, -7);
  // The review written at the end of last week sets this week's focus
  const review = items.find((r) => r.date === previous) || items.find((r) => r.date === current);
  return (review?.nextPriorities || []).filter(Boolean);
}

export const WeeklyReviewView: React.FC = () => {
  const { priorityLog, financialTransactions, habits, personalDeadlines, addPriority } = useApp();
  const { bills } = useBills();
  const reviews = useRecords<Revisao>('revisao');
  const diary = useRecords<DiaryEntry>('diario');
  const [start, setStart] = useState(defaultWeek);
  const end = addDays(start, 6);
  const inWeek = (d?: string) => !!d && d >= start && d <= end;
  const today = todayLocal();

  const existing = reviews.items.find((r) => r.date === start);
  const blank = (): Revisao => ({ id: `revisao-${start}`, kind: 'revisao', date: start, nextPriorities: ['', '', ''] });
  const [draft, setDraft] = useState<Revisao>(blank);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [sentToToday, setSentToToday] = useState(false);

  useEffect(() => {
    setDraft(existing ? { ...existing, nextPriorities: [...existing.nextPriorities, '', '', ''].slice(0, 3) } : blank());
    setStatus('idle');
    setSentToToday(false);
  }, [start, existing?.id, reviews.loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const summary = useMemo(() => {
    const done = priorityLog.filter((p) => inWeek(p.completedOn));
    const spent = financialTransactions.filter((t) => t.type === 'despesa' && inWeek(t.date));
    const spentTotal = spent.reduce((s, t) => s + t.amount, 0);
    const byCategory: Record<string, number> = {};
    spent.forEach((t) => (byCategory[t.category] = (byCategory[t.category] || 0) + t.amount));
    const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const lastDay = end < today ? end : today;
    const daysElapsed = Math.max(1, Math.min(7, Math.round((new Date(lastDay).getTime() - new Date(start).getTime()) / 86_400_000) + 1));
    const habitRows = habits.map((h) => ({
      name: h.name,
      count: (h.history || []).filter((d) => inWeek(d)).length,
    }));
    const late = [
      ...personalDeadlines.filter((d) => !d.done && d.date <= (end < today ? end : today) && d.date >= addDays(start, -30)).map((d) => d.title),
      ...bills.filter((b) => b.status !== 'paga' && b.date && b.date < today && b.date <= end).map((b) => `Conta: ${b.name}`),
    ];
    const diaryDays = diary.items.filter((e) => inWeek(e.date));
    const moods = diaryDays.map((e) => e.mood).filter(Boolean) as number[];
    return {
      done,
      spentTotal,
      topCategories,
      habitRows,
      daysElapsed,
      late,
      diaryCount: diaryDays.length,
      mood: moods.length ? moods.reduce((s, v) => s + v, 0) / moods.length : null,
    };
  }, [priorityLog, financialTransactions, habits, personalDeadlines, bills, diary.items, start]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      await reviews.save({ ...draft, nextPriorities: draft.nextPriorities.map((p) => p.trim()).filter(Boolean) });
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  const moodLabel = (v: number) => ['Péssima', 'Ruim', 'Ok', 'Boa', 'Ótima'][Math.round(v) - 1];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center rounded-md border border-[#e6e4e8] bg-white">
          <button onClick={() => setStart((s) => addDays(s, -7))} aria-label="Semana anterior" className="h-9 w-9 flex items-center justify-center text-stone-600 hover:text-[#1c1a1e]">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setStart(defaultWeek())} className="h-9 px-2 text-sm border-x border-[#e6e4e8] text-[#1c1a1e]">
            Esta semana
          </button>
          <button
            onClick={() => setStart((s) => addDays(s, 7))}
            disabled={addDays(start, 7) > today}
            aria-label="Próxima semana"
            className="h-9 w-9 flex items-center justify-center text-stone-600 hover:text-[#1c1a1e] disabled:text-stone-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <span className="text-sm font-medium text-[#1c1a1e]">{rangeLabel(start)}</span>
        {existing && <span className="text-xs text-stone-500">revisão salva</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-5 items-start">
        <div className="space-y-5 min-w-0">
          <Panel title="Concluído" meta={summary.done.length || undefined}>
            {summary.done.length === 0 ? (
              <p className="text-sm text-stone-500">Nenhuma prioridade marcada como feita nesta semana.</p>
            ) : (
              <ul className="space-y-1.5">
                {summary.done.map((p, i) => (
                  <li key={i} className="text-sm text-[#1c1a1e] leading-snug">
                    · {p.text}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Atrasou" meta={summary.late.length || undefined}>
            {summary.late.length === 0 ? (
              <p className="text-sm text-stone-500">Nada atrasado.</p>
            ) : (
              <ul className="space-y-1.5">
                {summary.late.map((t, i) => (
                  <li key={i} className="text-sm text-[#8b1538] leading-snug">
                    · {t}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Gastos da semana" meta={BRL.format(summary.spentTotal)}>
            {summary.topCategories.length === 0 ? (
              <p className="text-sm text-stone-500">Nenhuma saída lançada.</p>
            ) : (
              <ul className="space-y-1.5">
                {summary.topCategories.map(([cat, total]) => (
                  <li key={cat} className="flex justify-between gap-3 text-sm">
                    <span className="text-[#1c1a1e]">{cat}</span>
                    <span className="tabular-nums text-stone-600">{BRL.format(total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Hábitos" meta={`${summary.daysElapsed} ${summary.daysElapsed === 1 ? 'dia' : 'dias'}`}>
            {summary.habitRows.length === 0 ? (
              <p className="text-sm text-stone-500">Nenhum hábito cadastrado.</p>
            ) : (
              <ul className="space-y-2">
                {summary.habitRows.map((h) => (
                  <li key={h.name} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 min-w-0 truncate text-[#1c1a1e]">{h.name}</span>
                    <span className="w-24 h-1.5 rounded-full bg-stone-100 overflow-hidden shrink-0">
                      <span className="block h-full bg-[#8b1538] rounded-full" style={{ width: `${(h.count / summary.daysElapsed) * 100}%` }} />
                    </span>
                    <span className="w-10 text-right tabular-nums text-stone-600 text-xs">
                      {h.count}/{summary.daysElapsed}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {summary.diaryCount > 0 && (
              <p className="mt-3 text-xs text-stone-500">
                Diário em {summary.diaryCount} {summary.diaryCount === 1 ? 'dia' : 'dias'}
                {summary.mood !== null && ` · semana ${moodLabel(summary.mood)!.toLowerCase()} em média`}
              </p>
            )}
          </Panel>
        </div>

        <Panel title="Sua revisão">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="rev-well">O que funcionou</Label>
              <Textarea id="rev-well" rows={3} value={draft.wentWell || ''} onChange={(e) => setDraft((d) => ({ ...d, wentWell: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="rev-change">O que mudar na próxima semana</Label>
              <Textarea id="rev-change" rows={3} value={draft.change || ''} onChange={(e) => setDraft((d) => ({ ...d, change: e.target.value }))} />
            </div>
            <div>
              <Label>Energia da semana</Label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, energy: d.energy === v ? undefined : (v as Revisao['energy']) }))}
                    aria-pressed={draft.energy === v}
                    aria-label={`Energia ${v} de 5`}
                    className={cx(
                      'h-8 w-9 rounded-md border text-sm tabular-nums',
                      draft.energy === v ? 'border-[#ead3da] bg-[#f7ecef] text-[#6f0f2c] font-medium' : 'border-[#e6e4e8] text-stone-600',
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Três prioridades da próxima semana</Label>
              <div className="space-y-2">
                {draft.nextPriorities.map((p, i) => (
                  <Input
                    key={i}
                    value={p}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, nextPriorities: d.nextPriorities.map((x, j) => (j === i ? e.target.value : x)) }))
                    }
                    placeholder={`${i + 1}.`}
                    aria-label={`Prioridade ${i + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 mt-1.5">Elas aparecem no topo de Hoje durante a próxima semana.</p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {status === 'saved' && <span className="text-[13px] text-emerald-700 mr-auto">Revisão salva</span>}
              {status === 'error' && <span className="text-[13px] text-amber-800 mr-auto">Não foi possível salvar.</span>}
              {draft.nextPriorities.some((p) => p.trim()) && (
                <Button
                  disabled={sentToToday}
                  onClick={() => {
                    draft.nextPriorities.filter((p) => p.trim()).forEach((p) => addPriority(p.trim(), 'executivo'));
                    setSentToToday(true);
                  }}
                >
                  {sentToToday ? 'Enviadas para Hoje' : 'Pôr em Hoje agora'}
                </Button>
              )}
              <Button type="submit" variant="primary" disabled={status === 'saving'}>
                Salvar revisão
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
};
