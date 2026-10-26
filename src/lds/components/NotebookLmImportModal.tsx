/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DocumentItem, DocumentType, Lesson } from '../types';
import { LESSONS_DATABASE } from '../data/curriculum';
import { LdsCrest } from './LdsBrand';
import {
  X,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  FolderOpen,
  Copy,
  Check,
  Download
} from 'lucide-react';

interface NotebookLmImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDocument: (doc: DocumentItem) => void;
  lessons?: Lesson[];
}

export const NotebookLmImportModal: React.FC<NotebookLmImportModalProps> = ({
  isOpen,
  onClose,
  onImportDocument,
  lessons = LESSONS_DATABASE
}) => {
  const [importMode, setImportMode] = useState<'export' | 'paste' | 'file' | 'guide'>('guide');
  const [sourceText, setSourceText] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [targetLessonNumber, setTargetLessonNumber] = useState<number>(4);
  const [detectedType, setDetectedType] = useState<DocumentType>('Doutrina');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [exportLessonNumber, setExportLessonNumber] = useState<number>(4);

  if (!isOpen) return null;

  const currentExportLesson = lessons.find(l => l.lessonNumber === exportLessonNumber) || lessons[0];

  const generateNotebookLmSourceText = (lesson: Lesson): string => {
    return `# FONTE NOTEBOOKLM: LDS FDR - AULA ${lesson.lessonNumber.toString().padStart(2, '0')}: ${lesson.title}
Data da Aula: ${lesson.fullDate} (${lesson.dateStr})
Professor(a): ${lesson.actualProfessor || lesson.instructorName || 'Diretoria LDS FDR'} (${lesson.actualProfessorRole || lesson.instructorRole || 'LDS FDR / UFPE'})
Fase: ${lesson.phase} • Carga: ${lesson.duration}

## 1. OBJETIVOS E PONTOS DOGMÁTICOS CENTRAIS:
${lesson.keyPoints.map(kp => `- ${kp}`).join('\n')}

## 2. DISPOSITIVOS NORMATIVOS E LEGISLAÇÃO APLICÁVEL:
${lesson.legislation.map(l => `### ${l.lawTag} - ${l.article} (${l.sourceName}):\n"${l.text}"\n${l.commentary ? `Comentário Hermenêutico: ${l.commentary}\n` : ''}`).join('\n')}

## 3. DOUTRINA AUTORIZADA CITADA EM SALA:
${lesson.doctrineQuotes.map(d => `> "${d.quote}"\n  **${d.author}**, *${d.work}* (${d.year || 'Edição de referência'}).`).join('\n\n')}

## 4. ANOTAÇÕES PESSOAIS DO ALUNO / DEBATES EM AULA:
${lesson.personalNotes || 'Nenhuma anotação pessoal inserida até o momento.'}

## 5. MATERIAIS DISPONIBILIZADOS:
${lesson.materials && lesson.materials.length > 0 ? lesson.materials.map(m => `- [Material da Aula] ${m.name} (${m.size || 'arquivo'})`).join('\n') : 'Consulte a bibliografia recomendada.'}

## 6. BIBLIOGRAFIA RECOMENDADA PELA LDS FDR:
${lesson.recommendedBibliography.map(b => `- ${b}`).join('\n')}

---
Fonte gerada automaticamente pelo Sistema LDS FDR • Faculdade de Direito do Recife (FDR/UFPE)
`;
  };

  const handleCopyExportText = async () => {
    const text = generateNotebookLmSourceText(currentExportLesson);
    await navigator.clipboard.writeText(text);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  const handleDownloadExportFile = () => {
    const text = generateNotebookLmSourceText(currentExportLesson);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LDS-FDR-Aula-${currentExportLesson.lessonNumber.toString().padStart(2, '0')}-Fonte-NotebookLM.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTextChange = (text: string) => {
    setSourceText(text);
    const lower = text.toLowerCase();
    for (const lesson of lessons) {
      const matchKey = lesson.keyPoints.some(kp => lower.includes(kp.toLowerCase().slice(0, 15)));
      const matchTitle = lower.includes(lesson.title.toLowerCase().slice(0, 15));
      const matchLeg = lesson.legislation.some(l => lower.includes(l.article.toLowerCase()));
      if (matchKey || matchTitle || matchLeg) {
        setTargetLessonNumber(lesson.lessonNumber);
        break;
      }
    }

    if (lower.includes('art.') || lower.includes('lei') || lower.includes('código civil')) {
      setDetectedType('Norma');
    } else if (lower.includes('cvm') || lower.includes('processo administrativo')) {
      setDetectedType('Parecer CVM');
    } else if (lower.includes('stj') || lower.includes('recurso especial') || lower.includes('acórdão')) {
      setDetectedType('Jurisprudência');
    } else {
      setDetectedType('Doutrina');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSourceTitle(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!sourceText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const title =
        sourceTitle.trim() ||
        `Fonte do NotebookLM: ${sourceText.slice(0, 45).replace(/\n/g, ' ')}...`;
      const newDoc: DocumentItem = {
        id: `notebooklm-${Date.now()}`,
        title,
        type: detectedType,
        lessonNumber: targetLessonNumber,
        source: 'NotebookLM (Google) / Caderno da Pesquisadora',
        summary: sourceText.slice(0, 180).replace(/\n+/g, ' ') + '...',
        content: sourceText.trim(),
        dateAdded: new Date().toISOString().split('T')[0],
        tags: ['NotebookLM', 'Google Gemini', `Aula ${targetLessonNumber}`]
      };
      onImportDocument(newDoc);
      setIsProcessing(false);
      setSourceText('');
      setSourceTitle('');
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#f6f5f7] border border-[#8b1538]/30 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-['Source_Serif_4',serif]">
        {/* Modal Header */}
        <div className="p-6 bg-[#6f0f2c] text-[#f6f5f7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LdsCrest size={36} color="#f6f5f7" />
            <div>
              <div className="eyebrow-lds text-[#f6f5f7]/80 text-xs">
                INTEGRAÇÃO DE CADERNOS & INTELIGÊNCIA ARTIFICIAL
              </div>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-white leading-tight">
                Conectar com NotebookLM & Fontes do Gemini
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab mode selection */}
        <div className="p-3 bg-[#f6f5f7] border-b border-[#e6e4e8] flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setImportMode('guide')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              importMode === 'guide'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-[#625d66] hover:bg-white/60'
            }`}
          >
            1. Como Funciona a Conexão
          </button>
          <button
            onClick={() => setImportMode('export')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              importMode === 'export'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-[#625d66] hover:bg-white/60'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>2. Exportar Fonte para NotebookLM</span>
          </button>
          <button
            onClick={() => setImportMode('paste')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              importMode === 'paste'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-[#625d66] hover:bg-white/60'
            }`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>3. Importar Notas do NotebookLM</span>
          </button>
          <button
            onClick={() => setImportMode('file')}
            className={`px-4 py-2 rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              importMode === 'file'
                ? 'bg-[#8b1538] text-white shadow-xs'
                : 'text-[#625d66] hover:bg-white/60'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>4. Carregar PDFs</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#1c1a1e] flex-1">
          {importMode === 'guide' ? (
            <div className="space-y-5">
              <div className="p-5 bg-white border border-[#625d66]/30 rounded-2xl space-y-3 shadow-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f6f5f7] border border-[#625d66]/30 rounded-full text-xs text-[#8b1538] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resposta Direta sobre a Conexão</span>
                </div>
                <h3 className="font-serif-title text-2xl font-bold text-[#8b1538]">
                  Sim! É totalmente possível integrar seu NotebookLM e suas fontes com o Sistema LDS FDR.
                </h3>
                <p className="text-xs sm:text-sm text-[#1c1a1e] leading-relaxed">
                  O <strong>NotebookLM do Google</strong> opera com o conceito de <em>fontes documentais</em> (PDFs, anotações de texto e links). Como ele é uma ferramenta do Google sem login de terceiros, a conexão entre o seu caderno de pesquisa do NotebookLM e este sistema funciona em dois sentidos práticos:
                </p>
              </div>

              {/* 3 Step Integration Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-white border border-[#e6e4e8] rounded-2xl space-y-2 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-[#8b1538] text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="font-bold text-[#1c1a1e] text-sm">Do LDS FDR → para seu NotebookLM</h4>
                  <p className="text-[#625d66] leading-relaxed">
                    Clique na aba <strong>"2. Exportar Fonte"</strong> ou no botão <em>NotebookLM</em> de qualquer aula: você baixa ou copia um arquivo <code>.md</code> completo com todos os artigos de lei, doutrina e anotações para carregar direto no seu NotebookLM!
                  </p>
                </div>
                <div className="p-4 bg-white border border-[#e6e4e8] rounded-2xl space-y-2 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-[#6f0f2c] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="font-bold text-[#1c1a1e] text-sm">Do seu NotebookLM → para o LDS FDR</h4>
                  <p className="text-[#625d66] leading-relaxed">
                    Se você gerou um resumo, guia de estudo ou transcrição no seu NotebookLM, clique na aba <strong>"3. Importar Notas"</strong> e cole o texto: o agente cataloga na aula certa e o disponibiliza para todo o grupo.
                  </p>
                </div>
                <div className="p-4 bg-white border border-[#e6e4e8] rounded-2xl space-y-2 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-[#625d66] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="font-bold text-[#1c1a1e] text-sm">Gemini 3.8 Flash Nativo</h4>
                  <p className="text-[#625d66] leading-relaxed">
                    Você não precisa sair daqui para conversar com a IA: este sistema já roda com o <strong>Google Gemini</strong> integrado, com todo o conhecimento das 17 aulas, Lei 6.404/76 e CVM carregados na memória!
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[#f6f5f7] border border-[#625d66]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#1c1a1e]">
                  <strong className="block text-[#8b1538] text-sm">Pronto para testar a conexão?</strong>
                  <span>Exporte os dados da aula atual para criar uma fonte no seu NotebookLM agora mesmo.</span>
                </div>
                <button
                  onClick={() => setImportMode('export')}
                  className="px-4 py-2 bg-[#8b1538] text-white rounded-full text-xs font-semibold hover:bg-[#6f0f2c] transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Ir para Exportação de Fonte →
                </button>
              </div>
            </div>
          ) : importMode === 'export' ? (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-[#625d66]/30 rounded-2xl space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#8b1538] mb-1">
                      Selecione a Aula para Exportar como Fonte:
                    </label>
                    <select
                      value={exportLessonNumber}
                      onChange={e => setExportLessonNumber(Number(e.target.value))}
                      className="bg-[#f6f5f7] border border-[#625d66]/40 rounded-xl px-3 py-1.5 text-xs text-[#1c1a1e] focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                    >
                      {lessons.map(l => (
                        <option key={l.id} value={l.lessonNumber}>
                          Aula {l.lessonNumber.toString().padStart(2, '0')}: {l.title} ({l.dateStr})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyExportText}
                      className="px-4 py-2 bg-[#8b1538] hover:bg-[#6f0f2c] text-white rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      {copiedExport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedExport ? 'Copiado!' : 'Copiar Texto da Fonte'}</span>
                    </button>
                    <button
                      onClick={handleDownloadExportFile}
                      className="px-3.5 py-2 bg-white hover:bg-[#f6f5f7] text-[#6f0f2c] border border-[#625d66]/40 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      title="Baixar arquivo Markdown para upload no NotebookLM"
                    >
                      <Download className="w-3.5 h-3.5 text-[#625d66]" />
                      <span>Baixar .md</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#625d66]">
                  <span className="font-semibold">Pré-visualização da Fonte Estruturada para o NotebookLM:</span>
                  <span>Pronta para arrastar ou colar no Google NotebookLM</span>
                </div>
                <pre className="p-4 bg-white border border-[#e6e4e8] rounded-2xl text-xs font-mono text-[#1c1a1e] h-64 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {generateNotebookLmSourceText(currentExportLesson)}
                </pre>
              </div>

              <div className="p-3 bg-[#f6f5f7] border border-[#e6e4e8] rounded-xl text-xs text-[#625d66] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  No NotebookLM: clique em <strong>"+ Adicionar Fontes"</strong> → <strong>"Texto copiado"</strong> ou <strong>"Upload de arquivo"</strong> e selecione o arquivo baixado.
                </span>
              </div>
            </div>
          ) : importMode === 'paste' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#8b1538]">
                  Cole o Texto, Resumo ou Citação Exportado do seu NotebookLM:
                </label>
                <textarea
                  rows={8}
                  placeholder="Cole aqui notas do seu caderno, transcrições de áudio geradas pelo NotebookLM ou trechos de doutrina..."
                  value={sourceText}
                  onChange={e => handleTextChange(e.target.value)}
                  className="w-full p-4 bg-white border border-[#625d66]/35 rounded-2xl text-xs text-[#1c1a1e] font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#8b1538] shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1c1a1e] mb-1">
                    Vincular à Aula do Cronograma:
                  </label>
                  <select
                    value={targetLessonNumber}
                    onChange={e => setTargetLessonNumber(Number(e.target.value))}
                    className="w-full bg-white border border-[#625d66]/35 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                  >
                    {lessons.map(l => (
                      <option key={l.id} value={l.lessonNumber}>
                        Aula {l.lessonNumber.toString().padStart(2, '0')}: {l.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#1c1a1e] mb-1">
                    Natureza do Documento:
                  </label>
                  <select
                    value={detectedType}
                    onChange={e => setDetectedType(e.target.value as DocumentType)}
                    className="w-full bg-white border border-[#625d66]/35 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#8b1538]"
                  >
                    <option value="Doutrina">Doutrina Autorizada</option>
                    <option value="Norma">Dispositivo Normativo / Lei</option>
                    <option value="Jurisprudência">Jurisprudência / Acórdão</option>
                    <option value="Parecer CVM">Parecer / Processo CVM</option>
                    <option value="Artigo">Artigo Acadêmico</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleProcessImport}
                  disabled={!sourceText.trim() || isProcessing}
                  className="px-6 py-2.5 bg-[#8b1538] hover:bg-[#6f0f2c] text-white rounded-full text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {isProcessing ? 'Catalogando...' : 'Salvar no Repositório da LDS FDR'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-[#8b1538] bg-[#8b1538]/5'
                    : 'border-[#625d66]/40 hover:border-[#8b1538] bg-white'
                }`}
                onDragOver={e => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    setSourceTitle(file.name.replace(/\.[^/.]+$/, ''));
                    const reader = new FileReader();
                    reader.onload = ev => {
                      if (ev.target?.result) handleTextChange(ev.target.result as string);
                    };
                    reader.readAsText(file);
                  }
                }}
              >
                <UploadCloud className="w-12 h-12 text-[#8b1538] mx-auto mb-3" />
                <h4 className="font-serif-title text-xl font-bold text-[#1c1a1e] mb-1">
                  Arraste e solte arquivos de fontes aqui
                </h4>
                <p className="text-xs text-[#625d66] max-w-md mx-auto mb-4">
                  Envie arquivos de texto (.txt, .md) ou selecione materiais para indexação automática pelo Agente da LDS FDR.
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f6f5f7] hover:bg-[#f6f5f7] text-[#6f0f2c] border border-[#625d66]/40 rounded-full text-xs font-semibold cursor-pointer transition-colors shadow-2xs">
                  <FolderOpen className="w-4 h-4 text-[#8b1538]" />
                  <span>Procurar no Computador</span>
                  <input
                    type="file"
                    accept=".txt,.md,.text"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {sourceText && (
                <div className="p-4 bg-white border border-[#e6e4e8] rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-[#8b1538]">
                    Arquivo Carregado: {sourceTitle || 'Documento'}
                  </div>
                  <p className="text-xs text-[#625d66] truncate font-mono">
                    {sourceText.slice(0, 100)}...
                  </p>
                  <button
                    onClick={handleProcessImport}
                    className="px-5 py-2 bg-[#8b1538] text-white rounded-full text-xs font-semibold shadow-xs"
                  >
                    Confirmar Importação
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f6f5f7] border-t border-[#e6e4e8] flex items-center justify-between text-xs">
          <span className="text-[#625d66]">
            Ambiente compatível com NotebookLM, Google Drive e Google Docs.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#625d66]/30 rounded-full text-[#1c1a1e] hover:bg-[#f6f5f7] cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
