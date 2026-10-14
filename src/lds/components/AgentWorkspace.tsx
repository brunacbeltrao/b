/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { LESSONS_DATABASE } from '../data/curriculum';
import { INITIAL_DOCUMENTS } from '../data/documents';
import { LdsCrest } from './LdsBrand';
import { NotebookLmImportModal } from './NotebookLmImportModal';
import {
  Send,
  Sparkles,
  BookOpen,
  Calendar,
  RefreshCw,
  MessageSquare,
  FileText,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';

interface AgentWorkspaceProps {
  initialLessonNumber?: number;
  onSaveNotesToLesson?: (lessonNumber: number, notes: string) => void;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({
  initialLessonNumber = 4
}) => {
  const [selectedLessonNumber, setSelectedLessonNumber] = useState<number>(initialLessonNumber);
  const [customFocus, setCustomFocus] = useState<string>('');
  const [promptInput, setPromptInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'resumo'>('chat');
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState<boolean>(false);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Olá! Sou o **Tutor Inteligente LDS FDR**, seu assistente especializado em Direito Societário e Mercado de Capitais.\n\nEstou conectado ao programa do Ciclo-base 2026.2 da Faculdade de Direito do Recife. Posso tirar dúvidas sobre qualquer aula, analisar precedentes da CVM e STJ, sugerir leituras doutrinárias e preparar esquemas de estudo para suas anotações.\n\nSobre qual aula ou tema você gostaria de conversar hoje?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  const selectedLesson = LESSONS_DATABASE.find(l => l.lessonNumber === selectedLessonNumber) || LESSONS_DATABASE[3];
  const linkedDocs = INITIAL_DOCUMENTS.filter(d => d.lessonNumber === selectedLesson.lessonNumber);

  const handleGenerateSummary = async (targetLessonNumber: number = selectedLessonNumber, focus: string = customFocus) => {
    setIsGenerating(true);
    setGenerationStep('Recuperando contexto da aula e dispositivos legais...');
    try {
      const response = await fetch('/api/gemini/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonNumber: targetLessonNumber,
          customFocus: focus,
          additionalDocs: linkedDocs.map(d => `${d.title}: ${d.summary}`).join('\n')
        })
      });
      const result = await response.json();
      if (result.success && result.data) {
        const text = `### ESQUEMA DE ESTUDO • AULA ${result.data.lessonNumber.toString().padStart(2, '0')}: ${result.data.lessonTitle}
Data: ${result.data.lessonDate}

#### 1. Contexto Dogmático:
${result.data.introduction}

#### 2. Pontos-Chave Discutidos em Sala:
${result.data.keyPoints?.map((kp: string) => `• ${kp}`).join('\n')}

#### 3. Legislação Aplicável:
${result.data.legislation?.map((l: any) => `• ${l.lawTag} ${l.article}: ${l.text}`).join('\n')}

#### 4. Doutrina Citada:
${result.data.doctrineQuotes?.map((dq: any) => `> "${dq.quote}" — ${dq.author} (${dq.work})`).join('\n\n')}

#### 5. Precedente Jurisprudencial CVM / STJ:
• ${result.data.jurisprudenceCase?.title || 'Precedente CVM'}: ${result.data.jurisprudenceCase?.summary || 'Consolidação das teses da aula.'}
`;
        setGeneratedSummary(text);
        setActiveTab('resumo');
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setPromptInput(prompt);
    const matchAula = prompt.match(/aula\s*0?(\d+)/i) || prompt.match(/^0?(\d+)$/);
    if (matchAula) {
      const num = parseInt(matchAula[1], 10);
      if (num >= 1 && num <= 17) {
        setSelectedLessonNumber(num);
        setChatInput(`Gostaria de entender os principais pontos e precedentes discutidos na Aula ${num}.`);
        setActiveTab('chat');
        return;
      }
    }
    setChatInput(prompt);
    setActiveTab('chat');
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userText = chatInput.trim();
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: chatMessages
        })
      });
      const data = await response.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `msg-resp-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lessonReferenced: data.lessonReferenced
        };
        setChatMessages(prev => [...prev, assistantMsg]);
        if (data.lessonReferenced) {
          setSelectedLessonNumber(data.lessonReferenced);
        }
      }
    } catch (err) {
      console.error('Erro no chat:', err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Houve uma oscilação na consulta ao agente. Por gentileza, tente novamente ou formule sua pergunta com base na aula desejada.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCopySummary = async () => {
    if (!generatedSummary) return;
    await navigator.clipboard.writeText(generatedSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-2 sm:px-6 lg:px-8 font-['Source_Serif_4',serif]">
      {/* Workspace Header */}
      <div className="mb-8 border-b border-[#A9832E]/25 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="eyebrow-lds text-[#A7002F] tracking-[0.16em] uppercase font-semibold text-xs mb-1">
              SISTEMA INTELIGENTE LDS FDR • GOOGLE GEMINI
            </div>
            <h1 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#A7002F] tracking-tight">
              Tira-Dúvidas IA & Revisão das Aulas
            </h1>
            <p className="mt-1 text-sm text-[#6B5D4F] font-sans">
              Tire dúvidas dogmáticas, debata os precedentes da CVM e gere esquemas de estudo prontos para o seu caderno de anotações.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1.5 bg-[#F4EDE0] border border-[#A9832E]/30 rounded-full shrink-0 font-['Inter',sans-serif]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-[#A7002F] text-white shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#211A15]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Tira-Dúvidas IA</span>
            </button>
            <button
              onClick={() => setActiveTab('resumo')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'resumo'
                  ? 'bg-[#A7002F] text-white shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#211A15]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Esquema de Estudo</span>
            </button>
          </div>
        </div>

        {/* Fast Prompt Bar */}
        <div className="mt-6 bg-[#FAF5EA] border border-[#A9832E]/30 rounded-3xl p-4 shadow-xs font-['Inter',sans-serif]">
          <div className="text-xs font-bold text-[#211A15] mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A7002F]" />
              Pergunta Rápida sobre o Semestre
            </span>
            <span className="text-[11px] text-[#6B5D4F] font-normal hidden sm:inline">
              Foco em acompanhamento das aulas da LDS FDR
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: Qual a distinção entre Tag Along e Drag Along na LSA? ou Resuma a Aula 04..."
              value={promptInput}
              onChange={e => setPromptInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleQuickPrompt(promptInput);
              }}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-white border border-[#A9832E]/35 rounded-full text-[#211A15] placeholder-[#6B5D4F]/70 focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
            />
            <button
              onClick={() => handleQuickPrompt(promptInput)}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#A7002F] hover:bg-[#5C0A22] rounded-full shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Perguntar</span>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B5D4F]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium mr-1">Sugestões de temas:</span>
              {[
                'Tag Along vs Drag Along',
                'Quotas Preferenciais em LTDA',
                'Deveres Fiduciários (Art. 153)',
                'Acordo de Acionistas (Art. 118)',
                'Poison Pill no Brasil'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(chip)}
                  className="text-[11px] px-3 py-1 bg-[#F4EDE0] hover:bg-white text-[#5C0A22] border border-[#A9832E]/30 rounded-full transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsNotebookModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold text-[#5C0A22] bg-white hover:bg-[#FAF5EA] border border-[#A9832E]/40 rounded-full transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A7002F]" />
              <span>Exportar para NotebookLM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Area */}
      {activeTab === 'chat' ? (
        <div className="max-w-4xl mx-auto bg-[#FAF5EA] border border-[#E5DBCA] rounded-3xl shadow-md overflow-hidden flex flex-col h-[650px]">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-[#5C0A22] to-[#A7002F] text-[#FAF5EA] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LdsCrest size={32} color="#FAF5EA" />
              <div>
                <div className="font-['Cormorant_Garamond',serif] text-xl font-bold">
                  Tutor Inteligente de Direito Societário
                </div>
                <div className="text-[11px] text-[#FAF5EA]/80 font-['Inter',sans-serif]">
                  Faculdade de Direito do Recife • Modelo Gemini 3.8 Flash
                </div>
              </div>
            </div>
            <div className="text-xs text-[#FAF5EA]/90 bg-white/20 px-3 py-1 rounded-full font-['Inter',sans-serif]">
              Grounding no Programa 2026.2
            </div>
          </div>

          {/* Chat message feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-['Source_Serif_4',serif]">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="shrink-0 mt-1">
                    <LdsCrest size={24} color="#A7002F" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#A7002F] text-white font-sans rounded-br-xs'
                      : 'bg-white text-[#211A15] border border-[#E5DBCA] rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.lessonReferenced && (
                    <div className="mt-3 pt-2.5 border-t border-[#E5DBCA] flex items-center justify-between gap-2 font-['Inter',sans-serif]">
                      <span className="text-[11px] text-[#6B5D4F]">
                        Referência oficial: Aula {msg.lessonReferenced.toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedLessonNumber(msg.lessonReferenced!);
                          handleGenerateSummary(msg.lessonReferenced!);
                        }}
                        className="text-[11px] text-[#A7002F] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Gerar Esquema de Estudo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs text-[#6B5D4F] font-['Inter',sans-serif] italic p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A7002F]" />
                <span>O Tutor Gemini está consultando a jurisprudência e a Lei 6.404/76...</span>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <div className="p-4 bg-white border-t border-[#E5DBCA] font-['Inter',sans-serif]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Digite sua dúvida sobre a matéria ou cite o número da aula..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSendChatMessage();
                }}
                disabled={isChatLoading}
                className="flex-1 bg-[#FAF5EA] border border-[#A9832E]/35 rounded-full px-4 py-2.5 text-xs sm:text-sm text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
              />
              <button
                onClick={handleSendChatMessage}
                disabled={isChatLoading || !chatInput.trim()}
                className="px-5 py-2.5 bg-[#A7002F] hover:bg-[#5C0A22] disabled:opacity-50 text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Summary & Notebook Generator Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6 font-['Inter',sans-serif]">
            <div className="bg-white border border-[#E5DBCA] rounded-3xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#A7002F] uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#A9832E]" />
                <span>Selecione a Aula para Revisão</span>
              </h3>
              <div>
                <label className="block text-xs text-[#6B5D4F] mb-1 font-medium">
                  Aula do Ciclo-base 2026.2:
                </label>
                <select
                  value={selectedLessonNumber}
                  onChange={e => setSelectedLessonNumber(Number(e.target.value))}
                  className="w-full bg-[#FAF5EA] border border-[#A9832E]/35 rounded-xl p-2.5 text-xs text-[#211A15] focus:outline-none focus:ring-2 focus:ring-[#A7002F]"
                >
                  {LESSONS_DATABASE.map(lesson => (
                    <option key={lesson.id} value={lesson.lessonNumber}>
                      Aula {lesson.lessonNumber.toString().padStart(2, '0')}: {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-3.5 bg-[#FAF5EA] rounded-2xl border border-[#E5DBCA] text-xs space-y-1.5">
                <div className="font-bold text-[#A7002F] font-serif text-sm">
                  {selectedLesson.title}
                </div>
                <div className="text-[11px] text-[#6B5D4F]">
                  Data: {selectedLesson.fullDate} • Fase: {selectedLesson.phase}
                </div>
                {selectedLesson.actualProfessor && (
                  <div className="text-[11px] text-[#211A15] font-semibold">
                    Prof. {selectedLesson.actualProfessor}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs text-[#6B5D4F] mb-1 font-medium">
                  Foco Dogmático Personalizado (Opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Responsabilidade dos administradores..."
                  value={customFocus}
                  onChange={e => setCustomFocus(e.target.value)}
                  className="w-full bg-[#FAF5EA] border border-[#E5DBCA] rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#A7002F]"
                />
              </div>
              <button
                onClick={() => handleGenerateSummary(selectedLessonNumber, customFocus)}
                disabled={isGenerating}
                className="w-full py-2.5 bg-[#A7002F] hover:bg-[#5C0A22] text-white rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{generationStep || 'Processando com Gemini...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Esquema de Estudo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white border border-[#E5DBCA] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DBCA] pb-4 font-['Inter',sans-serif]">
                <div>
                  <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#A7002F]">
                    Esquema Sintético para Anotações
                  </h3>
                  <p className="text-xs text-[#6B5D4F]">
                    Estrutura pronta para colar nas suas anotações da aula ou no Google NotebookLM.
                  </p>
                </div>
                {generatedSummary && (
                  <button
                    onClick={handleCopySummary}
                    className="px-4 py-2 bg-[#FAF5EA] hover:bg-[#F4EDE0] text-[#5C0A22] border border-[#A9832E]/35 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-800">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#A7002F]" />
                        <span>Copiar Esquema Completo</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {generatedSummary ? (
                <div className="bg-[#FAF5EA] border border-[#A9832E]/25 rounded-2xl p-5 text-xs sm:text-sm text-[#211A15] leading-relaxed whitespace-pre-line font-serif shadow-inner">
                  {generatedSummary}
                </div>
              ) : (
                <div className="text-center py-16 text-xs text-[#6B5D4F] space-y-3 font-['Inter',sans-serif]">
                  <BookOpen className="w-8 h-8 text-[#A9832E]/60 mx-auto" />
                  <p className="max-w-md mx-auto">
                    Selecione uma aula à esquerda e clique em <strong>"Gerar Esquema de Estudo"</strong> para receber uma síntese dogmática com doutrina, leis e julgados formatados para seu caderno.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NotebookLM connection modal */}
      <NotebookLmImportModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        lessons={LESSONS_DATABASE}
        onImportDocument={() => {}}
      />
    </div>
  );
};
