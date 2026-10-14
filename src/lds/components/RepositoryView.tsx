/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DocumentItem, DocumentType } from '../types';
import { INITIAL_DOCUMENTS } from '../data/documents';
import { LESSONS_DATABASE } from '../data/curriculum';
import {
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  X,
  Trash2,
  Bookmark
} from 'lucide-react';

interface RepositoryViewProps {
  documents?: DocumentItem[];
  onAddDocument?: (doc: DocumentItem) => void;
  onDeleteDocument?: (id: string) => void;
  onGenerateNotesWithDoc?: (lessonNumber: number, docTitle: string) => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  documents: externalDocuments,
  onAddDocument,
  onDeleteDocument
}) => {
  const [internalDocuments, setInternalDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const documents = externalDocuments || internalDocuments;
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [readingDoc, setReadingDoc] = useState<DocumentItem | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New doc form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<DocumentType>('Material de Aula');
  const [newLessonNumber, setNewLessonNumber] = useState<number>(1);
  const [newSource, setNewSource] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newFileUrl, setNewFileUrl] = useState('');
  const [newTags, setNewTags] = useState('');

  const filteredDocs = documents.filter(doc => {
    let matchesType = true;
    if (selectedType === 'all') {
      matchesType = true;
    } else if (selectedType === 'anexos') {
      matchesType = doc.type === 'Material de Aula' || !!doc.isLessonAttachment;
    } else {
      matchesType = doc.type === selectedType;
    }

    const matchesLesson = selectedLessonFilter === 'all' || doc.lessonNumber === selectedLessonFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      doc.title.toLowerCase().includes(q) ||
      doc.summary.toLowerCase().includes(q) ||
      doc.source.toLowerCase().includes(q) ||
      (doc.tags && doc.tags.some(t => t.toLowerCase().includes(q)));
    return matchesType && matchesLesson && matchesSearch;
  });

  const handleCopyDocContent = async (doc: DocumentItem) => {
    await navigator.clipboard.writeText(`${doc.title}\nFonte: ${doc.source}\n\n${doc.content}`);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    let formattedUrl = newFileUrl.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      lessonNumber: newLessonNumber,
      source: newSource.trim() || `Aula ${newLessonNumber} • LDS FDR`,
      summary: newSummary.trim() || newContent.slice(0, 140) + '...',
      content: newContent.trim(),
      dateAdded: new Date().toISOString().split('T')[0],
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      fileUrl: formattedUrl || undefined
    };

    if (onAddDocument) {
      onAddDocument(newDoc);
    } else {
      setInternalDocuments(prev => [newDoc, ...prev]);
    }
    setIsAddingDoc(false);

    setNewTitle('');
    setNewSource('');
    setNewSummary('');
    setNewContent('');
    setNewFileUrl('');
    setNewTags('');
  };

  const getTypeBadgeColor = (type: DocumentType) => {
    switch (type) {
      case 'Slide':
        return 'bg-[#5C0A22] text-white';
      case 'Material de Aula':
        return 'bg-[#A7002F] text-white';
      case 'Link Útil':
        return 'bg-[#A9832E] text-white';
      case 'Norma':
        return 'bg-emerald-800 text-white';
      case 'Doutrina':
        return 'bg-amber-900 text-white';
      case 'Jurisprudência':
        return 'bg-blue-900 text-white';
      case 'Parecer CVM':
        return 'bg-[#211A15] text-[#FAF5EA]';
      default:
        return 'bg-[#6B5D4F] text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-[#A9832E]/25 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="eyebrow-lds text-[#A7002F] tracking-[0.16em] uppercase font-semibold text-xs mb-1">
              REPOSITÓRIO GERAL • BIBLIOTECA DA LDS FDR
            </div>
            <h1 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#A7002F] tracking-tight">
              Repositório, Slides & Materiais
            </h1>
            <p className="mt-1 text-sm text-[#6B5D4F] font-sans">
              Acervo unificado: tudo o que você anexa nas aulas é automaticamente catalogado aqui, além de decisões da CVM, precedentes do STJ e doutrina.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap font-['Inter',sans-serif]">
            <button
              onClick={() => setIsAddingDoc(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#A7002F] hover:bg-[#5C0A22] rounded-full shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Material Manualmente</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-['Inter',sans-serif]">
          <div className="flex items-center gap-1.5 p-1 bg-[#F4EDE0] border border-[#A9832E]/25 rounded-full overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Todos os Materiais' },
              { id: 'Slide', label: 'Slides do Professor' },
              { id: 'anexos', label: 'Anexos das Aulas' },
              { id: 'Norma', label: 'Legislação' },
              { id: 'Doutrina', label: 'Doutrina' },
              { id: 'Jurisprudência', label: 'Jurisprudência' },
              { id: 'Parecer CVM', label: 'Pareceres CVM' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                  selectedType === t.id
                    ? 'bg-white text-[#A7002F] font-bold shadow-2xs'
                    : 'text-[#6B5D4F] hover:text-[#211A15]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedLessonFilter}
              onChange={e => setSelectedLessonFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-white border border-[#A9832E]/35 rounded-full px-3.5 py-1.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F] shadow-2xs"
            >
              <option value="all">Todas as Aulas (1 a 17)</option>
              {LESSONS_DATABASE.map(l => (
                <option key={l.id} value={l.lessonNumber}>
                  Aula {l.lessonNumber.toString().padStart(2, '0')}: {l.title.slice(0, 28)}...
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-[#A9832E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar palavra, norma ou autor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-[#A9832E]/35 rounded-full pl-9 pr-4 py-1.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F] shadow-2xs w-48 sm:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized notice */}
      <div className="mb-6 p-3.5 bg-[#FAF5EA] border border-[#A9832E]/30 rounded-2xl flex items-center justify-between text-xs text-[#6B5D4F] font-['Inter',sans-serif]">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#A7002F]" />
          <span>
            Exibindo <strong>{filteredDocs.length}</strong> materiais catalogados. Todo material anexado nas aulas é sincronizado em tempo real com esta biblioteca.
          </span>
        </div>
        {selectedType !== 'all' && (
          <button
            onClick={() => setSelectedType('all')}
            className="text-[#A7002F] font-bold hover:underline cursor-pointer"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#6B5D4F]">
            <BookOpen className="w-12 h-12 text-[#A9832E]/50 mx-auto mb-3" />
            <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#A7002F]">
              Nenhum material encontrado com os filtros atuais
            </h3>
            <p className="text-xs mt-1 font-sans">
              Anexe materiais e slides na aba de Acompanhamento de Aulas ou cadastre um novo documento acima.
            </p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-[#FAF5EA] border border-[#E5DBCA] hover:border-[#A7002F]/60 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`text-[10px] font-['Inter',sans-serif] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getTypeBadgeColor(
                      doc.type
                    )}`}
                  >
                    {doc.type}
                  </span>
                  <span className="text-xs font-['Inter',sans-serif] text-[#A7002F] font-semibold">
                    Aula {doc.lessonNumber.toString().padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#211A15] mb-1.5 line-clamp-2 leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs font-['Inter',sans-serif] text-[#6B5D4F] italic mb-3">
                  {doc.source}
                </p>
                <p className="text-xs text-[#211A15] leading-relaxed line-clamp-3 mb-4 font-['Source_Serif_4',serif]">
                  {doc.summary}
                </p>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-white border border-[#E5DBCA] text-[#6B5D4F] px-1.5 py-0.5 rounded-full font-['Inter',sans-serif]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-[#E5DBCA] flex items-center justify-between gap-2 text-xs font-['Inter',sans-serif]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReadingDoc(doc)}
                    className="font-semibold text-[#A7002F] hover:text-[#5C0A22] flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver Detalhes</span>
                  </button>
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#5C0A22] hover:text-[#A7002F] flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-full border border-[#E5DBCA]"
                      title="Abrir arquivo / link externo"
                    >
                      <ExternalLink className="w-3 h-3 text-[#A9832E]" />
                      <span>Abrir Link</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyDocContent(doc)}
                    className="text-[#6B5D4F] hover:text-[#211A15] p-1.5 rounded-full hover:bg-white transition-colors cursor-pointer"
                    title="Copiar texto do documento"
                  >
                    {copiedId === doc.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {onDeleteDocument && doc.id.startsWith('doc-') && (
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-[#6B5D4F] hover:text-red-700 p-1.5 rounded-full hover:bg-white transition-colors cursor-pointer"
                      title="Remover documento do repositório"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reading Full Document Modal */}
      {readingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF5EA] border border-[#A7002F]/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-['Source_Serif_4',serif]">
            <div className="p-5 bg-gradient-to-r from-[#5C0A22] to-[#A7002F] text-[#FAF5EA] flex items-center justify-between">
              <div>
                <div className="text-[11px] font-['Inter',sans-serif] uppercase tracking-wider text-[#FAF5EA]/85">
                  {readingDoc.type} • Vinculado à Aula {readingDoc.lessonNumber.toString().padStart(2, '0')}
                </div>
                <h2 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold text-white">
                  {readingDoc.title}
                </h2>
              </div>
              <button
                onClick={() => setReadingDoc(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm sm:text-base leading-relaxed text-[#211A15] space-y-4">
              <div className="p-3 bg-[#F4EDE0] rounded-2xl border border-[#A9832E]/30 text-xs font-['Inter',sans-serif] text-[#6B5D4F] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#A7002F]">Fonte / Origem: </span>
                  {readingDoc.source} • <span className="font-bold text-[#A7002F]">Data: </span>
                  {readingDoc.dateAdded}
                </div>
                {readingDoc.fileUrl && (
                  <a
                    href={readingDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#A7002F] font-bold hover:underline"
                  >
                    <span>Acessar Link Externo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#E5DBCA] whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-[#211A15] shadow-inner">
                {readingDoc.content}
              </div>
            </div>
            <div className="p-4 bg-[#F4EDE0] border-t border-[#E5DBCA] flex items-center justify-between font-['Inter',sans-serif] text-xs">
              <button
                onClick={() => handleCopyDocContent(readingDoc)}
                className="px-4 py-2 border border-[#A9832E]/35 rounded-full text-[#5C0A22] bg-white hover:bg-[#FAF5EA] flex items-center gap-1.5 font-semibold cursor-pointer shadow-2xs"
              >
                {copiedId === readingDoc.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado com sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#A7002F]" />
                    <span>Copiar Texto Completo</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setReadingDoc(null)}
                className="px-5 py-2 bg-[#A7002F] hover:bg-[#5C0A22] text-white rounded-full font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Document Modal Form */}
      {isAddingDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF5EA] border border-[#A7002F]/40 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Source_Serif_4',serif]">
            <div className="p-5 bg-[#5C0A22] text-[#FAF5EA] flex items-center justify-between">
              <div>
                <div className="eyebrow-lds text-[#FAF5EA]/85 text-[10px] uppercase tracking-wider">
                  CADASTRO DE MATERIAL
                </div>
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-white">
                  Adicionar Documento / PDF ao Repositório
                </h2>
              </div>
              <button
                onClick={() => setIsAddingDoc(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDocument} className="p-6 overflow-y-auto space-y-4 font-['Inter',sans-serif] text-xs">
              <div>
                <label className="block text-[#211A15] font-semibold mb-1">
                  Título do Documento / Artigo / Slide *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Slides - Teoria Geral do Direito Societário ou Parecer CVM..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#A9832E]/35 rounded-2xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#211A15] font-semibold mb-1">
                    Tipo de Material *
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as DocumentType)}
                    className="w-full bg-white border border-[#A9832E]/35 rounded-2xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                  >
                    <option value="Slide">Slide do Professor</option>
                    <option value="Material de Aula">Material de Aula (PDF)</option>
                    <option value="Link Útil">Link Útil / Apresentação</option>
                    <option value="Norma">Norma / Legislação</option>
                    <option value="Doutrina">Doutrina / Artigo</option>
                    <option value="Jurisprudência">Jurisprudência STJ/TJ</option>
                    <option value="Parecer CVM">Parecer / Processo CVM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#211A15] font-semibold mb-1">
                    Vincular à Aula do Semestre *
                  </label>
                  <select
                    value={newLessonNumber}
                    onChange={e => setNewLessonNumber(Number(e.target.value))}
                    className="w-full bg-white border border-[#A9832E]/35 rounded-2xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                  >
                    {LESSONS_DATABASE.map(l => (
                      <option key={l.id} value={l.lessonNumber}>
                        Aula {l.lessonNumber.toString().padStart(2, '0')}: {l.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#211A15] font-semibold mb-1">
                    Fonte ou Autor do Material
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Prof. Dr. Fulano / STJ / Lei 6.404"
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                    className="w-full bg-white border border-[#A9832E]/35 rounded-2xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                  />
                </div>
                <div>
                  <label className="block text-[#211A15] font-semibold mb-1">
                    URL ou Link de Acesso (Google Drive / Canva / Web)
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newFileUrl}
                    onChange={e => setNewFileUrl(e.target.value)}
                    className="w-full bg-white border border-[#A9832E]/35 rounded-2xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#211A15] font-semibold mb-1">
                  Resumo / Ementa do Material
                </label>
                <input
                  type="text"
                  placeholder="Síntese breve do conteúdo deste material..."
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  className="w-full bg-white border border-[#A9832E]/35 rounded-2xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                />
              </div>
              <div>
                <label className="block text-[#211A15] font-semibold mb-1">
                  Conteúdo Completo, Ementa ou Anotações *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Cole aqui o texto dos slides, artigo, resumo do julgado ou notas importantes..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full bg-white border border-[#A9832E]/35 rounded-2xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                />
              </div>
              <div>
                <label className="block text-[#211A15] font-semibold mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Slides, CVM, Capital Social, M&A"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  className="w-full bg-white border border-[#A9832E]/35 rounded-2xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                />
              </div>
              <div className="pt-4 border-t border-[#E5DBCA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="px-4 py-2 text-xs text-[#6B5D4F] hover:text-[#211A15] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#A7002F] hover:bg-[#5C0A22] text-white rounded-full font-bold cursor-pointer shadow-xs"
                >
                  Salvar no Repositório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
