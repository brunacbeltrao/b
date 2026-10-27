import React, { useState } from 'react';
import { Pencil, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HabitItem, SleepLogDay, WorkoutDay } from '../../types';
import { Modal } from '../../fdr/ui/components/Modal';
import { Button, EmptyState, Input, Label, Panel, SectionTabs, Select, cx } from '../ui';

type Tab = 'hoje' | 'treinos' | 'sono';
type Activity = 'musculacao' | 'cardio' | 'alongamento';

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const WEEKDAY_BY_INDEX = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const ACTIVITIES: { key: Activity; label: string; goal: number }[] = [
  { key: 'musculacao', label: 'Musculação', goal: 4 },
  { key: 'cardio', label: 'Cardio', goal: 3 },
  { key: 'alongamento', label: 'Alongamento', goal: 3 },
];

const QUALITY_LABEL: Record<SleepLogDay['quality'], string> = {
  restaurador: 'Restaurador',
  bom: 'Bom',
  regular: 'Regular',
  insuficiente: 'Insuficiente',
};

const HABIT_CATEGORIES = ['Saúde', 'Corpo', 'Intelecto', 'Espiritualidade', 'Autocuidado', 'Foco'];

function hoursLabel(h: number) {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  return `${whole}h${min ? String(min).padStart(2, '0') : ''}`;
}

