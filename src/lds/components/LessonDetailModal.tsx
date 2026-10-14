/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lesson, LessonMaterial, LessonLink, BibliographyItem } from '../types';
import { FACULTY_MEMBERS } from '../data/curriculum';
import {
  X,
  Calendar,
  Clock,
  User,
  CheckCircle2,
  FileText,
  UploadCloud,
  Trash2,
  Sparkles,
  Save,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Link as LinkIcon,
  Plus,
  Copy,
  Check,
  Presentation,
  BookMarked
} from 'lucide-react';

interface LessonDetailModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLesson: (updated: Lesson) => void;
  onAskAiAboutLesson: (lessonNumber: number) => void;
}

export const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onSaveLesson,
  onAskAiAboutLesson
}) => {
  if (!isOpen || !lesson) return null;

  const [activeTab, setActiveTab] = useState<'geral' | 'slides' | 'bibliografia' | 'links' | 'anotacoes'>('geral');
  const [status, setStatus] = useState<'completed' | 'current' | 'upcoming'>(lesson.status);
  const [actualProfessor, setActualProfessor] = useState<string>(lesson.actualProfessor || lesson.instructorName || '');
  const [actualProfessorRole, setActualProfessorRole] = useState<string>(lesson.actualProfessorRole || lesson.instructorRole || '');
  const [slidesUrl, setSlidesUrl] = useState<string>(lesson.slidesUrl || '');
  const [slidesTitle, setSlidesTitle] = useState<string>(lesson.slidesTitle || `Slides da Aula ${lesson.lessonNumber}: ${lesson.title}`);
  const [personalNotes, setPersonalNotes] = useState<string>(lesson.personalNotes || '');
  const [materials, setMaterials] = useState<LessonMaterial[]>(lesson.materials || []);
  const [links, setLinks] = useState<LessonLink[]>(lesson.links || []);
  const [bibliography, setBibliography] = useState<BibliographyItem[]>(lesson.bibliographyItems || []);

  const [showAddLink, setShowAddLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkCategory, setNewLinkCategory] = useState<'Legislação' | 'Jurisprudência CVM/STJ' | 'Artigo / Doutrina' | 'Slides / Apresentação' | 'Geral'>('Geral');

  const [showAddBib, setShowAddBib] = useState(false);
  const [newBibAuthor, setNewBibAuthor] = useState('');
  const [newBibTitle, setNewBibTitle] = useState('');
  const [newBibWork, setNewBibWork] = useState('');
  const [newBibPages, setNewBibPages] = useState('');
  const [newBibRequired, setNewBibRequired] = useState(true);

  const [copiedSummary, setCopiedSummary] = useState(false);

  const handleSave = () => {
    const updated: Lesson = {
      ...lesson,
      status,
      actualProfessor: actualProfessor.trim(),
      actualProfessorRole: actualProfessorRole.trim(),
      slidesUrl: slidesUrl.trim(),
      slidesTitle: slidesTitle.trim(),
      personalNotes: personalNotes.trim(),
      materials,
      links,
      bibliographyItems: bibliography
    };
    onSaveLesson(updated);
    onClose();
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    let formattedUrl = newLinkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    const newLinkItem: LessonLink = {
      id: `link-${Date.now()}`,
      title: newLinkTitle.trim(),
      url: formattedUrl,
      category: newLinkCategory
    };
    setLinks(prev => [...prev, newLinkItem]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setShowAddLink(false);
  };

  const handleRemoveLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  const handleAddBibliography = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBibAuthor.trim() || !newBibTitle.trim()) return;
    const newBibItem: BibliographyItem = {
      id: `bib-${Date.now()}`,
      author: newBibAuthor.trim(),
      title: newBibTitle.trim(),
      work: newBibWork.trim() || undefined,
      pages: newBibPages.trim() || undefined,
      required: newBibRequired
    };
    setBibliography(prev => [...prev, newBibItem]);
    setNewBibAuthor('');
    setNewBibTitle('');
    setNewBibWork('');
    setNewBibPages('');
    setShowAddBib(false);
  };

  const handleRemoveBibliography = (id: string) => {
    setBibliography(prev => prev.filter(b => b.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const isSlide = file.name.match(/\.(ppt|pptx)$/i) || file.name.toLowerCase().includes('slide');
    const newMat: LessonMaterial = {
      id: `mat-${Date.now()}`,
      name: file.name,
      type: isSlide ? 'slide' : 'pdf',
      size: `${sizeInMb} MB`,
      addedAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
    setMaterials(prev => [...prev, newMat]);
  };

  const handleRemoveMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleCopyLessonSummary = async () => {
    const text = `# AULA ${lesson.lessonNumber.toString().padStart(2, '0')}: ${lesson.title}
Data: ${lesson.fullDate} (${lesson.dateStr})
Professor(a): ${actualProfessor || 'Não informado'} (${actualProfessorRole || 'LDS FDR'})
Status da Aula: ${status === 'completed' ? 'Já Realizada' : status === 'current' ? 'Aula Desta Semana' : 'Próxima Aula'}

## 1. SLIDES E APRESENTAÇÃO DO PROFESSOR:
${slidesUrl ? `- Link dos Slides: ${slidesUrl}` : '- Nenhum link externo de slides registrado.'}
${materials.filter(m => m.type === 'slide').map(m => `- Arquivo de slides: ${m.name}`).join('\n')}

## 2. ANOTAÇÕES DA AULA:
${personalNotes || 'Nenhuma anotação pessoal inserida.'}

## 3. BIBLIOGRAFIA E LEITURAS RECOMENDADAS:
${bibliography.map(b => `- ${b.required ? '[OBRIGATÓRIA]' : '[COMPLEMENTAR]'} ${b.author}: ${b.title}${b.work ? ` (${b.work})` : ''}${b.pages ? ` - ${b.pages}` : ''}`).join('\n')}

## 4. LINKS ÚTEIS E PRECEDENTES:
${links.map(l => `- [${l.category || 'Link'}] ${l.title}: ${l.url}`).join('\n')}

## 5. PONTOS DOGMÁTICOS PRINCIPAIS:
${lesson.keyPoints.map(kp => `- ${kp}`).join('\n')}

## 6. LEGISLAÇÃO APLICÁVEL:
${lesson.legislation.map(l => `- ${l.lawTag} ${l.article}: "${l.text}"`).join('\n')}
`;
    await navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF5EA] border border-[#A7002F]/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-['Source_Serif_4',serif]">
        {/* Modal Top Banner */}
        <div className="p-6 bg-gradient-to-r from-[#5C0A22] via-[#A7002F] to-[#7B0B2A] text-[#FAF5EA] flex items-start justify-between relative shadow-md">
          <div className="pr-6 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="eyebrow-lds text-[#FAF5EA]/85 text-[11px] tracking-widest uppercase font-bold">
                AULA {lesson.lessonNumber.toString().padStart(2, '0')} • {lesson.phase}
              </span>
              <span className={`text-[10px] font-['Inter',sans-serif] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                status === 'completed'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : status === 'current'
                  ? 'bg-[#A9832E] text-white shadow-2xs'
                  : 'bg-white/20 text-white'
              }`}>
                {status === 'completed' ? '✓ Aula Realizada' : status === 'current' ? '★ Em Andamento' : 'Próxima Aula'}
              </span>
            </div>
            <h2 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {lesson.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs font-['Inter',sans-serif] text-white/80 pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E5DBCA]" />
                <span>{lesson.fullDate} ({lesson.dateStr})</span>
              </span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E5DBCA]" />
                <span>{lesson.duration}</span>
              </span>
              {actualProfessor && (
                <>
                  <span aria-hidden="true">•</span>
                  <span className="flex items-center gap-1.5 font-semibold text-white">
                    <GraduationCap className="w-3.5 h-3.5 text-[#E5DBCA]" />
                    <span>Prof. {actualProfessor}</span>
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#F4EDE0] border-b border-[#A9832E]/25 px-6 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar font-['Inter',sans-serif] text-xs">
          <button
            onClick={() => setActiveTab('geral')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-semibold ${
              activeTab === 'geral'
                ? 'bg-[#A7002F] text-white shadow-xs'
                : 'text-[#6B5D4F] hover:bg-white/60 hover:text-[#211A15]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Geral & Professor</span>
          </button>
          <button
            onClick={() => setActiveTab('slides')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-semibold ${
              activeTab === 'slides'
                ? 'bg-[#A7002F] text-white shadow-xs'
                : 'text-[#6B5D4F] hover:bg-white/60 hover:text-[#211A15]'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" />
            <span>Slides do Professor {slidesUrl || materials.some(m => m.type === 'slide') ? '✓' : ''}</span>
          </button>
          <button
            onClick={() => setActiveTab('bibliografia')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-semibold ${
              activeTab === 'bibliografia'
                ? 'bg-[#A7002F] text-white shadow-xs'
                : 'text-[#6B5D4F] hover:bg-white/60 hover:text-[#211A15]'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Bibliografia ({bibliography.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-semibold ${
              activeTab === 'links'
                ? 'bg-[#A7002F] text-white shadow-xs'
                : 'text-[#6B5D4F] hover:bg-white/60 hover:text-[#211A15]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Links Úteis ({links.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('anotacoes')}
            className={`px-4 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 font-semibold ${
              activeTab === 'anotacoes'
                ? 'bg-[#A7002F] text-white shadow-xs'
                : 'text-[#6B5D4F] hover:bg-white/60 hover:text-[#211A15]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Minhas Anotações {personalNotes ? '✓' : ''}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#211A15]">
          {/* TAB 1: GERAL & PROFESSOR */}
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <div className="bg-[#F4EDE0] border border-[#A9832E]/30 rounded-3xl p-5 space-y-5 font-['Inter',sans-serif]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#A7002F] uppercase tracking-wider mb-2">
                      Situação da Aula no Semestre
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-white border border-[#E5DBCA] rounded-2xl text-xs">
                      <button
                        type="button"
                        onClick={() => setStatus('completed')}
                        className={`py-2 px-2 rounded-xl font-medium transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                          status === 'completed'
                            ? 'bg-emerald-700 text-white shadow-xs font-bold'
                            : 'text-[#6B5D4F] hover:text-[#211A15]'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Realizada</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('current')}
                        className={`py-2 px-2 rounded-xl font-medium transition-all cursor-pointer text-center flex items-center justify-center gap-1 ${
                          status === 'current'
                            ? 'bg-[#A9832E] text-white shadow-xs font-bold'
                            : 'text-[#6B5D4F] hover:text-[#211A15]'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>Em Foco</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('upcoming')}
                        className={`py-2 px-2 rounded-xl font-medium transition-all cursor-pointer text-center ${
                          status === 'upcoming'
                            ? 'bg-[#5C0A22] text-white shadow-xs font-bold'
                            : 'text-[#6B5D4F] hover:text-[#211A15]'
                        }`}
                      >
                        <span>Próxima</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A7002F] uppercase tracking-wider mb-2">
                      Professor que Ministrou a Aula *
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nome do professor ou palestrante convidado..."
                        value={actualProfessor}
                        onChange={e => setActualProfessor(e.target.value)}
                        className="w-full bg-white border border-[#A9832E]/35 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                      />
                      <input
                        type="text"
                        placeholder="Titulação / Instituição (ex: FDR, Juiz, Sócio de Escritório)..."
                        value={actualProfessorRole}
                        onChange={e => setActualProfessorRole(e.target.value)}
                        className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3 py-1.5 text-xs text-[#211A15] focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] text-[#6B5D4F] self-center">Sugestões:</span>
                        {FACULTY_MEMBERS.slice(0, 5).map(f => (
                          <button
                            key={f.id}
                            type="button"
                            onClick={() => {
                              setActualProfessor(f.name);
                              setActualProfessorRole(f.affiliation || f.role);
                            }}
                            className="text-[10px] bg-white border border-[#E5DBCA] hover:border-[#A7002F] text-[#5C0A22] px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Central Key Points */}
              <div className="bg-white border border-[#E5DBCA] rounded-3xl p-5 shadow-xs space-y-3">
                <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#A7002F] flex items-center gap-2">
                  <span>Tópicos & Normas Fundamentais Abordadas</span>
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.legislation.map((l, idx) => (
                    <span key={idx} className="bg-[#FAF5EA] border border-[#A9832E]/30 text-[#5C0A22] px-3 py-1 rounded-full text-xs font-semibold">
                      {l.lawTag} {l.article}
                    </span>
                  ))}
                </div>
                <ul className="space-y-1.5 pt-2 text-xs sm:text-sm text-[#211A15]">
                  {lesson.keyPoints.map((kp, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#A9832E] font-bold mt-0.5">•</span>
                      <span className="leading-relaxed">{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Attached Materials */}
              <div className="bg-white border border-[#E5DBCA] rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#211A15] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#A7002F]" />
                    <span>Materiais e Documentos Anexados ({materials.length})</span>
                  </h3>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5EA] hover:bg-[#F4EDE0] text-[#5C0A22] border border-[#A9832E]/40 rounded-full text-xs font-semibold font-['Inter',sans-serif] cursor-pointer transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-[#A7002F]" />
                    <span>Anexar Novo Arquivo</span>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {materials.length > 0 ? (
                  <div className="space-y-2 font-['Inter',sans-serif]">
                    {materials.map(mat => (
                      <div
                        key={mat.id}
                        className="flex items-center justify-between p-3 bg-[#FAF5EA] border border-[#E5DBCA] rounded-2xl text-xs hover:border-[#A7002F]/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#5C0A22] text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                            {mat.type}
                          </div>
                          <div>
                            <div className="font-semibold text-[#211A15]">{mat.name}</div>
                            <div className="text-[11px] text-[#6B5D4F]">
                              {mat.size && <span>{mat.size} • </span>}
                              <span>Adicionado em {mat.addedAt}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(mat.id)}
                          className="p-1.5 text-[#6B5D4F] hover:text-red-700 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Remover arquivo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B5D4F] italic">Nenhum arquivo anexado ainda.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SLIDES DO PROFESSOR */}
          {activeTab === 'slides' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#FDFBF7] to-[#F4EDE0] border border-[#A9832E]/30 rounded-3xl p-6 shadow-xs space-y-4 font-['Inter',sans-serif]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-5 h-5 text-[#A7002F]" />
                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#A7002F]">
                      Slides da Aula do Professor
                    </h3>
                  </div>
                  {slidesUrl && (
                    <a
                      href={slidesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#A7002F] text-white rounded-full text-xs font-semibold shadow-xs hover:bg-[#5C0A22] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir Slides em Tela Cheia</span>
                    </a>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#6B5D4F] leading-relaxed">
                  Cadastre o link da apresentação fornecida pelo professor (Google Slides, Canva, Microsoft OneDrive, pasta de apresentações) ou utilize os arquivos de slides anexados.
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-[#211A15] mb-1">
                      Link Web da Apresentação de Slides:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://docs.google.com/presentation/... ou link do Canva/Drive"
                        value={slidesUrl}
                        onChange={e => setSlidesUrl(e.target.value)}
                        className="flex-1 bg-white border border-[#A9832E]/35 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                      />
                      {slidesUrl && (
                        <a
                          href={slidesUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-white border border-[#A9832E]/35 text-[#5C0A22] hover:bg-[#FAF5EA] rounded-xl text-xs font-semibold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Testar</span>
                        </a>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#211A15] mb-1">
                      Título / Tema da Apresentação
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Slides - Teoria Geral das Sociedades e Autonomia Patrimonial"
                      value={slidesTitle}
                      onChange={e => setSlidesTitle(e.target.value)}
                      className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3.5 py-1.5 text-xs text-[#211A15] focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Slides File Option */}
              <div className="bg-white border border-[#E5DBCA] rounded-3xl p-5 shadow-xs space-y-4 font-['Inter',sans-serif]">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#A7002F]">
                    Arquivos de Slides Locais (.PPT, .PPTX, .PDF)
                  </h4>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4EDE0] hover:bg-[#FAF5EA] text-[#5C0A22] border border-[#A9832E]/35 rounded-full text-xs font-semibold cursor-pointer transition-colors">
                    <UploadCloud className="w-3.5 h-3.5 text-[#A7002F]" />
                    <span>Upload Arquivo de Slides</span>
                    <input
                      type="file"
                      accept=".ppt,.pptx,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                {materials.filter(m => m.type === 'slide').length > 0 ? (
                  <div className="space-y-2">
                    {materials
                      .filter(m => m.type === 'slide')
                      .map(mat => (
                        <div
                          key={mat.id}
                          className="flex items-center justify-between p-3.5 bg-[#FAF5EA] border border-[#E5DBCA] rounded-2xl text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Presentation className="w-5 h-5 text-[#A7002F]" />
                            <div>
                              <div className="font-bold text-[#211A15]">{mat.name}</div>
                              <div className="text-[11px] text-[#6B5D4F]">
                                Formato Slides • {mat.size || 'Arquivo'}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMaterial(mat.id)}
                            className="text-[#6B5D4F] hover:text-red-700 p-1.5 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-[#A9832E]/35 rounded-2xl bg-[#FAF5EA]/50 text-xs text-[#6B5D4F]">
                    Nenhum arquivo de slide anexado diretamente. Faça o upload ou insira o link web do Google Slides acima.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: BIBLIOGRAFIA */}
          {activeTab === 'bibliografia' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E5DBCA] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#A7002F] flex items-center gap-2">
                      <BookMarked className="w-5 h-5" />
                      <span>Bibliografia & Doutrina da Aula</span>
                    </h3>
                    <p className="text-xs text-[#6B5D4F] font-['Inter',sans-serif]">
                      Obras fundamentais, capítulos de manuais e artigos recomendados pelo professor para esta aula.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddBib(!showAddBib)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF5EA] hover:bg-[#F4EDE0] text-[#5C0A22] border border-[#A9832E]/40 rounded-full text-xs font-semibold font-['Inter',sans-serif] cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#A7002F]" />
                    <span>Adicionar Bibliografia</span>
                  </button>
                </div>

                {showAddBib && (
                  <form onSubmit={handleAddBibliography} className="p-4 bg-[#F4EDE0] border border-[#A9832E]/35 rounded-2xl space-y-3 font-['Inter',sans-serif] text-xs">
                    <div className="font-bold text-[#A7002F]">Nova Indicação Bibliográfica:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#211A15] mb-1">Autor(es) *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: CARVALHOSA, Modesto"
                          value={newBibAuthor}
                          onChange={e => setNewBibAuthor(e.target.value)}
                          className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#211A15] mb-1">Título da Obra *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Comentários à Lei de Sociedades Anônimas"
                          value={newBibTitle}
                          onChange={e => setNewBibTitle(e.target.value)}
                          className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#211A15] mb-1">Editora / Edição</label>
                        <input
                          type="text"
                          placeholder="Ex: Editora Saraiva, 6ª ed."
                          value={newBibWork}
                          onChange={e => setNewBibWork(e.target.value)}
                          className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#211A15] mb-1">Páginas / Capítulos Recomendados</label>
                        <input
                          type="text"
                          placeholder="Ex: Cap. IV, pp. 88-124"
                          value={newBibPages}
                          onChange={e => setNewBibPages(e.target.value)}
                          className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={newBibRequired}
                          onChange={e => setNewBibRequired(e.target.checked)}
                          className="rounded text-[#A7002F]"
                        />
                        <span className="font-semibold text-[#211A15]">Leitura Obrigatória para a Aula</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddBib(false)}
                          className="px-3 py-1.5 text-[#6B5D4F] hover:text-[#211A15]"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-[#A7002F] text-white rounded-xl font-semibold shadow-xs"
                        >
                          Salvar Indicação
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-3 font-['Inter',sans-serif]">
                  {bibliography.map(item => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between p-4 bg-[#FAF5EA] border border-[#E5DBCA] rounded-2xl hover:border-[#A9832E]/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.required
                              ? 'bg-[#A7002F] text-white'
                              : 'bg-white border border-[#E5DBCA] text-[#6B5D4F]'
                          }`}>
                            {item.required ? 'Leitura Obrigatória' : 'Complementar'}
                          </span>
                          <span className="font-bold text-xs text-[#5C0A22]">{item.author}</span>
                        </div>
                        <div className="font-['Source_Serif_4',serif] text-sm font-semibold text-[#211A15]">
                          "{item.title}"
                        </div>
                        {(item.work || item.pages) && (
                          <div className="text-xs text-[#6B5D4F]">
                            {item.work && <span>{item.work} • </span>}
                            {item.pages && <span>Indicação: {item.pages}</span>}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBibliography(item.id)}
                        className="text-[#6B5D4F] hover:text-red-700 p-1.5 rounded-lg"
                        title="Remover indicação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LINKS ÚTEIS */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E5DBCA] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#A7002F] flex items-center gap-2">
                      <LinkIcon className="w-5 h-5" />
                      <span>Links Úteis, Jurisprudência & Fontes</span>
                    </h3>
                    <p className="text-xs text-[#6B5D4F] font-['Inter',sans-serif]">
                      Legislação no Planalto, decisões da CVM, acórdãos do STJ e referências da aula.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddLink(!showAddLink)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF5EA] hover:bg-[#F4EDE0] text-[#5C0A22] border border-[#A9832E]/40 rounded-full text-xs font-semibold font-['Inter',sans-serif] cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#A7002F]" />
                    <span>Adicionar Link</span>
                  </button>
                </div>

                {showAddLink && (
                  <form onSubmit={handleAddLink} className="p-4 bg-[#F4EDE0] border border-[#A9832E]/35 rounded-2xl space-y-3 font-['Inter',sans-serif] text-xs">
                    <div className="font-bold text-[#A7002F]">Novo Link para a Aula:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#211A15] mb-1">Título do Link *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Parecer CVM nº 35/2008"
                          value={newLinkTitle}
                          onChange={e => setNewLinkTitle(e.target.value)}
                          className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#211A15] mb-1">URL (Endereço Web) *</label>
                        <input
                          type="text"
                          required
                          placeholder="https://..."
                          value={newLinkUrl}
                          onChange={e => setNewLinkUrl(e.target.value)}
                          className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#211A15] mb-1">Categoria do Link</label>
                        <select
                          value={newLinkCategory}
                          onChange={e => setNewLinkCategory(e.target.value as any)}
                          className="w-full bg-white border border-[#E5DBCA] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                        >
                          <option value="Legislação">Legislação (Planalto, Códigos)</option>
                          <option value="Jurisprudência CVM/STJ">Jurisprudência CVM / STJ / Tribunais</option>
                          <option value="Artigo / Doutrina">Artigo / Doutrina / Parecer</option>
                          <option value="Slides / Apresentação">Slides / Apresentação</option>
                          <option value="Geral">Geral</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddLink(false)}
                        className="px-3 py-1.5 text-[#6B5D4F] hover:text-[#211A15]"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#A7002F] text-white rounded-xl font-semibold shadow-xs"
                      >
                        Salvar Link
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2.5 font-['Inter',sans-serif]">
                  {links.map(link => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between p-3.5 bg-[#FAF5EA] border border-[#E5DBCA] rounded-2xl hover:border-[#A7002F]/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold bg-white border border-[#A9832E]/30 text-[#A7002F] px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {link.category || 'Link'}
                          </span>
                          <span className="font-bold text-xs text-[#211A15]">{link.title}</span>
                        </div>
                        {link.description && (
                          <div className="text-[11px] text-[#6B5D4F]">{link.description}</div>
                        )}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-[#A7002F] hover:underline flex items-center gap-1 font-medium"
                        >
                          <span>{link.url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white border border-[#A9832E]/35 text-[#5C0A22] rounded-xl hover:bg-[#FAF5EA] text-xs font-semibold flex items-center gap-1"
                        >
                          <span>Abrir</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(link.id)}
                          className="text-[#6B5D4F] hover:text-red-700 p-1.5 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MINHAS ANOTAÇÕES DA AULA */}
          {activeTab === 'anotacoes' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E5DBCA] rounded-3xl p-6 shadow-xs space-y-4 font-['Inter',sans-serif]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#A7002F] flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      <span>Caderno de Anotações do Aluno</span>
                    </h3>
                    <p className="text-xs text-[#6B5D4F]">
                      Suas notas tomadas em tempo real durante o encontro da LDS FDR. Ficam salvas com segurança.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLessonSummary}
                      className="px-3.5 py-1.5 bg-[#F4EDE0] hover:bg-[#FAF5EA] border border-[#A9832E]/40 text-[#5C0A22] rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Copiar resumo estruturado da aula"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-800">Copiado com sucesso!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#A7002F]" />
                          <span>Copiar Resumo da Aula</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onAskAiAboutLesson(lesson.lessonNumber);
                      }}
                      className="px-3.5 py-1.5 bg-[#5C0A22] hover:bg-[#A7002F] text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FAF5EA]" />
                      <span>Tirar Dúvida com Gemini</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[11px] text-[#6B5D4F] self-center">Tópicos para registrar:</span>
                  {[
                    'Pontos frisados pelo professor',
                    'Divergência doutrinária exposta',
                    'Jurisprudência CVM mencionada',
                    'Exemplo prático de M&A / Acordo'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const addition = `\n\n### ${chip}:\n- `;
                        setPersonalNotes(prev => prev ? `${prev}${addition}` : `### ${chip}:\n- `);
                      }}
                      className="text-[11px] bg-[#FAF5EA] hover:bg-[#F4EDE0] border border-[#E5DBCA] text-[#A7002F] px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={10}
                  placeholder="Escreva aqui tudo o que o professor falou, anotações de lousa, dúvidas que surgiram para prova, debates entre os membros da Liga e artigos que merecem destaque..."
                  value={personalNotes}
                  onChange={e => setPersonalNotes(e.target.value)}
                  className="w-full bg-[#FAF5EA] border border-[#A9832E]/35 rounded-2xl p-4 text-xs sm:text-sm text-[#211A15] font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#A7002F] shadow-inner"
                />
                <div className="flex items-center justify-between text-[11px] text-[#6B5D4F]">
                  <span>{personalNotes.length} caracteres digitados</span>
                  <span>Salvo automaticamente no caderno digital da FDR</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Actions */}
        <div className="p-5 bg-[#F4EDE0] border-t border-[#E5DBCA] flex flex-wrap items-center justify-between gap-3 font-['Inter',sans-serif] text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLessonSummary}
              className="px-3.5 py-2 text-xs font-semibold text-[#5C0A22] bg-white border border-[#A9832E]/35 hover:bg-[#FAF5EA] rounded-full cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Copy className="w-3.5 h-3.5 text-[#A7002F]" />
              <span>Copiar Resumo da Aula</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onAskAiAboutLesson(lesson.lessonNumber);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#5C0A22] hover:bg-[#A7002F] rounded-full cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FAF5EA]" />
              <span>Tirar Dúvida com IA</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#6B5D4F] hover:text-[#211A15] cursor-pointer"
            >
              Descartar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-xs font-bold text-white bg-[#A7002F] hover:bg-[#5C0A22] rounded-full shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar Alterações da Aula</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
