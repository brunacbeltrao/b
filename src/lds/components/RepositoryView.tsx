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

  // Document types are labels, not alarms: one quiet tag style for all of them
  const getTypeBadgeColor = (_type: DocumentType) => 'bg-stone-100 text-stone-700';

  return (
    <div className="">
      {/* Header */}
      <div className="mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={() => setIsAddingDoc(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#8b1538] hover:bg-[#6f0f2c] rounded-full shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Material Manualmente</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-[#f6f5f7] border border-[#625d66]/25 rounded-full overflow-x-auto no-scrollbar">
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
                    ? 'bg-white text-[#8b1538] font-bold shadow-2xs'
                    : 'text-[#625d66] hover:text-[#1c1a1e]'
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
              className="bg-white border border-[#625d66]/35 rounded-full px-3.5 py-1.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538] shadow-2xs"
            >
              <option value="all">Todas as Aulas (1 a 17)</option>
              {LESSONS_DATABASE.map(l => (
                <option key={l.id} value={l.lessonNumber}>
                  Aula {l.lessonNumber.toString().padStart(2, '0')}: {l.title.slice(0, 28)}...
                </option>
              ))}
            </select>

            <div className="relative">
              <Search className="w-4 h-4 text-[#625d66] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar palavra, norma ou autor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-[#625d66]/35 rounded-full pl-9 pr-4 py-1.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538] shadow-2xs w-48 sm:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Synchronized notice */}
      <div className="mb-6 p-3.5 bg-[#f6f5f7] border border-[#625d66]/30 rounded-2xl flex items-center justify-between text-xs text-[#625d66]">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-[#8b1538]" />
          <span>
            Exibindo <strong>{filteredDocs.length}</strong> materiais catalogados. Todo material anexado nas aulas é sincronizado em tempo real com esta biblioteca.
          </span>
        </div>
        {selectedType !== 'all' && (
          <button
            onClick={() => setSelectedType('all')}
            className="text-[#8b1538] font-bold hover:underline cursor-pointer"
          >
            Limpar filtro
          </button>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#625d66]">
            <BookOpen className="w-12 h-12 text-[#625d66]/50 mx-auto mb-3" />
            <h3 className="font-serif-title text-2xl font-semibold text-[#1c1a1e]">
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
              className="bg-[#f6f5f7] border border-[#e6e4e8] hover:border-[#8b1538]/60 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getTypeBadgeColor(
                      doc.type
                    )}`}
                  >
                    {doc.type}
                  </span>
                  <span className="text-xs text-[#8b1538] font-semibold">
                    Aula {doc.lessonNumber.toString().padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-serif-title text-xl font-semibold text-[#1c1a1e] mb-1.5 line-clamp-2 leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs text-[#625d66] italic mb-3">
                  {doc.source}
                </p>
                <p className="text-xs text-[#1c1a1e] leading-relaxed line-clamp-3 mb-4">
                  {doc.summary}
                </p>
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {doc.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] bg-white border border-[#e6e4e8] text-[#625d66] px-1.5 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-[#e6e4e8] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReadingDoc(doc)}
                    className="font-semibold text-[#8b1538] hover:text-[#6f0f2c] flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver Detalhes</span>
                  </button>
                  {doc.fileUrl && (
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#6f0f2c] hover:text-[#8b1538] flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded-full border border-[#e6e4e8]"
                      title="Abrir arquivo / link externo"
                    >
                      <ExternalLink className="w-3 h-3 text-[#625d66]" />
                      <span>Abrir Link</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleCopyDocContent(doc)}
                    className="text-[#625d66] hover:text-[#1c1a1e] p-1.5 rounded-full hover:bg-white transition-colors cursor-pointer"
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
                      className="text-[#625d66] hover:text-red-700 p-1.5 rounded-full hover:bg-white transition-colors cursor-pointer"
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
          <div className="bg-[#f6f5f7] border border-[#8b1538]/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-white text-[#1c1a1e] border-b border-[#e6e4e8] flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500">
                  {readingDoc.type} • Vinculado à Aula {readingDoc.lessonNumber.toString().padStart(2, '0')}
                </div>
                <h2 className="font-serif-title text-xl font-semibold text-[#1c1a1e]">
                  {readingDoc.title}
                </h2>
              </div>
              <button
                onClick={() => setReadingDoc(null)}
                className="text-stone-500 hover:text-[#1c1a1e] p-1 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm sm:text-base leading-relaxed text-[#1c1a1e] space-y-4">
              <div className="p-3 bg-[#f6f5f7] rounded-2xl border border-[#625d66]/30 text-xs text-[#625d66] flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#8b1538]">Fonte / Origem: </span>
                  {readingDoc.source} • <span className="font-bold text-[#8b1538]">Data: </span>
                  {readingDoc.dateAdded}
                </div>
                {readingDoc.fileUrl && (
                  <a
                    href={readingDoc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#8b1538] font-bold hover:underline"
                  >
                    <span>Acessar Link Externo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="bg-white p-6 rounded-2xl border border-[#e6e4e8] whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed text-[#1c1a1e] shadow-inner">
                {readingDoc.content}
              </div>
            </div>
            <div className="p-4 bg-[#f6f5f7] border-t border-[#e6e4e8] flex items-center justify-between text-xs">
              <button
                onClick={() => handleCopyDocContent(readingDoc)}
                className="px-4 py-2 border border-[#625d66]/35 rounded-full text-[#6f0f2c] bg-white hover:bg-[#f6f5f7] flex items-center gap-1.5 font-semibold cursor-pointer shadow-2xs"
              >
                {copiedId === readingDoc.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado com sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8b1538]" />
                    <span>Copiar Texto Completo</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setReadingDoc(null)}
                className="px-5 py-2 bg-[#8b1538] hover:bg-[#6f0f2c] text-white rounded-full font-bold cursor-pointer"
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
          <div className="bg-[#f6f5f7] border border-[#8b1538]/40 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 bg-white text-[#1c1a1e] border-b border-[#e6e4e8] flex items-center justify-between">
              <div>
                <div className="eyebrow-lds text-stone-500 text-xs">
                  CADASTRO DE MATERIAL
                </div>
                <h2 className="font-serif-title text-2xl font-semibold text-[#1c1a1e]">
                  Adicionar Documento / PDF ao Repositório
                </h2>
              </div>
              <button
                onClick={() => setIsAddingDoc(false)}
                className="text-stone-500 hover:text-[#1c1a1e] p-1 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDocument} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block text-[#1c1a1e] font-semibold mb-1">
                  Título do Documento / Artigo / Slide *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Slides - Teoria Geral do Direito Societário ou Parecer CVM..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-[#625d66]/35 rounded-2xl p-2.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1c1a1e] font-semibold mb-1">
                    Tipo de Material *
                  </label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as DocumentType)}
                    className="w-full bg-white border border-[#625d66]/35 rounded-2xl p-2.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
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
                  <label className="block text-[#1c1a1e] font-semibold mb-1">
                    Vincular à Aula do Semestre *
                  </label>
                  <select
                    value={newLessonNumber}
                    onChange={e => setNewLessonNumber(Number(e.target.value))}
                    className="w-full bg-white border border-[#625d66]/35 rounded-2xl p-2.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
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
                  <label className="block text-[#1c1a1e] font-semibold mb-1">
                    Fonte ou Autor do Material
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Prof. Dr. Fulano / STJ / Lei 6.404"
                    value={newSource}
                    onChange={e => setNewSource(e.target.value)}
                    className="w-full bg-white border border-[#625d66]/35 rounded-2xl p-2.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                  />
                </div>
                <div>
                  <label className="block text-[#1c1a1e] font-semibold mb-1">
                    URL ou Link de Acesso (Google Drive / Canva / Web)
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newFileUrl}
                    onChange={e => setNewFileUrl(e.target.value)}
                    className="w-full bg-white border border-[#625d66]/35 rounded-2xl p-2.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#1c1a1e] font-semibold mb-1">
                  Resumo / Ementa do Material
                </label>
                <input
                  type="text"
                  placeholder="Síntese breve do conteúdo deste material..."
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  className="w-full bg-white border border-[#625d66]/35 rounded-2xl p-2.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                />
              </div>
              <div>
                <label className="block text-[#1c1a1e] font-semibold mb-1">
                  Conteúdo Completo, Ementa ou Anotações *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Cole aqui o texto dos slides, artigo, resumo do julgado ou notas importantes..."
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  className="w-full bg-white border border-[#625d66]/35 rounded-2xl p-2.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                />
              </div>
              <div>
                <label className="block text-[#1c1a1e] font-semibold mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Slides, CVM, Capital Social, M&A"
                  value={newTags}
                  onChange={e => setNewTags(e.target.value)}
                  className="w-full bg-white border border-[#625d66]/35 rounded-2xl p-2.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                />
              </div>
              <div className="pt-4 border-t border-[#e6e4e8] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="px-4 py-2 text-xs text-[#625d66] hover:text-[#1c1a1e] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#8b1538] hover:bg-[#6f0f2c] text-white rounded-full font-bold cursor-pointer shadow-xs"
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
