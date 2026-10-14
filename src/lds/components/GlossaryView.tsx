/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GlossaryTerm } from '../types';
import { INITIAL_GLOSSARY } from '../data/glossary';
import { LESSONS_DATABASE } from '../data/curriculum';
import {
  BookMarked,
  Search,
  Plus,
  Sparkles,
  BookOpen,
  Check,
  Copy,
  X
} from 'lucide-react';

interface GlossaryViewProps {
  onAskAgentAboutTerm: (term: string) => void;
  onGoToLesson: (lessonNumber: number) => void;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({
  onAskAgentAboutTerm,
  onGoToLesson
}) => {
  const [glossary, setGlossary] = useState<GlossaryTerm[]>(() => {
    const saved = localStorage.getItem('lds_fdr_glossary');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_GLOSSARY;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLetter, setSelectedLetter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Add term state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTerm, setNewTerm] = useState('');
  const [newLatinOrEnglish, setNewLatinOrEnglish] = useState('');
  const [newCategory, setNewCategory] = useState<GlossaryTerm['category']>('Societário Básico');
  const [newDefinition, setNewDefinition] = useState('');
  const [newLegalBasis, setNewLegalBasis] = useState('');
  const [newLessonNumber, setNewLessonNumber] = useState<number>(4);
  const [newPracticalExample, setNewPracticalExample] = useState('');

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleGenerateDefinitionWithAi = async () => {
    if (!newTerm.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/glossary-define', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term: newTerm.trim(),
          lessonNumber: newLessonNumber
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.definition) setNewDefinition(data.data.definition);
        if (data.data.legalBasis) setNewLegalBasis(data.data.legalBasis);
        if (data.data.latinOrEnglish) setNewLatinOrEnglish(data.data.latinOrEnglish);
        if (data.data.category) setNewCategory(data.data.category);
        if (data.data.practicalExample) setNewPracticalExample(data.data.practicalExample);
      }
    } catch (e) {
      console.error('Error generating glossary definition with Gemini:', e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredTerms = glossary
    .filter(item => {
      const matchesSearch =
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.latinOrEnglish && item.latinOrEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.legalBasis && item.legalBasis.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesLetter =
        selectedLetter === 'all' ||
        item.term.trim().toUpperCase().startsWith(selectedLetter);
      return matchesSearch && matchesCat && matchesLetter;
    })
    .sort((a, b) => a.term.localeCompare(b.term, 'pt-BR'));

  const handleCopyTerm = async (item: GlossaryTerm) => {
    const text = `${item.term} ${item.latinOrEnglish ? `(${item.latinOrEnglish})` : ''}\nDefinição: ${item.definition}\nBase Legal: ${item.legalBasis || 'N/A'}\nAula: Aula ${item.lessonNumber}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.trim() || !newDefinition.trim()) return;

    const termItem: GlossaryTerm = {
      id: `glossary-${Date.now()}`,
      term: newTerm.trim(),
      latinOrEnglish: newLatinOrEnglish.trim() || undefined,
      category: newCategory,
      definition: newDefinition.trim(),
      legalBasis: newLegalBasis.trim() || undefined,
      lessonNumber: newLessonNumber,
      practicalExample: newPracticalExample.trim() || undefined,
      tags: [newCategory, `Aula ${newLessonNumber}`]
    };
    const updated = [termItem, ...glossary];
    setGlossary(updated);
    localStorage.setItem('lds_fdr_glossary', JSON.stringify(updated));
    setIsAddModalOpen(false);
    setNewTerm('');
    setNewLatinOrEnglish('');
    setNewDefinition('');
    setNewLegalBasis('');
    setNewPracticalExample('');
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-2 sm:px-6 lg:px-8 font-['Source_Serif_4',serif]">
      {/* Header section */}
      <div className="mb-8 border-b border-[#A9832E]/25 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="eyebrow-lds text-[#A7002F] tracking-[0.16em] uppercase font-semibold text-xs">
              DICIONÁRIO DE DIREITO SOCIETÁRIO & MERCADO DE CAPITAIS
            </div>
            <h1 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#A7002F] tracking-tight">
              Glossário Acadêmico LDS FDR
            </h1>
            <p className="text-sm sm:text-base text-[#6B5D4F] max-w-3xl font-sans">
              Compilação sistemática de conceitos, cláusulas contratuais, regras de governança e brocardos corporativos aprendidos ao longo das aulas.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#A7002F] hover:bg-[#5C0A22] rounded-2xl shadow-sm transition-all cursor-pointer self-start sm:self-auto shrink-0 font-['Inter',sans-serif]"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Termo</span>
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 font-['Inter',sans-serif]">
          <div className="flex items-center gap-1.5 p-1 bg-[#F4EDE0] border border-[#A9832E]/25 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Todos os Termos' },
              { id: 'Societário Básico', label: 'Societário Básico' },
              { id: 'Mercado de Capitais', label: 'Mercado de Capitais' },
              { id: 'Governança & Fiduciário', label: 'Governança & Fiduciário' },
              { id: 'M&A & Reorganizações', label: 'M&A & Reorganizações' },
              { id: 'Processual & Conflitos', label: 'Processual & Conflitos' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-white text-[#A7002F] font-bold shadow-xs'
                    : 'text-[#6B5D4F] hover:text-[#211A15]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#6B5D4F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar termo, lei ou conceito..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-[#A9832E]/35 rounded-2xl text-[#211A15] placeholder-[#6B5D4F]/70 focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
            />
          </div>
        </div>

        {/* Alphabet Jump Bar */}
        <div className="mt-4 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar p-1.5 bg-[#FAF5EA] border border-[#E5DBCA] rounded-2xl text-xs font-['Inter',sans-serif]">
          <button
            onClick={() => setSelectedLetter('all')}
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedLetter === 'all'
                ? 'bg-[#A7002F] text-white'
                : 'text-[#6B5D4F] hover:text-[#211A15]'
            }`}
          >
            TODOS ({glossary.length})
          </button>
          {alphabet.map(letter => {
            const hasTerms = glossary.some(item =>
              item.term.trim().toUpperCase().startsWith(letter)
            );
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                disabled={!hasTerms}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedLetter === letter
                    ? 'bg-[#A7002F] text-white shadow-xs font-bold'
                    : hasTerms
                    ? 'text-[#5C0A22] hover:bg-[#F4EDE0]'
                    : 'text-[#6B5D4F]/30 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTerms.map(item => (
          <div
            key={item.id}
            className="bg-[#FAF5EA] border border-[#E5DBCA] hover:border-[#A7002F]/60 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#A7002F] leading-tight group-hover:text-[#5C0A22] transition-colors">
                    {item.term}
                  </h3>
                  {item.latinOrEnglish && (
                    <span className="text-xs italic text-[#6B5D4F] font-serif">
                      {item.latinOrEnglish}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-['Inter',sans-serif] font-semibold bg-[#F4EDE0] text-[#5C0A22] px-2.5 py-1 rounded-full border border-[#A9832E]/25">
                    {item.category}
                  </span>
                </div>
              </div>

              <p className="text-sm text-[#211A15] leading-relaxed mt-3 mb-4 font-['Source_Serif_4',serif]">
                {item.definition}
              </p>

              <div className="space-y-2 pt-2 border-t border-[#E5DBCA]">
                {item.legalBasis && (
                  <div className="flex items-start gap-2 text-xs font-['Inter',sans-serif]">
                    <span className="font-bold text-[#A7002F] shrink-0">Base Legal:</span>
                    <span className="text-[#211A15]">{item.legalBasis}</span>
                  </div>
                )}
                {item.practicalExample && (
                  <div className="p-3 bg-white/80 border border-[#E5DBCA] rounded-xl text-xs text-[#6B5D4F] leading-relaxed font-sans">
                    <span className="font-bold text-[#5C0A22]">Exemplo Prático: </span>
                    {item.practicalExample}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E5DBCA] flex items-center justify-between text-xs font-['Inter',sans-serif]">
              <button
                onClick={() => onGoToLesson(item.lessonNumber)}
                className="text-[#A7002F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#A9832E]" />
                <span>Estudado na Aula {item.lessonNumber.toString().padStart(2, '0')}</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAskAgentAboutTerm(item.term)}
                  className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#5C0A22] hover:bg-[#A7002F] rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                  title="Pedir ao Agente IA para detalhar este termo com doutrina"
                >
                  <Sparkles className="w-3 h-3 text-[#A9832E]" />
                  <span>Explicar com IA</span>
                </button>
                <button
                  onClick={() => handleCopyTerm(item)}
                  className="p-1.5 text-[#6B5D4F] hover:text-[#211A15] hover:bg-white rounded-lg transition-colors cursor-pointer"
                  title="Copiar definição"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-16 bg-[#FAF5EA] border border-[#E5DBCA] rounded-3xl mt-6">
          <BookMarked className="w-12 h-12 text-[#A9832E] mx-auto mb-3 opacity-60" />
          <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#211A15]">
            Nenhum termo encontrado
          </h3>
          <p className="text-xs text-[#6B5D4F] mt-1 font-['Inter',sans-serif]">
            Tente buscar com outra palavra-chave ou cadastre uma nova definição.
          </p>
        </div>
      )}

      {/* Add New Term Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF5EA] border border-[#A7002F]/40 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-['Source_Serif_4',serif]">
            <div className="p-6 bg-[#5C0A22] text-[#FAF5EA] flex items-center justify-between border-b border-[#A7002F]">
              <div className="flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-[#A9832E]" />
                <h2 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-white">
                  Cadastrar Termo no Glossário Societário
                </h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTerm} className="p-6 overflow-y-auto space-y-4 text-xs font-['Inter',sans-serif]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#211A15]">Termo / Expressão Jurídica *</label>
                  <button
                    type="button"
                    onClick={handleGenerateDefinitionWithAi}
                    disabled={isAiLoading || !newTerm.trim()}
                    className="inline-flex items-center gap-1 text-[11px] text-[#A7002F] hover:text-[#5C0A22] font-semibold bg-[#FAF5EA] hover:bg-[#F4EDE0] border border-[#A7002F]/30 px-2.5 py-1 rounded-full cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-[#A9832E]" />
                    <span>{isAiLoading ? 'Gerando com Gemini...' : 'Completar com Gemini / IA'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ex: Poison Pill, Golden Share, Quotas Preferenciais..."
                  value={newTerm}
                  onChange={e => setNewTerm(e.target.value)}
                  className="w-full bg-white border border-[#A9832E]/35 rounded-xl p-2.5 text-xs text-[#211A15]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#211A15] mb-1">Origem / Termo em Inglês ou Latim</label>
                  <input
                    type="text"
                    placeholder="Ex: Poison Pill / Ultra Vires"
                    value={newLatinOrEnglish}
                    onChange={e => setNewLatinOrEnglish(e.target.value)}
                    className="w-full bg-white border border-[#A9832E]/35 rounded-xl p-2.5 text-xs text-[#211A15]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211A15] mb-1">Categoria *</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#A9832E]/35 rounded-xl p-2.5 text-xs text-[#211A15]"
                  >
                    <option value="Societário Básico">Societário Básico</option>
                    <option value="Mercado de Capitais">Mercado de Capitais</option>
                    <option value="Governança & Fiduciário">Governança & Fiduciário</option>
                    <option value="M&A & Reorganizações">M&A & Reorganizações</option>
                    <option value="Processual & Conflitos">Processual & Conflitos</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#211A15] mb-1">Base Legal (Artigo/Lei)</label>
                  <input
                    type="text"
                    placeholder="Ex: Lei 6.404/76, Art. 118"
                    value={newLegalBasis}
                    onChange={e => setNewLegalBasis(e.target.value)}
                    className="w-full bg-white border border-[#A9832E]/35 rounded-xl p-2.5 text-xs text-[#211A15]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#211A15] mb-1">Aula Onde Foi Aprendido *</label>
                  <select
                    value={newLessonNumber}
                    onChange={e => setNewLessonNumber(Number(e.target.value))}
                    className="w-full bg-white border border-[#A9832E]/35 rounded-xl p-2.5 text-xs text-[#211A15]"
                  >
                    {LESSONS_DATABASE.map(l => (
                      <option key={l.id} value={l.lessonNumber}>
                        Aula {l.lessonNumber.toString().padStart(2, '0')}: {l.title.slice(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#211A15] mb-1">Definição / Conceito Dogmático *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explique o conceito jurídico com clareza e precisão..."
                  value={newDefinition}
                  onChange={e => setNewDefinition(e.target.value)}
                  className="w-full bg-white border border-[#A9832E]/35 rounded-xl p-3 text-xs text-[#211A15] font-serif leading-relaxed"
                />
              </div>
              <div>
                <label className="block font-bold text-[#211A15] mb-1">Exemplo Prático de Aplicação</label>
                <textarea
                  rows={2}
                  placeholder="Como esse termo se manifesta em uma operação societária ou litígio real..."
                  value={newPracticalExample}
                  onChange={e => setNewPracticalExample(e.target.value)}
                  className="w-full bg-white border border-[#A9832E]/35 rounded-xl p-2.5 text-xs text-[#211A15]"
                />
              </div>
              <div className="pt-4 border-t border-[#E5DBCA] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#6B5D4F] hover:text-[#211A15] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#A7002F] hover:bg-[#5C0A22] rounded-xl shadow-sm cursor-pointer"
                >
                  Salvar no Glossário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
