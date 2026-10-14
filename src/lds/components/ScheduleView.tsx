/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lesson, LessonMaterial } from '../types';
import { LessonDetailModal } from './LessonDetailModal';
import { FACULTY_MEMBERS } from '../data/curriculum';
import {
  Calendar,
  BookOpen,
  FileText,
  Search,
  GraduationCap,
  CheckCircle2,
  Paperclip,
  Edit3,
  ChevronRight,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Presentation,
  BookMarked,
  Link as LinkIcon,
  Sparkles
} from 'lucide-react';

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
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-2 sm:px-6 lg:px-8 font-['Source_Serif_4',serif]">
      {/* Semester Tracker Header */}
      <div className="mb-10 space-y-6">
        <div className="bg-gradient-to-br from-[#FAF5EA] via-[#FDFBF7] to-[#F5EEDF] border border-[#A9832E]/30 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 border border-[#A9832E]/30 rounded-full text-xs font-['Inter',sans-serif] text-[#A7002F] font-semibold shadow-2xs">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>Ciclo-base 2026.2 em Andamento • FDR / UFPE</span>
              </div>
              <h1 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#A7002F] tracking-tight leading-tight">
                Acompanhamento das Aulas
              </h1>
              <p className="text-sm sm:text-base text-[#6B5D4F] leading-relaxed font-sans">
                Acompanhe o ciclo das aulas em tempo real: veja os encontros já realizados, cadastre o professor que ministrou cada encontro, acesse os slides da apresentação, consulte a bibliografia e faça suas anotações de aula.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowAddLessonModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#A7002F] hover:bg-[#5C0A22] text-white rounded-full text-xs font-['Inter',sans-serif] font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Nova Aula / Encontro</span>
                </button>
              </div>
            </div>

            {/* Semester progress stats block */}
            <div className="bg-white/95 border border-[#E5DBCA] rounded-3xl p-6 shrink-0 w-full lg:w-84 shadow-xs space-y-3.5 font-['Inter',sans-serif]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#211A15]">Progresso do Semestre</span>
                <span className="font-bold text-[#A7002F]">{completedCount} de {lessons.length} aulas ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-[#E5DBCA]/60 h-3 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-[#A7002F] via-[#A9832E] to-[#5C0A22] h-full rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="pt-2 border-t border-[#E5DBCA]/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => setSelectedStatus('completed')}
                  className="inline-flex items-center gap-1.5 text-emerald-800 font-bold hover:underline cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{completedCount} Já Realizadas</span>
                </button>
                <button
                  onClick={() => setSelectedStatus('upcoming')}
                  className="text-[#6B5D4F] hover:text-[#211A15] cursor-pointer"
                >
                  {lessons.length - completedCount} Próximas
                </button>
              </div>
            </div>
          </div>

          {/* Current Lesson Highlight Ribbon */}
          {currentLesson && (
            <div className="mt-6 pt-5 border-t border-[#A9832E]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-['Inter',sans-serif]">
              <div className="flex items-center gap-3">
                <span className="px-3.5 py-1 bg-[#A7002F] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs">
                  Aula em Foco Desta Semana
                </span>
                <div className="text-xs text-[#211A15]">
                  <strong className="font-['Cormorant_Garamond',serif] text-lg text-[#A7002F]">
                    Aula {currentLesson.lessonNumber.toString().padStart(2, '0')}: {currentLesson.title}
                  </strong>
                  <span className="hidden sm:inline text-[#6B5D4F]"> ({currentLesson.fullDate})</span>
                </div>
              </div>
              <button
                onClick={() => setActiveLessonModal(currentLesson)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-[#FAF5EA] text-[#A7002F] border border-[#A7002F]/40 rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
              >
                <span>Acessar Slides, Links & Anotações</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-full text-xs font-['Inter',sans-serif] transition-all cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-[#A7002F] text-white font-bold shadow-xs'
                  : 'bg-white border border-[#E5DBCA] text-[#6B5D4F] hover:bg-[#F4EDE0]'
              }`}
            >
              Todas as Aulas ({lessons.length})
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-4 py-2 rounded-full text-xs font-['Inter',sans-serif] transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedStatus === 'completed'
                  ? 'bg-emerald-700 text-white font-bold shadow-xs'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aulas Já Realizadas ({completedCount})</span>
            </button>
            <button
              onClick={() => setSelectedStatus('current')}
              className={`px-4 py-2 rounded-full text-xs font-['Inter',sans-serif] transition-all cursor-pointer ${
                selectedStatus === 'current'
                  ? 'bg-[#A7002F] text-white font-bold shadow-xs'
                  : 'bg-white border border-[#E5DBCA] text-[#6B5D4F] hover:bg-[#F4EDE0]'
              }`}
            >
              Aula Desta Semana
            </button>
            <button
              onClick={() => setSelectedStatus('upcoming')}
              className={`px-4 py-2 rounded-full text-xs font-['Inter',sans-serif] transition-all cursor-pointer ${
                selectedStatus === 'upcoming'
                  ? 'bg-[#5C0A22] text-white font-bold shadow-xs'
                  : 'bg-white border border-[#E5DBCA] text-[#6B5D4F] hover:bg-[#F4EDE0]'
              }`}
            >
              Próximas Aulas ({lessons.length - completedCount})
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5 p-1 bg-[#F4EDE0]/80 border border-[#A9832E]/30 rounded-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedPhase('all')}
                className={`px-3.5 py-1.5 text-xs font-['Inter',sans-serif] rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  selectedPhase === 'all'
                    ? 'bg-white text-[#A7002F] font-bold shadow-2xs'
                    : 'text-[#6B5D4F] hover:text-[#211A15]'
                }`}
              >
                Todas as Fases
              </button>
              <button
                onClick={() => setSelectedPhase('Direito Societário Básico')}
                className={`px-3.5 py-1.5 text-xs font-['Inter',sans-serif] rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  selectedPhase === 'Direito Societário Básico'
                    ? 'bg-white text-[#A7002F] font-bold shadow-2xs'
                    : 'text-[#6B5D4F] hover:text-[#211A15]'
                }`}
              >
                Societário Básico
              </button>
              <button
                onClick={() => setSelectedPhase('Mercado de Capitais')}
                className={`px-3.5 py-1.5 text-xs font-['Inter',sans-serif] rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  selectedPhase === 'Mercado de Capitais'
                    ? 'bg-white text-[#A7002F] font-bold shadow-2xs'
                    : 'text-[#6B5D4F] hover:text-[#211A15]'
                }`}
              >
                Mercado de Capitais
              </button>
              <button
                onClick={() => setSelectedPhase('Reorganizações & Prática')}
                className={`px-3.5 py-1.5 text-xs font-['Inter',sans-serif] rounded-full transition-all whitespace-nowrap cursor-pointer ${
                  selectedPhase === 'Reorganizações & Prática'
                    ? 'bg-white text-[#A7002F] font-bold shadow-2xs'
                    : 'text-[#6B5D4F] hover:text-[#211A15]'
                }`}
              >
                Reorganizações & Prática
              </button>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-3.5 h-3.5 text-[#6B5D4F] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar aula, professor, tema..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-[#A9832E]/35 rounded-full text-[#211A15] placeholder-[#6B5D4F]/70 focus:outline-none focus:ring-2 focus:ring-[#A7002F] shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating feedback alert */}
      {copiedSummaryLessonId !== null && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#211A15] text-[#FAF5EA] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-[#A9832E] animate-bounce font-['Inter',sans-serif] text-xs">
          <Check className="w-4 h-4 text-emerald-400" />
          <div>
            <strong className="block text-white">Resumo Copiado!</strong>
            <span>Os dados, bibliografia e anotações da Aula {copiedSummaryLessonId} estão na área de transferência.</span>
          </div>
        </div>
      )}

      {/* Grid of Lessons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map(lesson => {
          const isCompleted = lesson.status === 'completed';
          const isCurrent = lesson.status === 'current';
          const materials = lesson.materials || [];
          const hasSlides = !!lesson.slidesUrl || materials.some(m => m.type === 'slide');
          const bibCount = (lesson.bibliographyItems?.length || 0) + (lesson.recommendedBibliography?.length || 0);
          const linksCount = lesson.links?.length || 0;
          const isEditingTeacher = editingTeacherLessonId === lesson.id;
          const isNotesExpanded = expandedNotesLessonId === lesson.id;
          const isUploadingPdf = uploadingPdfLessonId === lesson.id;

          return (
            <div
              key={lesson.id}
              className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between p-6 shadow-xs hover:shadow-lg relative group ${
                isCurrent
                  ? 'bg-gradient-to-b from-[#FAF5EA] to-[#F5EEDF] border-[#A7002F] ring-2 ring-[#A7002F]/20'
                  : isCompleted
                  ? 'bg-[#FAF5EA] border-[#D9CBB7] hover:border-[#A7002F]/60'
                  : 'bg-[#FAF5EA]/85 border-[#E5DBCA] hover:border-[#A9832E]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="eyebrow-lds text-[#A7002F] font-bold text-xs tracking-wider">
                      AULA {lesson.lessonNumber.toString().padStart(2, '0')}
                    </span>
                    <button
                      onClick={e => handleToggleStatus(lesson, e)}
                      title="Clique para alternar status da aula"
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-['Inter',sans-serif] font-bold transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                          : isCurrent
                          ? 'bg-[#A7002F] text-white hover:brightness-110'
                          : 'bg-white text-[#6B5D4F] border border-[#E5DBCA] hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          <span>Realizada</span>
                        </>
                      ) : isCurrent ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>Em Foco</span>
                        </>
                      ) : (
                        <span>Marcar Realizada</span>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-['Inter',sans-serif] font-bold text-[#5C0A22] bg-white/90 px-3 py-1 rounded-full border border-[#A9832E]/30 shadow-2xs">
                    <Calendar className="w-3 h-3 text-[#A9832E]" />
                    <span>{lesson.dateStr}</span>
                  </div>
                </div>

                <h3
                  onClick={() => setActiveLessonModal(lesson)}
                  className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold text-[#211A15] group-hover:text-[#A7002F] transition-colors leading-snug mb-2 cursor-pointer"
                >
                  {lesson.title}
                </h3>

                {/* Professor Info */}
                <div className="p-3.5 bg-white/85 border border-[#E5DBCA] rounded-2xl mb-3 space-y-2 font-['Inter',sans-serif] text-xs shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <GraduationCap className="w-4 h-4 text-[#A7002F] shrink-0" />
                      <div className="truncate">
                        <div className="text-[10px] text-[#6B5D4F] uppercase tracking-wider font-semibold">
                          {isCompleted ? 'Ministrada por:' : 'Professor:'}
                        </div>
                        <div className="font-bold text-[#211A15] truncate">
                          {lesson.actualProfessor || lesson.instructorName || 'Cadastrar Professor'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTeacherLessonId(isEditingTeacher ? null : lesson.id);
                        setTeacherInputName(lesson.actualProfessor || lesson.instructorName || '');
                        setTeacherInputRole(lesson.actualProfessorRole || lesson.instructorRole || '');
                      }}
                      className="p-1 text-[#6B5D4F] hover:text-[#A7002F] hover:bg-white rounded-lg transition-colors cursor-pointer shrink-0"
                      title="Cadastrar / Editar Professor que deu a aula"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {isEditingTeacher && (
                    <div className="pt-2 border-t border-[#E5DBCA] space-y-2">
                      <input
                        type="text"
                        placeholder="Nome do professor que deu a aula..."
                        value={teacherInputName}
                        onChange={e => setTeacherInputName(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#A7002F]/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                      />
                      <input
                        type="text"
                        placeholder="Cargo / Instituição (ex: FDR, Juiz, Advogado)..."
                        value={teacherInputRole}
                        onChange={e => setTeacherInputRole(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5DBCA] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                      />
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className="text-[#6B5D4F] py-0.5">Sugestões:</span>
                        {FACULTY_MEMBERS.slice(0, 4).map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setTeacherInputName(f.name);
                              setTeacherInputRole(f.affiliation || f.role);
                            }}
                            className="px-2 py-0.5 bg-[#FAF5EA] hover:bg-white border border-[#E5DBCA] rounded-full text-[#A7002F] cursor-pointer"
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingTeacherLessonId(null)}
                          className="px-2 py-1 text-[11px] text-[#6B5D4F] hover:text-[#211A15]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveTeacher(lesson)}
                          className="px-3 py-1 bg-[#A7002F] text-white rounded-lg text-[11px] font-semibold"
                        >
                          Salvar Professor
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Slides Pill Ribbon */}
                <div className="mb-3 font-['Inter',sans-serif]">
                  {lesson.slidesUrl ? (
                    <a
                      href={lesson.slidesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full p-2.5 bg-gradient-to-r from-[#FAF5EA] to-[#F4EDE0] hover:bg-white border border-[#A9832E]/40 rounded-2xl flex items-center justify-between text-xs text-[#5C0A22] font-semibold transition-all shadow-2xs group/slide"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Presentation className="w-3.5 h-3.5 text-[#A7002F]" />
                        <span className="truncate">Slides da Aula Disponibilizados</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#A9832E] group-hover/slide:translate-x-0.5 transition-transform shrink-0" />
                    </a>
                  ) : hasSlides ? (
                    <button
                      onClick={() => setActiveLessonModal(lesson)}
                      className="w-full p-2 bg-[#FAF5EA] hover:bg-white border border-[#E5DBCA] rounded-2xl flex items-center justify-between text-xs text-[#5C0A22] font-medium transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Presentation className="w-3.5 h-3.5 text-[#A7002F]" />
                        <span>Slides Anexados na Aula</span>
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#6B5D4F]" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveLessonModal(lesson)}
                      className="w-full p-1.5 px-3 bg-white/70 hover:bg-white border border-dashed border-[#A9832E]/35 rounded-2xl flex items-center justify-between text-[11px] text-[#6B5D4F] hover:text-[#A7002F] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Presentation className="w-3.5 h-3.5 text-[#A7002F]" />
                        <span>+ Adicionar Link ou Arquivo de Slides</span>
                      </span>
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Resource Metrics Chips */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 font-['Inter',sans-serif] text-[11px]">
                  <button
                    onClick={() => setActiveLessonModal(lesson)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F4EDE0] border border-[#E5DBCA] rounded-full text-[#6B5D4F] hover:text-[#211A15] transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-3 h-3 text-[#A9832E]" />
                    <span>{bibCount} Bibliografias</span>
                  </button>
                  <button
                    onClick={() => setActiveLessonModal(lesson)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-[#F4EDE0] border border-[#E5DBCA] rounded-full text-[#6B5D4F] hover:text-[#211A15] transition-colors cursor-pointer"
                  >
                    <LinkIcon className="w-3 h-3 text-[#A9832E]" />
                    <span>{linksCount} Links Úteis</span>
                  </button>
                </div>

                {/* Attached Materials */}
                <div className="space-y-1.5 mb-3 font-['Inter',sans-serif]">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#6B5D4F] flex items-center gap-1">
                      <Paperclip className="w-3 h-3 text-[#A9832E]" />
                      <span>PDFs & Materiais ({materials.length})</span>
                    </span>
                    <button
                      onClick={() => setUploadingPdfLessonId(isUploadingPdf ? null : lesson.id)}
                      className="text-[#A7002F] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Anexar PDF</span>
                    </button>
                  </div>

                  {isUploadingPdf && (
                    <div className="p-3 bg-white border border-[#A7002F]/30 rounded-2xl space-y-2 shadow-xs">
                      <div className="text-[11px] font-semibold text-[#A7002F]">
                        Adicionar Material Disponibilizado na Aula:
                      </div>
                      <label className="block w-full border border-dashed border-[#A9832E]/40 hover:border-[#A7002F] rounded-xl p-2 text-center text-xs text-[#6B5D4F] hover:bg-[#FAF5EA] cursor-pointer transition-colors">
                        <span>Selecionar PDF do computador</span>
                        <input
                          type="file"
                          accept=".pdf,.ppt,.pptx,.doc,.docx"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleAddMaterialToLesson(lesson, file);
                          }}
                        />
                      </label>
                      <div className="text-center text-[10px] text-[#6B5D4F]">ou digite o nome do material:</div>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ex: Slides da Aula - Capital Social.pdf"
                          value={newMaterialTitle}
                          onChange={e => setNewMaterialTitle(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-[#E5DBCA] rounded-xl focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddMaterialToLesson(lesson)}
                          className="px-3 py-1 bg-[#A7002F] text-white rounded-xl text-xs font-semibold"
                        >
                          Adicionar
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    {materials.map(mat => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between gap-2 p-1.5 px-2.5 bg-white/70 hover:bg-white border border-[#E5DBCA] rounded-xl text-xs group/item transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5 text-[#A7002F] shrink-0" />
                          <span className="truncate text-[#211A15] font-medium">{mat.name}</span>
                          {mat.size && <span className="text-[10px] text-[#6B5D4F] shrink-0">({mat.size})</span>}
                        </div>
                        <div className="flex items-center gap-1 opacity-80 group-hover/item:opacity-100">
                          <button
                            onClick={() => {
                              setQaLesson(lesson);
                              setQaQuestion(`O que é abordado no material "${mat.name}" desta aula?`);
                            }}
                            className="p-1 text-[#6B5D4F] hover:text-[#A7002F]"
                            title="Perguntar ao Gemini sobre este material"
                          >
                            <Sparkles className="w-3 h-3 text-[#A9832E]" />
                          </button>
                          <button
                            onClick={e => handleRemoveMaterial(lesson, mat.id, e)}
                            className="p-1 text-[#6B5D4F] hover:text-red-600"
                            title="Remover material"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inline Student Notes Accordion */}
                <div className="font-['Inter',sans-serif] mb-3">
                  <button
                    onClick={() => setExpandedNotesLessonId(isNotesExpanded ? null : lesson.id)}
                    className="w-full flex items-center justify-between text-[11px] text-[#6B5D4F] hover:text-[#211A15] font-semibold py-1 cursor-pointer"
                  >
                    <span>Minhas Anotações de Aula {lesson.personalNotes ? '• Preenchidas' : ''}</span>
                    <span className="text-xs text-[#A7002F]">{isNotesExpanded ? 'Ocultar' : 'Editar Notas'}</span>
                  </button>
                  {isNotesExpanded ? (
                    <div className="mt-1 space-y-1.5">
                      <textarea
                        rows={3}
                        placeholder="Anote o que o professor falou, pontos de debate, jurisprudência citada ou dúvidas..."
                        value={lesson.personalNotes || ''}
                        onChange={e => handleUpdateNotes(lesson, e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#A7002F]/30 rounded-2xl text-xs text-[#211A15] focus:outline-none focus:ring-1 focus:ring-[#A7002F] shadow-2xs font-['Source_Serif_4',serif]"
                      />
                      <div className="text-[10px] text-[#6B5D4F] italic text-right">
                        Salvo automaticamente no caderno local
                      </div>
                    </div>
                  ) : lesson.personalNotes ? (
                    <div className="p-2 bg-white/60 border border-[#E5DBCA] rounded-xl text-xs text-[#6B5D4F] italic truncate">
                      "{lesson.personalNotes.slice(0, 60)}..."
                    </div>
                  ) : null}
                </div>

                {/* Key Points Preview */}
                <div className="space-y-1 text-xs text-[#211A15] border-t border-[#E5DBCA] pt-3 font-serif">
                  {lesson.keyPoints.slice(0, 2).map((kp, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#A9832E] font-bold">•</span>
                      <span className="line-clamp-2 leading-relaxed">{kp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="mt-5 pt-3 border-t border-[#E5DBCA] flex items-center justify-between gap-2 font-['Inter',sans-serif]">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveLessonModal(lesson)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#211A15] bg-white hover:bg-[#F4EDE0] border border-[#A9832E]/30 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#A7002F]" />
                    <span>Acessar Aula</span>
                  </button>
                  <button
                    onClick={e => handleCopyLessonSummary(lesson, e)}
                    className="px-2.5 py-1.5 text-xs font-medium text-[#5C0A22] bg-[#FAF5EA] hover:bg-white border border-[#A9832E]/30 rounded-full transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Copiar resumo e referências da aula"
                  >
                    {copiedSummaryLessonId === lesson.lessonNumber ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 text-[11px] font-semibold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#A7002F]" />
                        <span className="hidden sm:inline">Copiar Resumo</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setQaLesson(lesson);
                      setQaQuestion('');
                      setQaAnswer(null);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-[#FAF5EA] bg-[#5C0A22] hover:bg-[#A7002F] rounded-full transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                    title="Tirar dúvida com IA sobre esta aula"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FAF5EA]" />
                    <span>Dúvidas IA</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Gemini Lesson Q&A Modal */}
      {qaLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF5EA] border border-[#A7002F]/30 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-['Source_Serif_4',serif]">
            <div className="p-5 bg-gradient-to-r from-[#5C0A22] to-[#A7002F] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#FAF5EA]" />
                <div>
                  <div className="text-[10px] font-['Inter',sans-serif] uppercase tracking-wider text-white/80">
                    TUTOR INTELIGENTE LDS FDR • GEMINI
                  </div>
                  <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold leading-tight">
                    Aula {qaLesson.lessonNumber}: {qaLesson.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setQaLesson(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="text-xs text-[#6B5D4F] font-['Inter',sans-serif]">
                Pergunte sobre conceitos jurídicos, matérias dos slides ou sobre as anotações feitas nesta aula:
              </div>
              <form onSubmit={handleAskGemini} className="space-y-3 font-['Inter',sans-serif]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ex: Como a CVM entende o abuso do poder de controle neste tema?"
                    value={qaQuestion}
                    onChange={e => setQaQuestion(e.target.value)}
                    className="flex-1 bg-white border border-[#A9832E]/35 rounded-2xl px-4 py-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                  />
                  <button
                    type="submit"
                    disabled={qaLoading || !qaQuestion.trim()}
                    className="px-4 py-2 bg-[#A7002F] disabled:opacity-50 text-white rounded-2xl text-xs font-semibold cursor-pointer hover:bg-[#5C0A22]"
                  >
                    {qaLoading ? 'Pensando...' : 'Perguntar'}
                  </button>
                </div>
              </form>
              {qaAnswer && (
                <div className="p-4 bg-white border border-[#A9832E]/30 rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-['Inter',sans-serif] font-bold text-[#A7002F]">
                    <Sparkles className="w-3.5 h-3.5 text-[#A9832E]" />
                    <span>Resposta Fundamentada (Gemini LDS FDR):</span>
                  </div>
                  <div className="text-xs sm:text-sm text-[#211A15] leading-relaxed whitespace-pre-line font-sans">
                    {qaAnswer}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-[#F4EDE0] border-t border-[#E5DBCA] flex items-center justify-between text-xs font-['Inter',sans-serif]">
              <span className="text-[#6B5D4F]">
                Contextualizado com as notas e os {qaLesson.materials?.length || 0} materiais da aula.
              </span>
              <button
                onClick={() => setQaLesson(null)}
                className="px-4 py-1.5 bg-white border border-[#A9832E]/30 rounded-xl text-[#211A15] hover:bg-[#FAF5EA]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lesson Modal */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF5EA] border border-[#A7002F]/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden font-['Source_Serif_4',serif]">
            <div className="p-5 bg-gradient-to-r from-[#5C0A22] to-[#A7002F] text-white flex items-center justify-between">
              <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold">
                Cadastrar Nova Aula no Cronograma
              </h3>
              <button
                onClick={() => setShowAddLessonModal(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateNewLesson} className="p-6 space-y-4 font-['Inter',sans-serif] text-xs">
              <div>
                <label className="block font-bold text-[#211A15] mb-1">Título da Aula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dissolução Parcial de Sociedade e Apuração de Haveres"
                  value={newLessonTitle}
                  onChange={e => setNewLessonTitle(e.target.value)}
                  className="w-full bg-white border border-[#A9832E]/35 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#211A15] mb-1">Data do Encontro</label>
                  <input
                    type="text"
                    placeholder="Ex: 14 de outubro de 2026"
                    value={newLessonDate}
                    onChange={e => setNewLessonDate(e.target.value)}
                    className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211A15] mb-1">Fase Temática</label>
                  <select
                    value={newLessonPhase}
                    onChange={e => setNewLessonPhase(e.target.value as any)}
                    className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  >
                    <option value="Direito Societário Básico">Direito Societário Básico</option>
                    <option value="Mercado de Capitais">Mercado de Capitais</option>
                    <option value="Reorganizações & Prática">Reorganizações & Prática</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#211A15] mb-1">Professor Responsável / Convidado</label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Marcelo Von Adamek"
                  value={newLessonProfessor}
                  onChange={e => setNewLessonProfessor(e.target.value)}
                  className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5DBCA]">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 text-[#6B5D4F] hover:text-[#211A15]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A7002F] text-white rounded-full font-semibold shadow-xs hover:bg-[#5C0A22]"
                >
                  Cadastrar Aula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Detail / Edit Modal */}
      <LessonDetailModal
        lesson={activeLessonModal}
        isOpen={!!activeLessonModal}
        onClose={() => setActiveLessonModal(null)}
        onSaveLesson={onUpdateLesson}
        onAskAiAboutLesson={num => {
          setActiveLessonModal(null);
          onSelectLessonForAgent(num);
        }}
      />
    </div>
  );
};
