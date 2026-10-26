import { todayISO, getWeekDays, formatMonthYear } from '../../utils/dateUtils';
import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EventCategory, CalendarEvent } from '../../types';

export const CalendarView: React.FC = () => {
  const {
    events,
    addEvent,
    deleteEvent,
    categoryFilters,
    toggleCategoryFilter,
  } = useApp();

  const [viewMode, setViewMode] = useState<'semanal' | 'mensal'>('semanal');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState('14:00 - 15:30');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<EventCategory>('fdr');
  const [description, setDescription] = useState('');

  const categoriesConfig: {
    key: EventCategory;
    name: string;
    badgeBg: string;
    textColor: string;
    dotColor: string;
    border: string;
  }[] = [
    {
      key: 'estagio',
      name: 'Trabalho & Projetos Profissionais',
      badgeBg: 'bg-emerald-50',
      textColor: 'text-emerald-800',
      dotColor: 'bg-emerald-600',
      border: 'border-emerald-200',
    },
    {
      key: 'lds',
      name: 'LDS (Grupo Societário FDR 20h)',
      badgeBg: 'bg-[#f7ecef]',
      textColor: 'text-[#8b1538]',
      dotColor: 'bg-[#8b1538]',
      border: 'border-[#ead3da]',
    },
    {
      key: 'fdr',
      name: 'FDR (DPC II, Civil IV, Const II)',
      badgeBg: 'bg-[#f1eff2]',
      textColor: 'text-[#1c1a1e]',
      dotColor: 'bg-[#625d66]',
      border: 'border-[#c7d7e9]',
    },
    {
      key: 'descanso',
      name: 'Descanso & Blindagem (Família & Pausa)',
      badgeBg: 'bg-[#f6efe1]',
      textColor: 'text-[#856123]',
      dotColor: 'bg-[#c89d56]',
      border: 'border-[#ecdcc2]',
    },
    {
      key: 'pessoal',
      name: 'Pessoal (Treinos & Amigos)',
      badgeBg: 'bg-[#f7ecef]',
      textColor: 'text-[#8b1538]',
      dotColor: 'bg-[#c9a3ae]',
      border: 'border-[#ead3da]',
    },
  ];

  // Week offset relative to the current week (0 = this week)
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const weekDays = getWeekDays(weekOffset);
  const weekLabel = `${weekDays[0].display} - ${weekDays[6].display}`;

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    addEvent({
      title: title.trim(),
      date,
      time: time.trim() || undefined,
      location: location.trim() || undefined,
      category,
      description: description.trim() || undefined,
    });
    setIsAddModalOpen(false);
    setTitle('');
    setLocation('');
    setDescription('');
  };

  const filteredEvents = events.filter(e => categoryFilters[e.category]);

  return (
    <div className="space-y-6">
      {/* Control Header: Filters, View Mode & Add Button */}
      <div className="p-5 rounded-2xl bg-white border border-[#e6e4e8] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif-title text-xl font-normal text-[#1c1a1e]">
              Agenda Integrada • {formatMonthYear()}
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Filtre por esferas e organize suas entregas com precisão executiva.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Week Switcher buttons */}
            {viewMode === 'semanal' && (
              <div className="p-1 rounded-lg bg-[#f6f5f7] border border-[#e6e4e8] flex items-center gap-1 text-xs">
                <button
                  onClick={() => setWeekOffset(w => w - 1)}
                  className="px-2 py-1.5 rounded-md font-medium text-stone-500 hover:text-[#1c1a1e] transition-all"
                  aria-label="Semana anterior"
                >
                  ‹
                </button>
                <button
                  onClick={() => setWeekOffset(0)}
                  className={`px-2.5 py-1.5 rounded-md font-medium transition-all ${
                    weekOffset === 0
                      ? 'bg-[#8b1538] text-white shadow-2xs font-semibold'
                      : 'bg-white text-[#1c1a1e] shadow-2xs border border-[#e6e4e8]'
                  }`}
                  title="Voltar para a semana atual"
                >
                  {weekOffset === 0 ? `Esta semana • ${weekLabel}` : weekLabel}
                </button>
                <button
                  onClick={() => setWeekOffset(w => w + 1)}
                  className="px-2 py-1.5 rounded-md font-medium text-stone-500 hover:text-[#1c1a1e] transition-all"
                  aria-label="Próxima semana"
                >
                  ›
                </button>
              </div>
            )}

            {/* Week / Month Switcher */}
            <div className="p-1 rounded-lg bg-[#f6f5f7] border border-[#e6e4e8] flex items-center gap-1 text-xs">
              <button
                onClick={() => setViewMode('semanal')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === 'semanal'
                    ? 'bg-white text-[#1c1a1e] shadow-2xs border border-[#e6e4e8]'
                    : 'text-stone-500 hover:text-[#1c1a1e]'
                }`}
              >
                Visão Semanal
              </button>
              <button
                onClick={() => setViewMode('mensal')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  viewMode === 'mensal'
                    ? 'bg-white text-[#1c1a1e] shadow-2xs border border-[#e6e4e8]'
                    : 'text-stone-500 hover:text-[#1c1a1e]'
                }`}
              >
                Visão Mensal
              </button>
            </div>

            {/* Add Event Button */}
            <button
              id="btn-add-event"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-xs font-semibold shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Evento</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e6e4e8]">
          <span className="text-xs font-medium text-stone-400 flex items-center gap-1.5 mr-1">
            <Filter className="w-3 h-3" />
            Filtros:
          </span>
          {categoriesConfig.map(cat => {
            const isActive = categoryFilters[cat.key];
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategoryFilter(cat.key)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? `${cat.badgeBg} ${cat.textColor} ${cat.border} shadow-2xs`
                    : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? cat.dotColor : 'bg-stone-300'
                  }`}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Week View */}
      {viewMode === 'semanal' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 sm:gap-4">
          {weekDays.map(day => {
            const dayEvents = filteredEvents.filter(e => e.date === day.fullDate);
            const isToday = day.isToday;

            return (
              <div
                key={day.fullDate}
                className={`rounded-2xl border transition-all flex flex-col min-h-0 md:min-h-[400px] shadow-xs ${
                  isToday
                    ? 'bg-[#f6f5f7] to-white border-[#8b1538] ring-1 ring-[#8b1538]/20'
                    : 'bg-white border-[#e6e4e8]'
                }`}
              >
                {/* Day Header */}
                <div
                  className={`p-2.5 sm:p-3 border-b text-center ${
                    isToday
                      ? 'bg-[#f7ecef]/60 border-[#ead3da]'
                      : 'bg-[#f6f5f7] border-[#e6e4e8]'
                  }`}
                >
                  <div className="text-xs font-medium text-stone-400">
                    {day.name}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5">
                    <span
                      className={`text-sm sm:text-base font-serif-title font-bold ${
                        isToday ? 'text-[#8b1538]' : 'text-[#1c1a1e]'
                      }`}
                    >
                      {day.display}
                    </span>
                    {isToday && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-[#8b1538] text-white">
                        Hoje
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Events Container */}
                <div className="p-2 sm:p-2.5 flex-1 space-y-2 overflow-y-auto max-h-[500px]">
                  {dayEvents.length === 0 ? (
                    <div className="py-2.5 md:py-12 text-center text-[11px] text-stone-400 italic">
                      Livre
                    </div>
                  ) : (
                    dayEvents.map(event => {
                      const cfg = categoriesConfig.find(c => c.key === event.category);

                      return (
                        <div
                          key={event.id}
                          className={`group p-2.5 rounded-xl border text-left transition-all relative ${
                            cfg?.badgeBg || 'bg-stone-50'
                          } ${cfg?.border || 'border-stone-200'} shadow-2xs hover:shadow-xs`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cfg?.dotColor || 'bg-stone-400'
                              }`}
                            />
                            {event.time && (
                              <span className="text-[10px] font-semibold text-[#574c44]">
                                {event.time.split('-')[0]?.trim() || event.time}
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-semibold text-[#251f1c] leading-tight line-clamp-2">
                            {event.title}
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-1 text-[10px] text-[#695d55] mt-1 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0 text-stone-400" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                            title="Remover evento"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly View */}
      {viewMode === 'mensal' && (
        <div className="p-6 rounded-2xl bg-white border border-[#e6e4e8] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif-title text-lg font-semibold text-[#1c1a1e]">
              Mês Completo • {formatMonthYear()}
            </h4>
            <div className="text-xs text-[#625d66]">
              Total de {filteredEvents.length} eventos filtrados
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredEvents.map(event => {
              const cfg = categoriesConfig.find(c => c.key === event.category);

              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-xl border ${cfg?.badgeBg || 'bg-stone-50'} ${
                    cfg?.border || 'border-stone-200'
                  } relative group shadow-2xs`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        cfg?.textColor || 'text-stone-700'
                      } bg-white/70 border border-white`}
                    >
                      {(cfg?.name || event.category || '').split('(')[0]?.trim() || event.category}
                    </span>
                    <span className="text-xs font-semibold text-[#625d66]">
                      {event.date ? event.date.split('-').reverse().slice(0, 2).join('/') : ''}
                    </span>
                  </div>

                  <h5 className="text-sm font-semibold text-[#1c1a1e] mb-1">
                    {event.title}
                  </h5>

                  {event.time && (
                    <div className="flex items-center gap-1.5 text-xs text-[#625d66]">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{event.time}</span>
                    </div>
                  )}

                  {event.location && (
                    <div className="flex items-center gap-1.5 text-xs text-[#625d66] mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.description && (
                    <p className="text-xs text-[#625d66] mt-2 italic bg-white/50 p-2 rounded-lg">
                      "{event.description}"
                    </p>
                  )}

                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                    title="Excluir evento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 border border-[#e5dcce] shadow-xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#e6e4e8] pb-3">
              <h3 className="font-serif-title text-xl font-bold text-[#1c1a1e]">
                Novo Compromisso Integrado
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#625d66] mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reunião com cliente INPI ou Prova FDR"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f6f5f7] border border-[#e6e4e8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#625d66] mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f6f5f7] border border-[#e6e4e8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#625d66] mb-1">
                    Horário (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 14:00 - 15:30"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f6f5f7] border border-[#e6e4e8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#625d66] mb-1">
                    Categoria Esfera *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as EventCategory)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f6f5f7] border border-[#e6e4e8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
                  >
                    <option value="fdr">FDR (Azul suave)</option>
                    <option value="lds">LDS (Bordô #8b1538)</option>
                    <option value="descanso">Descanso & Blindagem (Dourado)</option>
                    <option value="estagio">Trabalho & Projetos (Teal)</option>
                    <option value="pessoal">Pessoal / Treinos (Rosa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#625d66] mb-1">
                    Localização
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Biblioteca FDR / Sala 14 / Remoto"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f6f5f7] border border-[#e6e4e8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#625d66] mb-1">
                  Notas / Pauta
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalhes essenciais, pautas ou preparação necessária..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#f6f5f7] border border-[#e6e4e8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#e6e4e8]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#683343] hover:bg-[#522936] text-white shadow-sm"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
