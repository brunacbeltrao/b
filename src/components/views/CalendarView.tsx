import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, MapPin, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CalendarEvent, EventCategory } from '../../types';
import { getWeekDays, todayISO } from '../../utils/dateUtils';
import { Modal } from '../../fdr/ui/components/Modal';
import { Button, EmptyState, Input, Label, Panel, Segmented, Select, Textarea, cx } from '../ui';
import { GOOGLE_CONNECT_URL, createGoogleEvent, useGoogleEvents, useGoogleStatus } from '../../google/api';

/** Categories carry meaning, so they get a small, muted categorical palette (dots only). */
const CATEGORIES: { key: EventCategory; label: string; dot: string }[] = [
  { key: 'fdr', label: 'Faculdade', dot: 'bg-[#1c1a1e]' },
  { key: 'lds', label: 'Liga', dot: 'bg-[#8b1538]' },
  { key: 'estagio', label: 'Trabalho', dot: 'bg-emerald-600' },
  { key: 'pessoal', label: 'Pessoal', dot: 'bg-stone-400' },
  { key: 'descanso', label: 'Descanso', dot: 'bg-amber-500' },
];

const catOf = (key: AgendaItem['category']) => CATEGORIES.find((c) => c.key === key);

/** Local events plus read-only events from Google Agenda (category 'google', with a link back). */
type AgendaItem = Omit<CalendarEvent, 'category'> & { category: EventCategory | 'google'; link?: string };

