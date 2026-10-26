/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lesson, LessonMaterial } from '../types';
import { LessonDetailModal } from './LessonDetailModal';
import { FACULTY_MEMBERS } from '../data/curriculum';
import { Check, ChevronRight, Copy, Plus, Search } from 'lucide-react';
import { Modal } from '../../fdr/ui/components/Modal';
import { Button, EmptyState, Input, Label, Panel, Segmented, Select, cx } from '../../components/ui';

const PHASES = ['Direito Societário Básico', 'Mercado de Capitais', 'Reorganizações & Prática'] as const;
const STATUS_TEXT: Record<Lesson['status'], string> = { completed: 'Realizada', current: 'Esta semana', upcoming: 'Próxima' };

interface ScheduleViewProps {
  lessons: Lesson[];
  onUpdateLesson: (updated: Lesson) => void;
  onSelectLessonForAgent: (lessonNumber: number) => void;
  onOpenDocumentsForLesson: (lessonNumber: number) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  lessons,
  onUpdateLesson,
  onSelectLessonForAgent
}) => {
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLessonModal, setActiveLessonModal] = useState<Lesson | null>(null);

  // Inline quick editing states
  const [editingTeacherLessonId, setEditingTeacherLessonId] = useState<number | null>(null);
  const [teacherInputName, setTeacherInputName] = useState<string>('');
  const [teacherInputRole, setTeacherInputRole] = useState<string>('');
  const [expandedNotesLessonId, setExpandedNotesLessonId] = useState<number | null>(null);
  const [uploadingPdfLessonId, setUploadingPdfLessonId] = useState<number | null>(null);
  const [newMaterialTitle, setNewMaterialTitle] = useState<string>('');

  // Quick Add New Custom Lesson Modal
  const [showAddLessonModal, setShowAddLessonModal] = useState<boolean>(false);
  const [newLessonTitle, setNewLessonTitle] = useState<string>('');
  const [newLessonDate, setNewLessonDate] = useState<string>('');
  const [newLessonProfessor, setNewLessonProfessor] = useState<string>('');
  const [newLessonPhase, setNewLessonPhase] = useState<'Direito Societário Básico' | 'Mercado de Capitais' | 'Reorganizações & Prática'>('Direito Societário Básico');

  // Feedback toast for lesson copy
  const [copiedSummaryLessonId, setCopiedSummaryLessonId] = useState<number | null>(null);

  // Quick Gemini QA Drawer on a lesson
  const [qaLesson, setQaLesson] = useState<Lesson | null>(null);
  const [qaQuestion, setQaQuestion] = useState<string>('');
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);
  const [qaLoading, setQaLoading] = useState<boolean>(false);

  const completedCount = lessons.filter(l => l.status === 'completed').length;
  const progressPercent = Math.round((completedCount / lessons.length) * 100);
  const currentLesson = lessons.find(l => l.status === 'current') || lessons[3] || lessons[0];

  const handleToggleStatus = (lesson: Lesson, e: React.MouseEvent) => {
    e.stopPropagation();
    let nextStatus: 'completed' | 'current' | 'upcoming';
    if (lesson.status === 'completed') {
      nextStatus = 'upcoming';
    } else if (lesson.status === 'upcoming') {
      nextStatus = 'completed';
    } else {
      nextStatus = 'completed';
    }
    const updated: Lesson = {
      ...lesson,
      status: nextStatus
    };
    onUpdateLesson(updated);
  };

  const handleSaveTeacher = (lesson: Lesson) => {
    if (!teacherInputName.trim()) {
      setEditingTeacherLessonId(null);
      return;
    }
    const updated: Lesson = {
      ...lesson,
      actualProfessor: teacherInputName.trim(),
      actualProfessorRole: teacherInputRole.trim() || 'Professor Convidado'
    };
    onUpdateLesson(updated);
    setEditingTeacherLessonId(null);
    setTeacherInputName('');
    setTeacherInputRole('');
  };

  const handleUpdateNotes = (lesson: Lesson, text: string) => {
    const updated: Lesson = {
      ...lesson,
      personalNotes: text
    };
    onUpdateLesson(updated);
  };

  const handleAddMaterialToLesson = (lesson: Lesson, file?: File) => {
    const title = file ? file.name : newMaterialTitle.trim();
    if (!title) return;
    const sizeStr = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB';
    const isSlide = title.match(/\.(ppt|pptx)$/i) || title.toLowerCase().includes('slide');
    const newMat: LessonMaterial = {
      id: `mat-${Date.now()}`,
      name: title.endsWith('.pdf') || isSlide || title.includes('.') ? title : `${title}.pdf`,
      type: isSlide ? 'slide' : 'pdf',
      size: sizeStr,
      addedAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
    const updated: Lesson = {
      ...lesson,
      materials: [...(lesson.materials || []), newMat]
    };
    onUpdateLesson(updated);
    setNewMaterialTitle('');
    setUploadingPdfLessonId(null);
  };

  const handleRemoveMaterial = (lesson: Lesson, matId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Lesson = {
      ...lesson,
      materials: (lesson.materials || []).filter(m => m.id !== matId)
    };
    onUpdateLesson(updated);
  };

  const handleCreateNewLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    const nextNumber = lessons.length + 1;
    const newLessonItem: Lesson = {
      id: nextNumber,
      lessonNumber: nextNumber,
      dateStr: newLessonDate ? newLessonDate.slice(0, 5) : 'A definir',
      fullDate: newLessonDate || 'Data a ser confirmada',
      title: newLessonTitle.trim(),
      subtitle: 'Encontro complementar de estudos da LDS FDR',
      duration: '60 minutos',
      phase: newLessonPhase,
      actualProfessor: newLessonProfessor.trim() || undefined,
      status: 'upcoming',
      materials: [],
      keyPoints: [
        'Debate de temas contemporâneos de Direito Societário e Mercado de Capitais',
        'Análise da aplicação prática de dispositivos da Lei 6.404/76 e Código Civil'
      ],
      legislation: [
        {
          lawTag: 'LEI 6.404/76',
          article: 'Art. 1º',
          text: 'A companhia ou sociedade anônima terá o capital dividido em ações.',
          sourceName: 'Lei das Sociedades por Ações'
        }
      ],
      doctrineQuotes: [],
      overviewText: `Aula complementar adicionada pelo usuário focada em ${newLessonTitle}.`,
      recommendedBibliography: [
        'COELHO, Fábio Ulhoa. Curso de Direito Comercial. V. 2.',
        'CARVALHOSA, Modesto. Comentários à Lei de Sociedades Anônimas.'
      ]
    };
    onUpdateLesson(newLessonItem);
    setShowAddLessonModal(false);
    setNewLessonTitle('');
    setNewLessonDate('');
    setNewLessonProfessor('');
  };

  const handleCopyLessonSummary = async (lesson: Lesson, e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = `# LDS FDR - AULA ${lesson.lessonNumber.toString().padStart(2, '0')}: ${lesson.title}
Data: ${lesson.fullDate} (${lesson.dateStr})
Professor(a): ${lesson.actualProfessor || lesson.instructorName || 'A definir'} (${lesson.actualProfessorRole || lesson.instructorRole || 'LDS FDR / UFPE'})
Status da Aula: ${lesson.status === 'completed' ? 'Já Realizada' : lesson.status === 'current' ? 'Em Andamento' : 'Próxima'}
Fase: ${lesson.phase} • Duração: ${lesson.duration}

## 1. SLIDES E APRESENTAÇÕES DO PROFESSOR:
${lesson.slidesUrl ? `- Link dos Slides: ${lesson.slidesUrl}` : '- Nenhum link externo de slides registrado.'}
${(lesson.materials || []).filter(m => m.type === 'slide').map(m => `- Arquivo: ${m.name}`).join('\n')}

## 2. MINHAS ANOTAÇÕES DA AULA:
${lesson.personalNotes || 'Nenhuma anotação pessoal inserida ainda.'}

## 3. BIBLIOGRAFIA RECOMENDADA:
${(lesson.bibliographyItems || []).map(b => `- ${b.author}: ${b.title}${b.pages ? ` (${b.pages})` : ''}`).join('\n')}
${(lesson.recommendedBibliography || []).map(b => `- ${b}`).join('\n')}

## 4. LINKS ÚTEIS E PRECEDENTES:
${(lesson.links || []).map(l => `- [${l.category || 'Link'}] ${l.title}: ${l.url}`).join('\n')}

## 5. RESUMO E PONTOS DOGMÁTICOS CENTRAIS:
${(lesson.keyPoints || []).map(kp => `- ${kp}`).join('\n')}

## 6. DISPOSITIVOS NORMATIVOS E LEGISLAÇÃO APLICÁVEL:
${(lesson.legislation || []).map(l => `### ${l.lawTag} - ${l.article} (${l.sourceName}):\n"${l.text}"\n${l.commentary ? `Comentário: ${l.commentary}\n` : ''}`).join('\n')}
`;
    await navigator.clipboard.writeText(formatted);
    setCopiedSummaryLessonId(lesson.lessonNumber);
    setTimeout(() => setCopiedSummaryLessonId(null), 3000);
  };

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaQuestion.trim() || !qaLesson) return;
    setQaLoading(true);
    setQaAnswer(null);
    try {
      const res = await fetch('/api/gemini/lesson-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonNumber: qaLesson.lessonNumber,
          question: qaQuestion,
          personalNotes: qaLesson.personalNotes,
          attachedMaterials: qaLesson.materials
        })
      });
      const data = await res.json();
      if (data.success && data.answer) {
        setQaAnswer(data.answer);
      } else {
        setQaAnswer('Não foi possível obter resposta no momento. Consulte os dispositivos legais na ficha da aula.');
      }
    } catch {
      setQaAnswer('Erro ao conectar ao assistente Gemini. Verifique sua conexão.');
    } finally {
      setQaLoading(false);
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesPhase = selectedPhase === 'all' || lesson.phase === selectedPhase;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'completed' && lesson.status === 'completed') ||
      (selectedStatus === 'current' && lesson.status === 'current') ||
      (selectedStatus === 'upcoming' && lesson.status === 'upcoming');
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.dateStr.includes(searchQuery) ||
      lesson.fullDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.actualProfessor && lesson.actualProfessor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lesson.keyPoints.some(kp => kp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lesson.instructorName && lesson.instructorName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPhase && matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 text-sm text-stone-600">
          <span className="tabular-nums">
            <span className="font-semibold text-[#1c1a1e]">{completedCount}</span> de {lessons.length} aulas realizadas
          </span>
          <div className="hidden sm:block w-32 h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div className="h-full bg-[#8b1538] rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowAddLessonModal(true)}>
          Nova aula
        </Button>
      </div>

      {currentLesson && (
        <Panel title="Esta semana" meta={currentLesson.fullDate} className="mb-5">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="min-w-0 max-w-2xl">
              <div className="text-xs text-stone-500">Aula {currentLesson.lessonNumber}</div>
              <div className="text-base font-semibold text-[#1c1a1e] leading-snug mt-0.5">{currentLesson.title}</div>
              {currentLesson.subtitle && <p className="text-sm text-stone-600 mt-1">{currentLesson.subtitle}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
              <Button onClick={() => onSelectLessonForAgent(currentLesson.lessonNumber)}>Perguntar à IA</Button>
              <Button variant="primary" onClick={() => setActiveLessonModal(currentLesson)}>
                Abrir aula
              </Button>
            </div>
          </div>
        </Panel>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Segmented
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'completed', label: 'Realizadas' },
            { value: 'upcoming', label: 'Próximas' },
          ]}
        />
        <Select value={selectedPhase} onChange={(e) => setSelectedPhase(e.target.value)} className="sm:!w-56" aria-label="Fase">
          <option value="all">Todas as fases</option>
          {PHASES.map((ph) => (
            <option key={ph} value={ph}>
              {ph}
            </option>
          ))}
        </Select>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar aula ou professor"
            className="pl-9"
          />
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <Panel>
          <EmptyState>Nenhuma aula encontrada.</EmptyState>
        </Panel>
      ) : (
        <div className="space-y-5">
          {PHASES.map((phase) => {
            const items = filteredLessons.filter((l) => l.phase === phase);
            if (!items.length) return null;
            return (
              <Panel key={phase} title={phase} meta={items.length} bodyClassName="!px-0 !pb-2">
                <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
                  {items.map((lesson) => {
                    const professor = lesson.actualProfessor || lesson.instructorName;
                    return (
                      <li
                        key={lesson.id}
                        className={cx(
                          'group flex items-center gap-3 sm:gap-4 px-5 py-3 hover:bg-stone-50 cursor-pointer',
                          lesson.status === 'current' && 'bg-[#fbf7f8]',
                        )}
                        onClick={() => setActiveLessonModal(lesson)}
                      >
                        <input
                          type="checkbox"
                          checked={lesson.status === 'completed'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleToggleStatus(lesson, e as unknown as React.MouseEvent)}
                          aria-label={`Marcar aula ${lesson.lessonNumber} como realizada`}
                          className="w-4 h-4 accent-[#8b1538] shrink-0 cursor-pointer"
                        />
                        <div className="w-14 shrink-0 text-sm text-stone-500 tabular-nums">{lesson.dateStr}</div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={cx(
                              'text-sm leading-snug',
                              lesson.status === 'completed' ? 'text-stone-600' : 'text-[#1c1a1e] font-medium',
                            )}
                          >
                            <span className="text-stone-400 tabular-nums mr-1.5">{lesson.lessonNumber}.</span>
                            {lesson.title}
                          </div>
                          <div className="text-xs text-stone-500 mt-0.5 truncate">
                            {[
                              lesson.status === 'current' ? STATUS_TEXT.current : null,
                              professor || null,
                              lesson.materials?.length ? `${lesson.materials.length} materiais` : null,
                              lesson.personalNotes ? 'com anotações' : null,
                            ]
                              .filter(Boolean)
                              .join(' · ') || '\u00a0'}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleCopyLessonSummary(lesson, e)}
                          aria-label={`Copiar resumo da aula ${lesson.lessonNumber}`}
                          title="Copiar resumo"
                          className="p-1.5 rounded text-stone-400 hover:text-stone-700 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                        >
                          {copiedSummaryLessonId === lesson.lessonNumber ? (
                            <Check className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <ChevronRight className="w-4 h-4 text-stone-300 shrink-0" />
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            );
          })}
        </div>
      )}

      <Modal aberto={showAddLessonModal} aoFechar={() => setShowAddLessonModal(false)} titulo="Nova aula" larguraMaxima="max-w-md">
        <form onSubmit={handleCreateNewLesson} className="space-y-4">
          <div>
            <Label htmlFor="ls-title">Tema</Label>
            <Input id="ls-title" value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ls-date">Data</Label>
              <Input
                id="ls-date"
                placeholder="dd/mm/aaaa"
                value={newLessonDate}
                onChange={(e) => setNewLessonDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="ls-prof">Professor(a)</Label>
              <Input id="ls-prof" value={newLessonProfessor} onChange={(e) => setNewLessonProfessor(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="ls-phase">Fase</Label>
            <Select id="ls-phase" value={newLessonPhase} onChange={(e) => setNewLessonPhase(e.target.value as typeof newLessonPhase)}>
              {PHASES.map((ph) => (
                <option key={ph}>{ph}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" onClick={() => setShowAddLessonModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!newLessonTitle.trim()}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Mounted per lesson so its form state always starts from that lesson */}
      {activeLessonModal && (
      <LessonDetailModal
        key={activeLessonModal.id}
        lesson={activeLessonModal}
        isOpen
        onClose={() => setActiveLessonModal(null)}
        onSaveLesson={onUpdateLesson}
        onAskAiAboutLesson={(num) => {
          setActiveLessonModal(null);
          onSelectLessonForAgent(num);
        }}
      />
      )}
    </div>
  );
};
