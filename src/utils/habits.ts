import type { HabitItem } from '../types';

function shiftDay(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** The last `count` days ending today, oldest first. */
export function lastDays(today: string, count: number) {
  return Array.from({ length: count }, (_, i) => shiftDay(today, i - count + 1));
}

/**
 * Brings a habit up to date for `today`: builds a history for habits saved before
 * history existed (from their streak), then derives today's checkmark and the streak,
 * which counts consecutive days ending today, or yesterday when today isn't done yet.
 */
export function withHabitHistory(habit: HabitItem, today: string): HabitItem {
  let history = habit.history;
  if (!history) {
    const end = habit.completed ? today : shiftDay(today, -1);
    history = Array.from({ length: Math.max(0, habit.streak) }, (_, i) => shiftDay(end, -i));
  }
  history = [...new Set(history)].sort().slice(-120);
  const done = new Set(history);
  let streak = 0;
  let cursor = done.has(today) ? today : shiftDay(today, -1);
  while (done.has(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  return { ...habit, history, completed: done.has(today), streak };
}
