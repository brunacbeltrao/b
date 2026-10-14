const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Local (not UTC) YYYY-MM-DD for a date, defaulting to today
export function toISODate(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

// Monday-first week containing today, shifted by `offset` weeks
export function getWeekDays(offset = 0) {
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  const today = todayISO();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const fullDate = toISODate(d);
    return {
      name: DIAS_SEMANA[d.getDay()],
      fullDate,
      display: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      isToday: fullDate === today,
    };
  });
}

export function formatLongDate(d: Date = new Date()): string {
  const s = d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function formatMonthYear(d: Date = new Date()): string {
  const s = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(' de ', ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function greetingForNow(d: Date = new Date()): string {
  const h = d.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Days from baseDateStr (default: today) until dateStr
export function calculateDaysLeft(dateStr: string, baseDateStr = todayISO()): number {
  try {
    let targetYear = new Date().getFullYear();
    let targetMonth = 0;
    let targetDay = 1;

    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 2) {
        // Format: DD/MM
        targetDay = parseInt(parts[0], 10);
        targetMonth = parseInt(parts[1], 10) - 1;
        targetYear = new Date().getFullYear();
      } else if (parts.length === 3) {
        // Format: DD/MM/YYYY
        targetDay = parseInt(parts[0], 10);
        targetMonth = parseInt(parts[1], 10) - 1;
        targetYear = parseInt(parts[2], 10);
      }
    } else if (dateStr.includes('-')) {
      // Format: YYYY-MM-DD
      const parts = dateStr.split('-');
      targetYear = parseInt(parts[0], 10);
      targetMonth = parseInt(parts[1], 10) - 1;
      targetDay = parseInt(parts[2], 10);
    } else {
      return 0;
    }

    const baseParts = baseDateStr.split('-');
    const baseYear = parseInt(baseParts[0], 10);
    const baseMonth = parseInt(baseParts[1], 10) - 1;
    const baseDay = parseInt(baseParts[2], 10);

    const targetDate = new Date(targetYear, targetMonth, targetDay, 12, 0, 0);
    const baseDate = new Date(baseYear, baseMonth, baseDay, 12, 0, 0);

    const diffMs = targetDate.getTime() - baseDate.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function formatDaysRemainingBadge(daysLeft: number): {
  label: string;
  badgeClass: string;
  isUrgent: boolean;
} {
  if (daysLeft < 0) {
    return {
      label: 'Passado',
      badgeClass: 'bg-stone-100 text-stone-500 border-stone-200',
      isUrgent: false,
    };
  }
  if (daysLeft === 0) {
    return {
      label: 'Hoje!',
      badgeClass: 'bg-rose-500 text-white font-bold animate-pulse shadow-sm',
      isUrgent: true,
    };
  }
  if (daysLeft === 1) {
    return {
      label: 'Amanhã',
      badgeClass: 'bg-amber-500 text-white font-bold shadow-sm',
      isUrgent: true,
    };
  }
  if (daysLeft <= 7) {
    return {
      label: `Faltam ${daysLeft} dias`,
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      isUrgent: true,
    };
  }
  if (daysLeft <= 15) {
    return {
      label: `Faltam ${daysLeft} dias`,
      badgeClass: 'bg-sky-100 text-sky-900 border border-sky-300 font-semibold',
      isUrgent: true,
    };
  }
  return {
    label: `Faltam ${daysLeft} dias`,
    badgeClass: 'bg-stone-100 text-stone-700 border border-stone-200 font-medium',
    isUrgent: false,
  };
}
