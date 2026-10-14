import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Sun,
  Flame,
  BookOpen,
  Briefcase,
  Copy,
  Check,
  Wallet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateDaysLeft, todayISO } from '../../utils/dateUtils';

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
    spirituality,
    toggleHabit,
    habits,
    fdrSubjects,
    ldsSessions,
    books,
  } = useApp();

  const [newPriorityText, setNewPriorityText] = useState('');
  const [copiedNote, setCopiedNote] = useState(false);
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);

  const todayStr = todayISO();
  const todayEvents = events.filter(e => e.date === todayStr);

  const handleAddPriority = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityText.trim()) return;
    addPriority(newPriorityText, 'executivo');
    setNewPriorityText('');
  };

  const handleCopyNote = () => {
    navigator.clipboard.writeText(quickNote);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const completedPrioritiesCount = priorities.filter(p => p.completed).length;
  
  // Dynamic computation of next academic delivery (Exams, Assignments, Fichamentos or LDS Pre-class Study)
  const allAcademicDeliveries = [
    ...(fdrSubjects || []).flatMap(s => [
      ...(s.exams || []).filter(e => !e.completed).map(e => ({
        subject: s.name,
        title: e.title,
        date: e.date,
        daysLeft: calculateDaysLeft(e.date),
        type: e.weight ? `Prova Oficial • Peso ${e.weight}` : 'Prova Oficial',
        categoryTag: 'FDR 5º SEM',
      })),
      ...(s.assignments || []).filter(a => !a.completed).map(a => ({
        subject: s.name,
        title: a.title,
        date: a.deadline,
        daysLeft: calculateDaysLeft(a.deadline),
        type: 'Caso Prático / Parecer',
        categoryTag: 'FDR 5º SEM',
      })),
      ...(s.fichamentos || []).filter(f => !f.completed).map(f => ({
        subject: s.name,
        title: f.title,
        date: f.deadline,
        daysLeft: calculateDaysLeft(f.deadline),
        type: 'Fichamento Doutrinário',
        categoryTag: 'FDR 5º SEM',
      })),
    ]),
    ...(ldsSessions || [])
      .filter(sess => sess.status !== 'concluida' && !sess.readingDone)
      .map(sess => {
        const fullDate = sess.fullDate || (sess.date.includes('/') ? `2026-${sess.date.split('/')[1]}-${sess.date.split('/')[0]}` : sess.date);
        return {
          subject: 'Liga de Direito Societário (LDS)',
          title: `Estudo Pré-Aula: ${sess.topic}`,
          date: sess.date,
          daysLeft: calculateDaysLeft(fullDate),
          type: 'Leitura Prévia Obrigatória',
          categoryTag: 'LDS SOCIETÁRIO',
        };
      }),
  ].sort((a, b) => a.daysLeft - b.daysLeft);

  const nextAcademicItem = allAcademicDeliveries[0] || {
    subject: 'Direito Processual Civil II',
    title: '1ª Avaliação Oficial (DPC II)',
    date: '29/09/2026',
    daysLeft: 24,
    type: 'P1 Oficial (8.0 pts)',
    categoryTag: 'FDR 5º SEM',
  };

  // Category tags for High Density
  const categoryBadgeStyles = (cat: string) => {
    switch (cat) {
      case 'lds':
        return 'bg-[#fce4e4] text-[#8b1538] border-[#f3ccd1]';
      case 'fdr':
        return 'bg-[#e7eef6] text-[#2c4e74] border-[#cddbe8]';
      case 'pessoal':
        return 'bg-[#faeaf0] text-[#823b53] border-[#ecccd6]';
      default:
        return 'bg-[#faf8f5] text-stone-600 border-[#ece8e1]';
    }
  };

  const categoryLabels: Record<string, string> = {
    lds: 'LDS Societário',
    fdr: 'FDR 5º Sem',
    pessoal: 'Pessoal / Treino',
  };

  const currentBook = books.find(b => b.status === 'lendo') || books[0];

  // Quick lookup for non-negotiable items (Planning, Fitness, Rest, Intellect)
  const planningDone = habits.find(h => h.id === 'h-4' || h.name.toLowerCase().includes('planejamento'))?.completed || true;
  const workoutDone = habits.find(h => h.id === 'treino' || h.id === 'h-2' || h.category === 'Corpo')?.completed || false;
  const sleepDone = habits.find(h => h.id === 'h-1' || h.category === 'Saúde')?.completed || false;
  const readingDone = habits.find(h => h.id === 'h-3' || h.category === 'Intelecto')?.completed || false;

  return (
    <div className="space-y-6">
      {/* High Density 3-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Coluna 1: Foco & Rotina */}
        <div className="space-y-6">
          {/* Foco Absoluto (Top 3) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#ece8e1]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Foco Absoluto (Top 3)
              </h3>
              <span className="text-[11px] font-semibold text-[#8b1538]">
                {completedPrioritiesCount}/{priorities.length} feitos
              </span>
            </div>

            <div className="space-y-2.5">
              {priorities.map((priority, idx) => {
                const isDone = priority.completed;
                return (
                  <div
                    key={priority.id}
                    className={`group flex items-start justify-between gap-2 p-2 rounded-lg transition-colors ${
                      isDone ? 'bg-[#faf8f5]' : 'hover:bg-[#faf8f5]'
                    }`}
                  >
                    <div className="flex items-start min-w-0">
                      <input
                        type="checkbox"
                        checked={isDone}
                        onChange={() => togglePriority(priority.id)}
                        className="mt-0.5 mr-2.5 accent-[#8b1538] w-3.5 h-3.5 cursor-pointer shrink-0 rounded"
                      />
                      <span
                        className={`text-xs leading-snug cursor-pointer select-none ${
                          isDone ? 'line-through text-stone-400' : 'text-stone-800 font-medium'
                        }`}
                        onClick={() => togglePriority(priority.id)}
                      >
                        {priority.text}
                      </span>
                    </div>

                    <button
                      onClick={() => deletePriority(priority.id)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-stone-400 hover:text-rose-600 transition-opacity shrink-0"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Priority */}
            {priorities.length < 5 && (
              <form onSubmit={handleAddPriority} className="flex gap-2 pt-3 mt-2 border-t border-[#f3ece2]">
                <input
                  type="text"
                  placeholder="Nova prioridade..."
                  value={newPriorityText}
                  onChange={e => setNewPriorityText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-[#faf8f5] border border-[#ece8e1] text-[#212021] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#8b1538] focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!newPriorityText.trim()}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[#8b1538] hover:bg-[#72102c] text-white disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>
            )}
          </div>

          {/* Não Negociáveis - High Density 2x2 Grid */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#ece8e1]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Não Negociáveis
              </h3>
              <button
                onClick={() => setCurrentTab('rotina')}
                className="text-[10px] text-stone-400 hover:text-[#8b1538] font-semibold transition-colors"
              >
                Gerenciar →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Planejamento & Foco */}
              <div
                onClick={() => toggleHabit('h-4')}
                className="p-3 bg-[#faf8f5] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#f5efe8] transition-colors"
              >
                <span className="font-medium text-stone-700">Planejamento</span>
                <span className={planningDone ? 'text-[#a9cf44] font-bold text-sm' : 'text-stone-300'}>
                  {planningDone ? '✓' : '○'}
                </span>
              </div>

              {/* Musculação / Treino */}
              <div
                onClick={() => toggleHabit('h-2')}
                className="p-3 bg-[#faf8f5] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#f5efe8] transition-colors"
              >
                <span className="font-medium text-stone-700">Musculação</span>
                <span className={workoutDone ? 'text-[#a9cf44] font-bold text-sm' : 'text-stone-300'}>
                  {workoutDone ? '✓' : '○'}
                </span>
              </div>

              {/* Sono 7h30+ */}
              <div
                onClick={() => toggleHabit('h-1')}
                className="p-3 bg-[#faf8f5] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#f5efe8] transition-colors"
              >
                <span className="font-medium text-stone-700">Sono 7h30+</span>
                <span className={sleepDone ? 'text-[#a9cf44] font-bold text-sm' : 'text-stone-300'}>
                  {sleepDone ? '✓' : '○'}
                </span>
              </div>

              {/* Leitura Diária 30m */}
              <div
                onClick={() => toggleHabit('h-3')}
                className="p-3 bg-[#faf8f5] rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#f5efe8] transition-colors"
              >
                <span className="font-medium text-stone-700">Leitura 30m</span>
                <span className={readingDone ? 'text-[#a9cf44] font-bold text-sm' : 'text-stone-300'}>
                  {readingDone ? '✓' : '○'}
                </span>
              </div>
            </div>
          </div>

          {/* Captura Rápida - Bloco de Notas Instantâneo */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#ece8e1]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Captura Rápida
              </h3>
              <button
                onClick={handleCopyNote}
                className="text-[11px] font-semibold text-stone-400 hover:text-[#8b1538] transition-colors flex items-center gap-1"
              >
                {copiedNote ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedNote ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <textarea
              ref={noteTextareaRef}
              value={quickNote}
              onChange={e => setQuickNote(e.target.value)}
              rows={4}
              placeholder="Anote ideias rápidas, lembretes de estudo ou reflexões..."
              className="w-full p-2.5 text-xs text-[#212021] leading-relaxed rounded-xl bg-[#faf8f5] border border-[#ece8e1] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b1538] resize-none transition-all font-sans-ui"
            />
          </div>
        </div>

        {/* Coluna 2: Finanças, Academia & Agenda */}
        <div className="space-y-6">
          {/* Gestão Financeira Card (Autonomia & Controle) */}
          <div
            onClick={() => setCurrentTab('financeiro')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-[#ece8e1] flex flex-col justify-between h-48 cursor-pointer hover:border-emerald-700/30 transition-all group"
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  Finanças & Autonomia
                </span>
                <span className="text-[10px] text-stone-400 group-hover:text-emerald-800 transition-colors">
                  Extrato Completo →
                </span>
              </div>
              <div className="text-xl font-medium text-stone-900 font-serif-title mt-1">
                R$ 1.100,00 <span className="text-xs text-stone-400 font-sans-ui font-normal">/ mês</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Remuneração mensal + Apoio familiar regular (R$ 150/sem)
              </p>
            </div>

            <div className="pt-2 border-t border-[#f2ede4] flex items-center justify-between text-xs">
              <span className="text-stone-400">Despesas mês: R$ 428,90</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                Saldo Saudável
              </span>
            </div>
          </div>

          {/* LDS Card (Palette: Bordeaux & Rose) */}
          <div
            onClick={() => setCurrentTab('lds')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-[#ece8e1] flex flex-col justify-between h-48 cursor-pointer hover:border-[#8b1538]/30 transition-all group"
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest text-[#8b1538] font-bold">
                  LDS 26.2
                </span>
                <span className="text-[10px] text-stone-400 group-hover:text-[#8b1538] transition-colors">
                  Liga LDS →
                </span>
              </div>
              <div
                className="text-base font-medium text-stone-800 font-serif-title"
              >
                Sessão Geral #04: Acordos de Sócios
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Debate: Acordos de Acionistas e Governança
              </p>
            </div>

            <div className="p-3 bg-[#fce4e4] text-[#8b1538] rounded-xl text-xs flex justify-between items-center font-medium">
              <span>Próximo encontro: 09/Set • 14:00</span>
              <span className="font-bold group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Mini Timeline de Hoje */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#ece8e1]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Agenda de Hoje ({todayEvents.length})
              </h3>
              <button
                onClick={() => setCurrentTab('calendario')}
                className="text-[10px] text-[#8b1538] font-semibold hover:underline"
              >
                Calendário →
              </button>
            </div>

            {todayEvents.length === 0 ? (
              <div className="py-4 text-center text-xs text-stone-400">
                Nenhum compromisso agendado para hoje.
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#ece8e1] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${categoryBadgeStyles(
                            event.category
                          )}`}
                        >
                          {categoryLabels[event.category] || event.category}
                        </span>
                        <span className="text-xs font-medium text-[#212021] truncate">
                          {event.title}
                        </span>
                      </div>
                      {event.location && (
                        <div className="text-[10px] text-stone-400 mt-0.5 truncate flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.time && (
                      <span className="text-[11px] font-semibold text-[#8b1538] shrink-0">
                        {event.time}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Coluna 3: Foco Estratégico & Leituras */}
        <div className="space-y-6">
          {/* Autonomia & Finanças Card */}
          <div
            onClick={() => setCurrentTab('financeiro')}
            className="bg-gradient-to-br from-white to-[#faf7f2] p-5 rounded-2xl shadow-sm border border-[#ece8e1] flex flex-col justify-between h-48 cursor-pointer hover:border-[#8b1538]/30 transition-all group"
          >
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] uppercase tracking-widest text-[#8b1538] font-bold">
                  Autonomia & Gestão
                </span>
                <span className="text-[10px] text-stone-400 group-hover:text-[#8b1538] transition-colors">
                  Financeiro →
                </span>
              </div>
              <div className="text-base font-medium text-stone-800 font-serif-title leading-snug">
                Meta 2026: Independência & Reserva
              </div>
              <p className="text-[11px] text-stone-500 mt-2 font-sans-ui">
                Reserva de Emergência • Saldo positivo e despesas controladas
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#8b1538] font-medium pt-2 border-t border-[#f2ede4]">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="truncate">R$ 1.150 investidos • Saldo Saudável</span>
              </div>
              <span className="text-[10px] font-bold text-stone-500">
                Ver Painel
              </span>
            </div>
          </div>

          {/* Próxima Entrega / Prova Banner (FDR 5º Período) */}
          <div
            onClick={() => setCurrentTab('fdr')}
            className="bg-[#8b1538] text-[#fce4e4] p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:bg-[#72102c] transition-all"
          >
            <div className="min-w-0 pr-3">
              <div className="text-[10px] uppercase tracking-widest text-rose-200 font-bold flex items-center gap-1.5">
                <span>Próxima Entrega / Prova</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20">FDR 5º Sem</span>
              </div>
              <div className="text-sm font-medium text-white mt-0.5 truncate">
                {nextAcademicItem.title}
              </div>
              <div className="text-[11px] text-rose-200 mt-0.5 truncate">
                {nextAcademicItem.subject} • {nextAcademicItem.date}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-white tracking-tight">
                {nextAcademicItem.daysLeft <= 0 ? 'HOJE' : `D-${nextAcademicItem.daysLeft}`}
              </div>
              <div className="text-[9px] uppercase tracking-wider text-rose-200 font-semibold">
                {nextAcademicItem.categoryTag}
              </div>
            </div>
          </div>

          {/* Estante & Leituras Snapshot */}
          <div
            onClick={() => setCurrentTab('livros')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-[#ece8e1] space-y-3 cursor-pointer hover:border-indigo-200 transition-all group"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                Leitura do Momento
              </h3>
              <span className="text-[10px] text-stone-400 group-hover:text-indigo-600 font-semibold transition-colors">
                Estante →
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#faf8f5] border border-[#ece8e1] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#212021] truncate">
                  {currentBook?.title || 'A Sabedoria dos Provérbios'}
                </div>
                <div className="text-[10px] text-stone-400 truncate mt-0.5">
                  {currentBook?.author || 'Estudo & Reflexão'} • {currentBook ? `${currentBook.currentPage}/${currentBook.totalPages} págs` : 'Em andamento'}
                </div>
              </div>
              <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-800 shrink-0">
                {currentBook ? `${Math.round((currentBook.currentPage / currentBook.totalPages) * 100)}%` : '62%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