export const RotinaBemEstarView: React.FC = () => {
  const {
    habits,
    toggleHabit,
    addHabit,
    editHabit,
    deleteHabit,
    workoutWeek,
    toggleWorkoutActivity,
    sleepLogs,
    updateSleepLog,
  } = useApp();
  const [tab, setTab] = useState<Tab>('hoje');
  const [editing, setEditing] = useState<HabitItem | null | 'new'>(null);

  const todayName = WEEKDAY_BY_INDEX[new Date().getDay()];
  const today: WorkoutDay = workoutWeek[todayName] || { musculacao: false };
  const done = habits.filter((h) => h.completed).length;
  const avgSleep = sleepLogs.length ? sleepLogs.reduce((s, l) => s + l.totalHours, 0) / sleepLogs.length : 0;
  const totals = Object.fromEntries(
    ACTIVITIES.map((a) => [a.key, DAYS.filter((d) => workoutWeek[d]?.[a.key]).length]),
  ) as Record<Activity, number>;

  return (
    <div>
      <SectionTabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { id: 'hoje', label: 'Hoje' },
          { id: 'treinos', label: 'Treinos da semana' },
          { id: 'sono', label: 'Sono' },
        ]}
      />

      {tab === 'hoje' && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
          <Panel
            title="Hábitos"
            meta={habits.length ? `${done} de ${habits.length}` : undefined}
            actions={
              <Button size="sm" icon={Plus} onClick={() => setEditing('new')}>
                Novo hábito
              </Button>
            }
          >
            {habits.length === 0 ? (
              <EmptyState>Crie o primeiro hábito que quer acompanhar.</EmptyState>
            ) : (
              <ul className="-mx-2">
                {habits.map((h) => (
                  <li key={h.id} className="group flex items-center gap-3 px-2 py-2 rounded-md hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={h.completed}
                      onChange={() => toggleHabit(h.id)}
                      aria-label={h.name}
                      className="w-4 h-4 accent-[#8b1538] shrink-0 cursor-pointer"
                    />
                    <button onClick={() => toggleHabit(h.id)} className="flex-1 min-w-0 text-left">
                      <div className={cx('text-sm', h.completed ? 'text-stone-500' : 'text-[#1c1a1e]')}>{h.name}</div>
                      <div className="text-xs text-stone-500">{h.category}</div>
                    </button>
                    {h.streak > 0 && (
                      <span className="text-xs text-stone-500 tabular-nums" title="Dias seguidos">
                        {h.streak} dias
                      </span>
                    )}
                    <div className="flex items-center sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100">
                      <button
                        onClick={() => setEditing(h)}
                        aria-label={`Editar ${h.name}`}
                        className="p-1.5 rounded text-stone-400 hover:text-stone-700"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Excluir o hábito "${h.name}"?`)) deleteHabit(h.id);
                        }}
                        aria-label={`Excluir ${h.name}`}
                        className="p-1.5 rounded text-stone-400 hover:text-stone-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="space-y-5">
            <Panel title="Treino de hoje" meta={todayName}>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((a) => {
                  const on = !!today[a.key];
                  return (
                    <button
                      key={a.key}
                      onClick={() => toggleWorkoutActivity(todayName, a.key)}
                      aria-pressed={on}
                      className={cx(
                        'h-9 px-3 rounded-md border text-sm transition-colors',
                        on
                          ? 'bg-[#f7ecef] border-[#ead3da] text-[#6f0f2c] font-medium'
                          : 'bg-white border-[#e6e4e8] text-stone-600 hover:border-stone-300',
                      )}
                    >
                      {on ? '✓ ' : ''}
                      {a.label}
                    </button>
                  );
                })}
              </div>
              {today.notes && <p className="text-[13px] text-stone-600 mt-3">{today.notes}</p>}
            </Panel>

            <Panel title="Sono" meta={sleepLogs.length ? `média ${hoursLabel(avgSleep)}` : undefined}>
              {sleepLogs.length === 0 ? (
                <p className="text-sm text-stone-500">Sem registros.</p>
              ) : (
                <div className="text-sm text-stone-600">
                  Última noite registrada:{' '}
                  <span className="text-[#1c1a1e] font-medium tabular-nums">
                    {hoursLabel(sleepLogs[sleepLogs.length - 1].totalHours)}
                  </span>{' '}
                  ({sleepLogs[sleepLogs.length - 1].bedTime}–{sleepLogs[sleepLogs.length - 1].wakeTime})
                  <button onClick={() => setTab('sono')} className="block mt-2 text-[#8b1538] hover:underline">
                    Ver semana
                  </button>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      {tab === 'treinos' && (
        <Panel
          title="Treinos da semana"
          meta={ACTIVITIES.map((a) => `${a.label} ${totals[a.key]}/${a.goal}`).join(' · ')}
          bodyClassName="!px-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-stone-500 border-b border-[#e6e4e8]">
                  <th className="font-medium px-5 py-2">Dia</th>
                  {ACTIVITIES.map((a) => (
                    <th key={a.key} className="font-medium px-3 py-2 text-center">
                      {a.label}
                    </th>
                  ))}
                  <th className="font-medium px-5 py-2 hidden md:table-cell">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e4e8]">
                {DAYS.map((d) => {
                  const day = workoutWeek[d] || { musculacao: false };
                  const isToday = d === todayName;
                  return (
                    <tr key={d} className={cx(isToday && 'bg-[#fbf7f8]')}>
                      <td className={cx('px-5 py-2.5', isToday ? 'text-[#8b1538] font-medium' : 'text-[#1c1a1e]')}>
                        {d}
                      </td>
                      {ACTIVITIES.map((a) => (
                        <td key={a.key} className="px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={!!day[a.key]}
                            onChange={() => toggleWorkoutActivity(d, a.key)}
                            aria-label={`${a.label} na ${d}`}
                            className="w-4 h-4 accent-[#8b1538] cursor-pointer"
                          />
                        </td>
                      ))}
                      <td className="px-5 py-2.5 text-stone-500 text-[13px] hidden md:table-cell">{day.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'sono' && (
        <Panel title="Sono" meta={sleepLogs.length ? `média ${hoursLabel(avgSleep)} por noite` : undefined} bodyClassName="!px-0">
          {sleepLogs.length === 0 ? (
            <EmptyState>Sem registros de sono.</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-stone-500 border-b border-[#e6e4e8]">
                    <th className="font-medium px-5 py-2">Noite</th>
                    <th className="font-medium px-3 py-2">Dormiu</th>
                    <th className="font-medium px-3 py-2">Acordou</th>
                    <th className="font-medium px-3 py-2 text-right">Total</th>
                    <th className="font-medium px-5 py-2">Qualidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e4e8]">
                  {sleepLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="px-5 py-2 text-[#1c1a1e] whitespace-nowrap">{log.dayName}</td>
                      <td className="px-3 py-2">
                        <Input
                          type="time"
                          value={log.bedTime}
                          onChange={(e) => updateSleepLog(log.id, { bedTime: e.target.value })}
                          className="!h-8 !w-28"
                          aria-label={`Hora de dormir, ${log.dayName}`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Input
                          type="time"
                          value={log.wakeTime}
                          onChange={(e) => updateSleepLog(log.id, { wakeTime: e.target.value })}
                          className="!h-8 !w-28"
                          aria-label={`Hora de acordar, ${log.dayName}`}
                        />
                      </td>
                      <td
                        className={cx(
                          'px-3 py-2 text-right tabular-nums',
                          log.totalHours < 7 ? 'text-[#8b1538] font-medium' : 'text-[#1c1a1e]',
                        )}
                      >
                        {hoursLabel(log.totalHours)}
                      </td>
                      <td className="px-5 py-2">
                        <Select
                          value={log.quality}
                          onChange={(e) => updateSleepLog(log.id, { quality: e.target.value as SleepLogDay['quality'] })}
                          className="!h-8 !w-auto text-[13px]"
                          aria-label={`Qualidade, ${log.dayName}`}
                        >
                          {Object.entries(QUALITY_LABEL).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      <HabitModal
        habit={editing}
        onClose={() => setEditing(null)}
        onSave={(name, category) => {
          if (editing && editing !== 'new') editHabit(editing.id, { name, category });
          else addHabit({ name, category, icon: 'Sparkles', completed: false });
          setEditing(null);
        }}
      />
    </div>
  );
};

const HabitModal: React.FC<{
  habit: HabitItem | null | 'new';
  onClose: () => void;
  onSave: (name: string, category: string) => void;
}> = ({ habit, onClose, onSave }) => {
  const isEdit = habit && habit !== 'new';
  const [name, setName] = useState('');
  const [category, setCategory] = useState(HABIT_CATEGORIES[0]);

  // Reset the form whenever a different habit is opened
  React.useEffect(() => {
    if (habit && habit !== 'new') {
      setName(habit.name);
      setCategory(habit.category);
    } else {
      setName('');
      setCategory(HABIT_CATEGORIES[0]);
    }
  }, [habit]);

  const categories = HABIT_CATEGORIES.includes(category) ? HABIT_CATEGORIES : [category, ...HABIT_CATEGORIES];

  return (
    <Modal aberto={!!habit} aoFechar={onClose} titulo={isEdit ? 'Editar hábito' : 'Novo hábito'} larguraMaxima="max-w-sm">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) onSave(name.trim(), category);
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="hb-name">Nome</Label>
          <Input id="hb-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div>
          <Label htmlFor="hb-cat">Categoria</Label>
          <Select id="hb-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!name.trim()}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
