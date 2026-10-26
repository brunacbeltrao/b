import React, { useState } from 'react';
import {
  HeartPulse,
  Dumbbell,
  Trophy,
  Droplets,
  Moon,
  BookOpen,
  Sparkles,
  BellOff,
  Heart,
  CheckCircle2,
  Circle,
  Plus,
  Minus,
  Flame,
  Activity,
  BedDouble,
  Sunrise,
  Sunset,
  Clock,
  Calendar,
  Check,
  Trash2,
  Edit3,
  X,
  Footprints,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkoutDay, HabitItem } from '../../types';

type RoutineTab = 'hoje' | 'esportes' | 'sono';

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

  const [activeTab, setActiveTab] = useState<RoutineTab>('hoje');
  const [selectedSportDay, setSelectedSportDay] = useState<string>('Sábado');

  // Habit modal state
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [habitName, setHabitName] = useState('');
  const [habitCategory, setHabitCategory] = useState('Saúde');
  const [habitIcon, setHabitIcon] = useState('Sparkles');

  const daysOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  // Calculate totals
  const workoutDays = Object.values(workoutWeek) as WorkoutDay[];
  const totalMusculacao = workoutDays.filter(d => d.musculacao).length;
  const totalCardio = workoutDays.filter(d => d.cardio).length;
  const totalAlongamento = workoutDays.filter(d => d.alongamento).length;
  const totalWorkouts = workoutDays.filter(d => d.musculacao || d.cardio || d.alongamento).length;

  const completedHabits = habits.filter(h => h.completed).length;
  const habitPercentage = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0;

  // Sleep metrics
  const totalSleepHoursWeek = sleepLogs.reduce((acc, curr) => acc + curr.totalHours, 0);
  const avgSleepHours = sleepLogs.length > 0 ? (totalSleepHoursWeek / sleepLogs.length).toFixed(1) : '0.0';

  const todayWorkout = workoutWeek['Sábado'] || { musculacao: false, cardio: false, alongamento: false, notes: '' };

  const getHabitIcon = (iconName: string) => {
    switch (iconName) {
      case 'Moon':
        return <Moon className="w-4 h-4 text-[#8b1538]" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-amber-700" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-[#c9a3ae]" />;
      case 'SmartphoneOff':
      case 'BellOff':
        return <BellOff className="w-4 h-4 text-purple-600" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'Dumbbell':
        return <Dumbbell className="w-4 h-4 text-emerald-600" />;
      case 'Footprints':
        return <Footprints className="w-4 h-4 text-teal-600" />;
      default:
        return <Heart className="w-4 h-4 text-rose-500" />;
    }
  };

  const handleOpenAddHabit = () => {
    setEditingHabitId(null);
    setHabitName('');
    setHabitCategory('Saúde');
    setHabitIcon('Sparkles');
    setIsHabitModalOpen(true);
  };

  const handleOpenEditHabit = (habit: HabitItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHabitId(habit.id);
    setHabitName(habit.name);
    setHabitCategory(habit.category);
    setHabitIcon(habit.icon);
    setIsHabitModalOpen(true);
  };

  const handleDeleteHabit = (habitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Deseja excluir este hábito?')) {
      deleteHabit(habitId);
    }
  };

  const handleSaveHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    if (editingHabitId) {
      editHabit(editingHabitId, {
        name: habitName.trim(),
        category: habitCategory,
        icon: habitIcon,
      });
    } else {
      addHabit({
        name: habitName.trim(),
        category: habitCategory,
        icon: habitIcon,
        completed: false,
      });
    }

    setIsHabitModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Bem-Estar */}
      <div className="rounded-2xl bg-[#f7ecef] p-5 sm:p-6 border border-[#e6e4e8] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 border border-[#e6e4e8] text-[11px] text-[#8b1538] font-semibold">
              <HeartPulse className="w-3.5 h-3.5 text-[#8b1538]" />
              <span>Saúde, Vitalidade & Disciplina Pessoal</span>
            </div>
            <h1 className="font-serif-title text-2xl sm:text-3xl font-normal text-[#1c1a1e] tracking-tight">
              Rotina & Bem-Estar
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-sans-ui leading-relaxed">
              O corpo sustenta a mente executiva e acadêmica. Acompanhamento diário simplificado dos treinos, sono e rituais não negociáveis.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="px-3.5 py-2.5 rounded-xl bg-white/95 border border-[#e6e4e8] text-center shadow-2xs">
              <div className="text-lg font-serif-title font-bold text-[#8b1538]">
                {completedHabits}/{habits.length}
              </div>
              <div className="text-xs font-medium text-stone-400">
                Hábitos ({habitPercentage}%)
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-white/95 border border-[#e6e4e8] text-center shadow-2xs">
              <div className="text-lg font-serif-title font-bold text-emerald-700">
                {totalWorkouts} / 5
              </div>
              <div className="text-xs font-medium text-stone-400">
                Treinos Semana
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-[#c9a3ae]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tabs de Navegação da Rotina (Simplificada & Organizada) */}
      <div className="flex gap-2 p-1 bg-[#f5efe6] rounded-2xl w-full sm:w-fit overflow-x-auto border border-[#e8ded2]">
        <button
          onClick={() => setActiveTab('hoje')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'hoje'
              ? 'bg-white text-[#8b1538] shadow-2xs ring-1 ring-black/5'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Hoje & Rituais</span>
        </button>

        <button
          onClick={() => setActiveTab('esportes')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'esportes'
              ? 'bg-white text-[#8b1538] shadow-2xs ring-1 ring-black/5'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Esportes Semanal ({totalMusculacao}/4)</span>
        </button>

        <button
          onClick={() => setActiveTab('sono')}
          className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
            activeTab === 'sono'
              ? 'bg-white text-[#8b1538] shadow-2xs ring-1 ring-black/5'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BedDouble className="w-3.5 h-3.5" />
          <span>Sono ({avgSleepHours}h/dia)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: HOJE & RITUAIS (VISÃO PRÁTICA E IMEDIATA) */}
      {/* ========================================================================= */}
      {activeTab === 'hoje' && (
        <div className="space-y-6">
          {/* Card: Treino de Hoje com 1 Clique */}
          <div className="rounded-2xl bg-white p-5 border border-[#e6e4e8] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b1538]" />
                <h3 className="font-serif-title text-lg font-bold text-[#1c1a1e]">
                  Atividades Físicas de Hoje (Sábado)
                </h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f7ecef] text-[#8b1538] font-semibold">
                Toque para marcar/desmarcar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Musculação */}
              <button
                onClick={() => toggleWorkoutActivity('Sábado', 'musculacao')}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  todayWorkout.musculacao
                    ? 'bg-[#8b1538] text-white border-[#8b1538] shadow-xs'
                    : 'bg-[#f6f5f7] text-stone-700 border-stone-200 hover:border-[#8b1538]/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Dumbbell className="w-5 h-5" />
                  <div>
                    <div className="text-xs font-bold">Musculação</div>
                    <div className={`text-[10px] ${todayWorkout.musculacao ? 'text-white/80' : 'text-stone-400'}`}>
                      {todayWorkout.musculacao ? 'Treino realizado ✓' : 'Pendente hoje'}
                    </div>
                  </div>
                </div>
                {todayWorkout.musculacao ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-300" />
                )}
              </button>

              {/* Cardio / Caminhada */}
              <button
                onClick={() => toggleWorkoutActivity('Sábado', 'cardio')}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  todayWorkout.cardio
                    ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                    : 'bg-[#f6f5f7] text-stone-700 border-stone-200 hover:border-teal-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Footprints className="w-5 h-5" />
                  <div>
                    <div className="text-xs font-bold">Cardio / Caminhada</div>
                    <div className={`text-[10px] ${todayWorkout.cardio ? 'text-white/80' : 'text-stone-400'}`}>
                      {todayWorkout.cardio ? 'Realizado hoje ✓' : 'Pendente'}
                    </div>
                  </div>
                </div>
                {todayWorkout.cardio ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-300" />
                )}
              </button>

              {/* Alongamento / Mobilidade */}
              <button
                onClick={() => toggleWorkoutActivity('Sábado', 'alongamento')}
                className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  todayWorkout.alongamento
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-[#f6f5f7] text-stone-700 border-stone-200 hover:border-amber-500/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5" />
                  <div>
                    <div className="text-xs font-bold">Alongamento & Mobilidade</div>
                    <div className={`text-[10px] ${todayWorkout.alongamento ? 'text-white/80' : 'text-stone-400'}`}>
                      {todayWorkout.alongamento ? 'Sessão concluída ✓' : 'Não realizado'}
                    </div>
                  </div>
                </div>
                {todayWorkout.alongamento ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <Circle className="w-4 h-4 text-stone-300" />
                )}
              </button>
            </div>
          </div>

          {/* Grid: Hábitos Não Negociáveis & Hidratação */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Checklist de Hábitos Não Negociáveis (8 cols) */}
            <section
              id="habitos-nao-negociaveis"
              className="lg:col-span-8 rounded-2xl bg-white p-5 sm:p-6 border border-[#e6e4e8] shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6e4e8] pb-3">
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#1c1a1e]">
                    Hábitos & Rituais Diários
                  </h3>
                  <p className="text-xs text-[#625d66]">
                    Você tem total liberdade para criar, personalizar e gerenciar seus hábitos.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#8b1538] font-semibold bg-[#f7ecef] px-2.5 py-1 rounded-full">
                    {completedHabits} de {habits.length} cumpridos
                  </span>
                  <button
                    onClick={handleOpenAddHabit}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8b1538] hover:bg-[#733e4f] text-white text-xs font-semibold shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Hábito</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {habits.map(habit => (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      habit.completed
                        ? 'bg-[#f7ecef] border-[#ecd5dd] shadow-2xs'
                        : 'bg-white border-[#eee6dc] hover:border-[#e6e4e8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-stone-300 shrink-0">
                        {habit.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#8b1538] fill-[#f7ecef]" />
                        ) : (
                          <Circle className="w-5 h-5 text-stone-300 hover:text-stone-500" />
                        )}
                      </button>

                      <div className="p-1.5 rounded-lg bg-[#f6f5f7] border border-[#e6e4e8] shrink-0">
                        {getHabitIcon(habit.icon)}
                      </div>

                      <div>
                        <h4
                          className={`text-xs font-semibold ${
                            habit.completed ? 'text-[#8b1538] font-bold line-through' : 'text-[#2b2521]'
                          }`}
                        >
                          {habit.name}
                        </h4>
                        <span className="text-[10px] text-stone-400 font-sans-ui">
                          {habit.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-[#625d66] bg-[#f6f5f7] border border-[#e6e4e8] px-2 py-0.5 rounded-full shrink-0">
                        <Flame className="w-3 h-3 fill-[#625d66]" />
                        <span>{habit.streak}d</span>
                      </div>

                      <button
                        onClick={e => handleOpenEditHabit(habit, e)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                        title="Editar Hábito"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={e => handleDeleteHabit(habit.id, e)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Excluir Hábito"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sono & Descanso Reparador (4 cols) */}
            <section
              id="card-sono-hoje"
              className="lg:col-span-4 rounded-2xl bg-white p-5 sm:p-6 border border-[#e6e4e8] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#e6e4e8] pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif-title text-base font-bold text-[#1c1a1e]">
                        Descanso & Sono
                      </h3>
                      <p className="text-[11px] text-[#625d66]">Meta: 7h30+ de sono</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('sono')}
                    className="text-[10px] text-indigo-700 hover:underline font-semibold"
                  >
                    Ver Tudo →
                  </button>
                </div>

                {/* Big Counter */}
                <div className="text-center py-3.5 bg-[#f5f6fc] rounded-xl border border-[#dfe2f5] space-y-1">
                  <div className="text-3xl font-serif-title font-bold text-[#2d3278]">
                    7h 45m
                  </div>
                  <div className="text-xs font-semibold text-indigo-700">
                    Sono Reparador Registrado
                  </div>
                  <div className="w-4/5 mx-auto bg-indigo-100 h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: '92%' }}
                    />
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-2 pt-3 text-xs text-stone-600">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f6f5f7]">
                    <span className="text-stone-500">Horário Dormir:</span>
                    <span className="font-semibold text-stone-800">23:00</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f6f5f7]">
                    <span className="text-stone-500">Horário Despertar:</span>
                    <span className="font-semibold text-stone-800">06:45</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#f6f5f7]">
                    <span className="text-stone-500">Qualidade Sentida:</span>
                    <span className="font-semibold text-emerald-700">Excelente (5/5)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <button
                  onClick={() => setActiveTab('sono')}
                  className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-bold text-xs transition-colors"
                >
                  Registrar Diário de Sono
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: ESPORTES & TREINOS SEMANAL (GRADE INTUITIVA) */}
      {/* ========================================================================= */}
      {activeTab === 'esportes' && (
        <section
          id="tracker-esportes-semanal"
          className="rounded-2xl bg-white p-5 sm:p-6 border border-[#e6e4e8] shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6e4e8] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-xl font-bold text-[#1c1a1e]">
                  Cronograma Semanal de Treinos
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f7ecef] text-[#8b1538] font-semibold">
                  Semana 36 • 2026
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Clique nos botões de cada dia para alternar o status dos treinos e atividades físicas.
              </p>
            </div>

            {/* Sports goals badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="px-2.5 py-1 rounded-lg bg-[#f7ecef] border border-[#ecdbe2] text-[#8b1538] font-semibold flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Musculação: {totalMusculacao}/4 dias</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#f0f8ef] border border-[#d6ebd5] text-teal-800 font-semibold flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5" />
                <span>Cardio / Caminhada: {totalCardio}/3 dias</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-[#f6f5f7] border border-[#fae4c9] text-amber-800 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Alongamento & Mobilidade: {totalAlongamento}/3 dias</span>
              </div>
            </div>
          </div>

          {/* Weekly Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {daysOrder.map(day => {
              const dayData = workoutWeek[day] || { musculacao: false, cardio: false, alongamento: false };
              const isToday = day === 'Sábado';

              return (
                <div
                  key={day}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isToday
                      ? 'bg-[#f7ecef] border-[#8b1538] ring-1 ring-[#8b1538]/30 shadow-xs'
                      : 'bg-white border-[#ebe2d6] hover:border-[#e6e4e8]'
                  }`}
                >
                  <div className="border-b border-stone-100 pb-1.5 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-[#8b1538]' : 'text-[#1c1a1e]'}`}>
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[#8b1538] text-white">
                        Hoje
                      </span>
                    )}
                  </div>

                  {/* 3 Activities Toggles */}
                  <div className="space-y-1.5">
                    {/* Musculação */}
                    <button
                      onClick={() => toggleWorkoutActivity(day, 'musculacao')}
                      className={`w-full p-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                        dayData.musculacao
                          ? 'bg-[#8b1538] text-white shadow-2xs'
                          : 'bg-[#f6f5f7] text-stone-600 hover:bg-[#f3edf0]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5" />
                        <span>Musculação</span>
                      </span>
                      {dayData.musculacao && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>

                    {/* Cardio */}
                    <button
                      onClick={() => toggleWorkoutActivity(day, 'cardio')}
                      className={`w-full p-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                        dayData.cardio
                          ? 'bg-teal-700 text-white shadow-2xs'
                          : 'bg-[#f6f5f7] text-stone-600 hover:bg-[#eaf4ea]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Footprints className="w-3.5 h-3.5" />
                        <span>Cardio</span>
                      </span>
                      {dayData.cardio && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>

                    {/* Alongamento */}
                    <button
                      onClick={() => toggleWorkoutActivity(day, 'alongamento')}
                      className={`w-full p-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
                        dayData.alongamento
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-[#f6f5f7] text-stone-600 hover:bg-[#faefe1]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span>Alongamento</span>
                      </span>
                      {dayData.alongamento && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </button>
                  </div>

                  {/* Day notes */}
                  {dayData.notes && (
                    <div className="text-[10px] text-stone-500 italic bg-[#f6f5f7] p-1.5 rounded-md leading-tight">
                      {dayData.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: SONO & RITMO CIRCADIANO (ORGANIZADO) */}
      {/* ========================================================================= */}
      {activeTab === 'sono' && (
        <section
          id="tracker-sono-circadiano"
          className="rounded-2xl bg-white p-5 sm:p-6 border border-[#e6e4e8] shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e6e4e8] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-100">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-title text-xl font-bold text-[#1c1a1e]">
                    Ritmo Circadiano & Sono
                  </h2>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                    Semanal
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Horários de dormir, despertar e total de horas dormidas na semana.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="px-3 py-2 rounded-xl bg-indigo-50/70 border border-indigo-100 text-right">
                <div className="text-[11px] text-stone-500">Média Diária:</div>
                <div className="text-sm font-serif-title font-bold text-indigo-900">
                  {avgSleepHours}h / noite
                </div>
              </div>
              <div className="px-3 py-2 rounded-xl bg-[#f6f5f7] border border-[#e6e4e8] text-right">
                <div className="text-[11px] text-stone-500">Total na Semana:</div>
                <div className="text-sm font-serif-title font-bold text-[#8b1538]">
                  {totalSleepHoursWeek.toFixed(1)}h dormidas
                </div>
              </div>
            </div>
          </div>

          {/* 7 Days Sleep Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {sleepLogs.map(log => {
              const isToday = log.dayOfWeek === 'Sábado';
              return (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                    isToday
                      ? 'bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs'
                      : 'bg-[#f6f5f7]/60 border-stone-200/80 hover:bg-white'
                  }`}
                >
                  <div className="border-b border-stone-200/60 pb-1 flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-indigo-900' : 'text-stone-800'}`}>
                      {log.dayOfWeek}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {log.date.slice(8)}/09
                    </span>
                  </div>

                  {/* Sleep & Wake Times inputs */}
                  <div className="space-y-2 text-xs">
                    <div className="space-y-0.5">
                      <label className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                        <Sunset className="w-3 h-3 text-indigo-500" /> Dormir:
                      </label>
                      <input
                        type="time"
                        value={log.bedTime}
                        onChange={e => updateSleepLog(log.id, { bedTime: e.target.value })}
                        className="w-full px-2 py-1 text-xs font-mono font-medium rounded-lg bg-white border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                        <Sunrise className="w-3 h-3 text-amber-500" /> Acordar:
                      </label>
                      <input
                        type="time"
                        value={log.wakeTime}
                        onChange={e => updateSleepLog(log.id, { wakeTime: e.target.value })}
                        className="w-full px-2 py-1 text-xs font-mono font-medium rounded-lg bg-white border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Total Hours Badge & Quality */}
                  <div className="pt-2 border-t border-stone-200/60 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] text-stone-500">Total:</span>
                      <span className="font-serif-title font-bold text-sm text-indigo-950">
                        {log.totalHours}h
                      </span>
                    </div>

                    <select
                      value={log.quality}
                      onChange={e => updateSleepLog(log.id, { quality: e.target.value as any })}
                      className={`w-full text-[10px] font-bold uppercase rounded-lg px-1.5 py-0.5 border focus:outline-hidden ${
                        log.quality === 'excelente'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : log.quality === 'bom'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : log.quality === 'regular'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      <option value="excelente">Excelente</option>
                      <option value="bom">Bom</option>
                      <option value="regular">Regular</option>
                      <option value="insuficiente">Insuficiente</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modal: Criar / Editar Hábito */}
      {isHabitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif-title text-lg font-bold text-[#1c1a1e]">
                {editingHabitId ? 'Editar Hábito' : 'Novo Hábito Personalizado'}
              </h3>
              <button
                onClick={() => setIsHabitModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHabit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome do Hábito
                </label>
                <input
                  type="text"
                  placeholder="Ex: Leitura diária, Caminhada matinal, Meditação..."
                  value={habitName}
                  onChange={e => setHabitName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={habitCategory}
                    onChange={e => setHabitCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
                  >
                    <option value="Saúde">Saúde</option>
                    <option value="Intelecto">Intelecto</option>
                    <option value="Autocuidado">Autocuidado</option>
                    <option value="Mente">Mente</option>
                    <option value="Organização">Organização</option>
                    <option value="Rotina">Rotina</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ícone Representativo
                  </label>
                  <select
                    value={habitIcon}
                    onChange={e => setHabitIcon(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
                  >
                    <option value="Sparkles">Brilho / Autocuidado</option>
                    <option value="Heart">Coração / Saúde</option>
                    <option value="Moon">Lua / Sono</option>
                    <option value="Droplets">Cuidado / Hidratação</option>
                    <option value="BookOpen">Livro / Estudo</option>
                    <option value="Dumbbell">Halter / Treino</option>
                    <option value="Footprints">Passos / Caminhada</option>
                    <option value="Flame">Chama / Disciplina</option>
                    <option value="SmartphoneOff">Offline / Descompressão</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsHabitModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-[#8b1538] hover:bg-[#723c4d] text-white rounded-xl shadow-xs transition-colors"
                >
                  {editingHabitId ? 'Salvar Alterações' : 'Criar Hábito'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
