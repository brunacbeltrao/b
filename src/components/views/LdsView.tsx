/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  BookMarked,
  BookOpen,
  Cpu,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-react';
import { ScheduleView } from '../../lds/components/ScheduleView';
import { AgentWorkspace } from '../../lds/components/AgentWorkspace';
import { RepositoryView } from '../../lds/components/RepositoryView';
import { GlossaryView } from '../../lds/components/GlossaryView';
import { FacultyView } from '../../lds/components/FacultyView';
import { ConductCodeModal } from '../../lds/components/ConductCodeModal';
import { LdsCrest, LdsLogo } from '../../lds/components/LdsBrand';
import { Lesson, DocumentItem } from '../../lds/types';
import { LESSONS_DATABASE } from '../../lds/data/curriculum';
import { INITIAL_DOCUMENTS } from '../../lds/data/documents';

export type LdsSubTab = 'cronograma' | 'glossario' | 'repositorio' | 'agente' | 'docentes';

export const LdsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LdsSubTab>('cronograma');
  const [selectedLessonForAgent, setSelectedLessonForAgent] = useState<number>(1);
  const [isConductModalOpen, setIsConductModalOpen] = useState<boolean>(false);

  // Persistent customizable lessons state with clean baseline
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('lds_fdr_lessons_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return LESSONS_DATABASE;
  });

  // Persistent documents state, automatically synchronized with lesson attachments
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('lds_fdr_documents_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_DOCUMENTS;
  });

  // Helper to synchronize lesson attachments directly to repository
  const syncLessonAttachmentsToDocuments = (lesson: Lesson, currentDocs: DocumentItem[]): DocumentItem[] => {
    const generatedDocs: DocumentItem[] = [];

    // 1. Materials & PDFs attached to this lesson
    if (lesson.materials && lesson.materials.length > 0) {
      lesson.materials.forEach(mat => {
        generatedDocs.push({
          id: `doc-mat-${mat.id}`,
          title: `[Aula ${lesson.lessonNumber}] ${mat.name}`,
          type: mat.type === 'slide' ? 'Slide' : (mat.type === 'link' ? 'Link Útil' : 'Material de Aula'),
          lessonNumber: lesson.lessonNumber,
          source: lesson.actualProfessor ? `Prof. ${lesson.actualProfessor}` : `Aula ${lesson.lessonNumber} • LDS FDR`,
          summary: mat.notes || `Material anexado à Aula ${lesson.lessonNumber}: ${mat.name} (${mat.size || 'arquivo'}).`,
          content: `Material de apoio da Aula ${lesson.lessonNumber}: ${lesson.title}\nArquivo: ${mat.name}\nTipo: ${mat.type}\nData de Inserção: ${mat.addedAt}\n${mat.url ? `URL de Acesso: ${mat.url}\n` : ''}${mat.notes ? `Observações: ${mat.notes}` : ''}`,
          dateAdded: mat.addedAt || new Date().toISOString().split('T')[0],
          tags: [`Aula ${lesson.lessonNumber}`, mat.type.toUpperCase(), 'Anexo da Aula'],
          fileUrl: mat.url,
          isLessonAttachment: true
        });
      });
    }

    // 2. Professor's Slides URL
    if (lesson.slidesUrl && lesson.slidesUrl.trim()) {
      generatedDocs.push({
        id: `doc-slide-lesson-${lesson.lessonNumber}`,
        title: `[Slides] Aula ${lesson.lessonNumber}: ${lesson.title}`,
        type: 'Slide',
        lessonNumber: lesson.lessonNumber,
        source: lesson.actualProfessor ? `Prof. ${lesson.actualProfessor}` : `Aula ${lesson.lessonNumber} • LDS FDR`,
        summary: `Apresentação de slides cadastrada para a Aula ${lesson.lessonNumber}.`,
        content: `Apresentação de slides do professor da Aula ${lesson.lessonNumber}: ${lesson.title}\nData: ${lesson.fullDate}\nProfessor(a): ${lesson.actualProfessor || 'A definir'}\nLink: ${lesson.slidesUrl}`,
        dateAdded: new Date().toISOString().split('T')[0],
        tags: [`Aula ${lesson.lessonNumber}`, 'Slide', 'Professor'],
        fileUrl: lesson.slidesUrl,
        isLessonAttachment: true
      });
    }

    // 3. Structured links
    if (lesson.links && lesson.links.length > 0) {
      lesson.links.forEach(l => {
        generatedDocs.push({
          id: `doc-link-${l.id}`,
          title: `[Link] ${l.title} (Aula ${lesson.lessonNumber})`,
          type: l.category === 'Legislação' ? 'Norma' : l.category === 'Jurisprudência CVM/STJ' ? 'Jurisprudência' : l.category === 'Slides / Apresentação' ? 'Slide' : 'Doutrina',
          lessonNumber: lesson.lessonNumber,
          source: `Aula ${lesson.lessonNumber} • ${lesson.title}`,
          summary: l.description || `Link de estudo e pesquisa: ${l.url}`,
          content: `Link de referência cadastrado na Aula ${lesson.lessonNumber}: ${lesson.title}\nTítulo: ${l.title}\nCategoria: ${l.category || 'Geral'}\nURL: ${l.url}\n${l.description ? `Descrição: ${l.description}` : ''}`,
          dateAdded: new Date().toISOString().split('T')[0],
          tags: [`Aula ${lesson.lessonNumber}`, l.category || 'Link'],
          fileUrl: l.url,
          isLessonAttachment: true
        });
      });
    }

    // Merge generatedDocs into currentDocs: update if exists or prepend
    let updatedDocs = [...currentDocs];
    generatedDocs.forEach(genDoc => {
      const existingIdx = updatedDocs.findIndex(d => d.id === genDoc.id);
      if (existingIdx >= 0) {
        updatedDocs[existingIdx] = genDoc;
      } else {
        updatedDocs.unshift(genDoc);
      }
    });

    return updatedDocs;
  };

  const handleUpdateLesson = (updatedLesson: Lesson) => {
    // 1. Update lessons
    setLessons(prev => {
      const exists = prev.some(l => l.lessonNumber === updatedLesson.lessonNumber);
      let next: Lesson[];
      if (exists) {
        next = prev.map(l => (l.lessonNumber === updatedLesson.lessonNumber ? updatedLesson : l));
      } else {
        next = [...prev, updatedLesson];
      }
      localStorage.setItem('lds_fdr_lessons_v2', JSON.stringify(next));
      return next;
    });

    // 2. Synchronize attachments directly to repository
    setDocuments(prevDocs => {
      const synchronized = syncLessonAttachmentsToDocuments(updatedLesson, prevDocs);
      localStorage.setItem('lds_fdr_documents_v2', JSON.stringify(synchronized));
      return synchronized;
    });
  };

  const handleAddDocument = (newDoc: DocumentItem) => {
    setDocuments(prev => {
      const next = [newDoc, ...prev];
      localStorage.setItem('lds_fdr_documents_v2', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => {
      const next = prev.filter(d => d.id !== id);
      localStorage.setItem('lds_fdr_documents_v2', JSON.stringify(next));
      return next;
    });
  };

  const handleSelectLessonForAgent = (lessonNumber: number) => {
    setSelectedLessonForAgent(lessonNumber);
    setActiveTab('agente');
  };

  const handleOpenDocumentsForLesson = () => {
    setActiveTab('repositorio');
  };

  return (
    <div className="space-y-6">
      {/* Sub-navegação do Módulo LDS */}
      <div className="bg-white p-2.5 rounded-2xl border border-[#e6e4e8] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveTab('cronograma')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'cronograma'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#f6f5f7]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Acompanhar Aulas</span>
          </button>

          <button
            onClick={() => setActiveTab('glossario')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'glossario'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#f6f5f7]'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Glossário Societário</span>
          </button>

          <button
            onClick={() => setActiveTab('repositorio')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'repositorio'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#f6f5f7]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Repositório & Materiais</span>
          </button>

          <button
            onClick={() => setActiveTab('agente')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'agente'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#f6f5f7]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Tira-Dúvidas IA</span>
          </button>

          <button
            onClick={() => setActiveTab('docentes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'docentes'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-[#f6f5f7]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Corpo Docente & Diretoria</span>
          </button>
        </div>

        {/* Quick Actions (Conduta & Dúvidas) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsConductModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-[#8b1538] border border-stone-200 rounded-xl transition-colors bg-white hover:bg-stone-50 cursor-pointer"
            title="Código de Conduta da LDS FDR"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Código de Conduta</span>
          </button>
          <button
            onClick={() => {
              setSelectedLessonForAgent(selectedLessonForAgent || 1);
              setActiveTab('agente');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8b1538] hover:brightness-110 rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dúvidas da Aula</span>
          </button>
        </div>
      </div>

      {/* Main SubTab Content Area */}
      <div className="bg-[#f6f5f7]/40 rounded-2xl border border-[#e6e4e8] p-1 sm:p-3">
        {activeTab === 'cronograma' && (
          <ScheduleView
            lessons={lessons}
            onUpdateLesson={handleUpdateLesson}
            onSelectLessonForAgent={handleSelectLessonForAgent}
            onOpenDocumentsForLesson={handleOpenDocumentsForLesson}
          />
        )}

        {activeTab === 'glossario' && (
          <GlossaryView
            onAskAgentAboutTerm={() => {
              setActiveTab('agente');
            }}
            onGoToLesson={lessonNum => {
              setSelectedLessonForAgent(lessonNum);
              setActiveTab('cronograma');
            }}
          />
        )}

        {activeTab === 'agente' && (
          <AgentWorkspace
            initialLessonNumber={selectedLessonForAgent}
            onSaveNotesToLesson={(num, notes) => {
              const target = lessons.find(l => l.lessonNumber === num);
              if (target) {
                handleUpdateLesson({
                  ...target,
                  personalNotes: target.personalNotes ? `${target.personalNotes}\n\n${notes}` : notes
                });
              }
            }}
          />
        )}

        {activeTab === 'repositorio' && (
          <RepositoryView
            documents={documents}
            onAddDocument={handleAddDocument}
            onDeleteDocument={handleDeleteDocument}
            onGenerateNotesWithDoc={num => {
              setSelectedLessonForAgent(num);
              setActiveTab('agente');
            }}
          />
        )}

        {activeTab === 'docentes' && (
          <FacultyView />
        )}
      </div>

      {/* Institutional LDS Footer */}
      <footer className="bg-[#6f0f2c] text-[#f6f5f7] py-8 px-6 rounded-2xl border border-[#8b1538] shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <LdsCrest size={44} color="#f6f5f7" />
            <div>
              <div className="font-serif-title text-xl font-bold tracking-tight">
                Liga de Direito Societário e Mercado de Capitais (LDS FDR)
              </div>
              <div className="text-xs text-[#f6f5f7]/80">
                Faculdade de Direito do Recife • Universidade Federal de Pernambuco (UFPE) • Fundada em 1827
              </div>
            </div>
          </div>
          <div className="text-center md:text-right text-xs text-[#f6f5f7]/70 space-y-0.5">
            <div>Praça Adolfo Cirne, s/n • Boa Vista, Recife - PE • CEP 50050-060</div>
            <div>Ambiente Pessoal de Acompanhamento das Aulas, Slides, Bibliografia & Anotações</div>
          </div>
        </div>
      </footer>

      {/* Code of Conduct Modal */}
      <ConductCodeModal
        isOpen={isConductModalOpen}
        onClose={() => setIsConductModalOpen(false)}
      />
    </div>
  );
};