function addDays(iso: string, days: number) {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function rangeLabel(fromISO: string, toISO: string) {
  const from = parseISO(fromISO);
  const to = parseISO(toISO);
  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString('pt-BR', withMonth ? { day: 'numeric', month: 'short' } : { day: 'numeric' }).replace('.', '').replace(' de', '');
  const sameMonth = from.getMonth() === to.getMonth();
  return `${fmt(from, !sameMonth)} – ${fmt(to, true)} ${to.getFullYear()}`;
}

function longDay(iso: string) {
  const label = parseISO(iso)
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace('-feira', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** The category dot already says FDR/LDS; drop those prefixes and decorative emoji from titles */
function cleanTitle(title: string) {
  return title
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\u{FE0F}?/gu, '')
    .replace(/^\s*(FDR|LDS)\s*[:·•-]\s*/i, '')
    .trim();
}

const byTime = (a: AgendaItem, b: AgendaItem) => (a.time || '').localeCompare(b.time || '');

const EventRow: React.FC<{ event: AgendaItem; onDelete: () => void; compact?: boolean }> = ({
  event,
  onDelete,
  compact,
}) => {
  const cat = catOf(event.category);
  return (
    <div className={cx('group relative flex gap-2', compact ? 'py-1.5' : 'py-2.5')}>
      <span
        className={cx(
          'mt-1.5 w-1.5 h-1.5 rounded-full shrink-0',
          event.category === 'google' ? 'ring-1 ring-stone-500 bg-white' : cat?.dot || 'bg-stone-400',
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 pr-5">
        <div className={cx('text-[#1c1a1e] leading-snug', compact ? 'text-[13px] line-clamp-3' : 'text-sm font-medium')}>
          {cleanTitle(event.title)}
        </div>
        <div className="text-xs text-stone-500 mt-0.5 space-y-0.5">
          {event.time && <div className="tabular-nums">{event.time}</div>}
          {event.location && (
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {!compact && event.description && <p className="text-stone-600">{event.description}</p>}
        </div>
      </div>
      {event.category === 'google' ? (
        event.link && (
          <a
            href={event.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`Abrir ${event.title} no Google Agenda`}
            title="Abrir no Google Agenda"
            className="absolute right-0 top-1.5 p-0.5 rounded text-stone-400 hover:text-stone-700 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )
      ) : (
        <button
          onClick={onDelete}
          aria-label={`Remover ${event.title}`}
          className="absolute right-0 top-1.5 p-0.5 rounded text-stone-400 hover:text-stone-700 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const CalendarView: React.FC = () => {
  const { events, addEvent, deleteEvent, categoryFilters, toggleCategoryFilter } = useApp();
  const [mode, setMode] = useState<'semana' | 'lista'>('semana');
  const [weekOffset, setWeekOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const [showGoogle, setShowGoogle] = useState(true);

  const week = getWeekDays(weekOffset);
  const today = todayISO();

  const { status: google } = useGoogleStatus();
  const googleOn = !!google?.connected;
  const from = week[0].fullDate < today ? week[0].fullDate : today;
  const horizon = addDays(today, 60);
  const to = week[6].fullDate > horizon ? week[6].fullDate : horizon;
  const { events: googleEvents, error: googleError, reload: reloadGoogle } = useGoogleEvents(from, to, googleOn);

  const visible: AgendaItem[] = [
    ...events.filter((e) => categoryFilters[e.category] !== false),
    ...(showGoogle ? googleEvents.map((g) => ({ ...g, category: 'google' as const })) : []),
  ];

  const confirmDelete = (ev: AgendaItem) => {
    if (ev.category === 'google') return;
    if (window.confirm(`Remover "${ev.title}" da agenda?`)) deleteEvent(ev.id);
  };

  const upcoming = visible.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date) || byTime(a, b));
  const upcomingByDay: [string, AgendaItem[]][] = [];
  upcoming.forEach((e) => {
    const last = upcomingByDay[upcomingByDay.length - 1];
    if (last && last[0] === e.date) last[1].push(e);
    else upcomingByDay.push([e.date, [e]]);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {mode === 'semana' && (
            <>
              <div className="flex items-center rounded-md border border-[#e6e4e8] bg-white">
                <button
                  onClick={() => setWeekOffset((w) => w - 1)}
                  aria-label="Semana anterior"
                  className="h-9 w-9 flex items-center justify-center text-stone-600 hover:text-[#1c1a1e]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  disabled={weekOffset === 0}
                  className="h-9 px-2 text-sm border-x border-[#e6e4e8] text-[#1c1a1e] disabled:text-stone-400"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setWeekOffset((w) => w + 1)}
                  aria-label="Próxima semana"
                  className="h-9 w-9 flex items-center justify-center text-stone-600 hover:text-[#1c1a1e]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm font-medium text-[#1c1a1e] tabular-nums">
                {rangeLabel(week[0].fullDate, week[6].fullDate)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: 'semana', label: 'Semana' },
              { value: 'lista', label: 'Próximos' },
            ]}
          />
          <Button id="btn-add-event" variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
            Novo evento
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-5" aria-label="Filtrar por categoria">
        {CATEGORIES.map((c) => {
          const on = categoryFilters[c.key] !== false;
          return (
            <button
              key={c.key}
              onClick={() => toggleCategoryFilter(c.key)}
              aria-pressed={on}
              className={cx(
                'flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[13px] transition-colors',
                on ? 'bg-white border-[#e6e4e8] text-[#1c1a1e]' : 'border-transparent text-stone-400 line-through',
              )}
            >
              <span className={cx('w-1.5 h-1.5 rounded-full', on ? c.dot : 'bg-stone-300')} />
              {c.label}
            </button>
          );
        })}
        {googleOn && (
          <button
            onClick={() => setShowGoogle((v) => !v)}
            aria-pressed={showGoogle}
            className={cx(
              'flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[13px] transition-colors',
              showGoogle ? 'bg-white border-[#e6e4e8] text-[#1c1a1e]' : 'border-transparent text-stone-400 line-through',
            )}
          >
            <span className={cx('w-1.5 h-1.5 rounded-full ring-1 bg-white', showGoogle ? 'ring-stone-500' : 'ring-stone-300')} />
            Google Agenda
          </button>
        )}
      </div>

      {google?.configured && !google.connected && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg bg-white border border-[#e6e4e8] text-sm">
          <span className="text-stone-700">Traga os eventos do seu Google Agenda para cá.</span>
          <a
            href={GOOGLE_CONNECT_URL}
            className="h-8 px-3 inline-flex items-center rounded-md bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-[13px] font-medium"
          >
            Conectar Google
          </a>
        </div>
      )}

      {googleError && (
        <p className="mb-4 text-[13px] text-amber-800" role="status">
          {googleError}
        </p>
      )}

      {mode === 'semana' ? (
        <>
          {/* Desktop: seven columns */}
          <div className="hidden md:grid grid-cols-7 bg-white border border-[#e6e4e8] rounded-xl overflow-hidden divide-x divide-[#e6e4e8]">
            {week.map((day) => {
              const dayEvents = visible.filter((e) => e.date === day.fullDate).sort(byTime);
              return (
                <div key={day.fullDate} className={cx('min-h-[420px] flex flex-col', day.isToday && 'bg-[#fbf7f8]')}>
                  <div className="px-3 pt-3 pb-2 border-b border-[#e6e4e8]">
                    <div className="text-xs text-stone-500">{day.name}</div>
                    <div
                      className={cx(
                        'mt-0.5 inline-flex items-center justify-center min-w-7 h-7 -ml-1 px-1 rounded-full text-sm font-semibold tabular-nums',
                        day.isToday ? 'bg-[#8b1538] text-white' : 'text-[#1c1a1e]',
                      )}
                    >
                      {Number(day.display.split('/')[0])}
                    </div>
                  </div>
                  <div className="px-3 py-1 flex-1 divide-y divide-[#e6e4e8]">
                    {dayEvents.map((ev) => (
                      <EventRow key={ev.id} event={ev} compact onDelete={() => confirmDelete(ev)} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile: one list, every day of the week */}
          <div className="md:hidden bg-white border border-[#e6e4e8] rounded-xl divide-y divide-[#e6e4e8]">
            {week.map((day) => {
              const dayEvents = visible.filter((e) => e.date === day.fullDate).sort(byTime);
              return (
                <div key={day.fullDate} className="px-4 py-3">
                  <div className={cx('text-sm font-medium', day.isToday ? 'text-[#8b1538]' : 'text-[#1c1a1e]')}>
                    {day.name}, {Number(day.display.split('/')[0])}
                    {day.isToday && <span className="ml-1.5 text-xs font-normal text-stone-500">hoje</span>}
                  </div>
                  {dayEvents.length === 0 ? (
                    <div className="text-[13px] text-stone-400 mt-0.5">Livre</div>
                  ) : (
                    <div className="divide-y divide-[#e6e4e8]">
                      {dayEvents.map((ev) => (
                        <EventRow key={ev.id} event={ev} onDelete={() => confirmDelete(ev)} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <Panel bodyClassName="!pt-2">
          {upcomingByDay.length === 0 ? (
            <EmptyState>Nenhum compromisso daqui para frente.</EmptyState>
          ) : (
            <div className="divide-y divide-[#e6e4e8]">
              {upcomingByDay.map(([date, items]) => (
                <div key={date} className="py-3 sm:grid sm:grid-cols-[180px_1fr] sm:gap-4">
                  <div className={cx('text-sm font-medium pt-2.5', date === today ? 'text-[#8b1538]' : 'text-[#1c1a1e]')}>
                    {longDay(date)}
                  </div>
                  <div className="divide-y divide-[#e6e4e8]">
                    {items.map((ev) => (
                      <EventRow key={ev.id} event={ev} onDelete={() => confirmDelete(ev)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

      <NewEventModal
        open={modalOpen}
        googleOn={googleOn}
        onClose={() => setModalOpen(false)}
        onSave={async (ev, toGoogle, start, end) => {
          if (toGoogle) {
            await createGoogleEvent({ title: ev.title, date: ev.date, start, end, location: ev.location, description: ev.description });
            reloadGoogle();
          } else {
            addEvent(ev);
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
};

const NewEventModal: React.FC<{
  open: boolean;
  googleOn: boolean;
  onClose: () => void;
  onSave: (ev: Omit<CalendarEvent, 'id'>, toGoogle: boolean, start?: string, end?: string) => Promise<void>;
}> = ({ open, googleOn, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('fdr');
  const [description, setDescription] = useState('');
  const [toGoogle, setToGoogle] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || saving) return;
    setSaving(true);
    setError('');
    try {
      await onSave(
        {
          title: title.trim(),
          date,
          time: start ? (end ? `${start} - ${end}` : start) : undefined,
          location: location.trim() || undefined,
          category,
          description: description.trim() || undefined,
        },
        googleOn && toGoogle,
        start || undefined,
        end || undefined,
      );
    } catch (err) {
      setError((err as Error).message);
      return;
    } finally {
      setSaving(false);
    }
    setTitle('');
    setStart('');
    setEnd('');
    setLocation('');
    setDescription('');
  };

  return (
    <Modal aberto={open} aoFechar={onClose} titulo="Novo evento" larguraMaxima="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="ev-title">Título</Label>
          <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-[1fr_7rem_7rem] gap-3">
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="ev-date">Data</Label>
            <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ev-start">Início</Label>
            <Input id="ev-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ev-end">Fim</Label>
            <Input id="ev-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="ev-cat">Categoria</Label>
            <Select id="ev-cat" value={category} onChange={(e) => setCategory(e.target.value as EventCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="ev-loc">Local</Label>
            <Input id="ev-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <div>
          <Label htmlFor="ev-desc">Notas</Label>
          <Textarea id="ev-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {googleOn && (
          <label className="flex items-start gap-2 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={toGoogle}
              onChange={(e) => setToGoogle(e.target.checked)}
              className="mt-0.5 accent-[#8b1538]"
            />
            <span>
              Salvar no Google Agenda
              <span className="block text-xs text-stone-500">Aparece no celular e nos lembretes do Google.</span>
            </span>
          </label>
        )}
        {error && <p className="text-[13px] text-amber-800">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!title.trim() || saving}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
