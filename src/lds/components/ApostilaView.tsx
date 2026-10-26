/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GeneratedApostila } from '../types';
import { LdsCrest } from './LdsBrand';
import {
  Printer,
  Copy,
  Check,
  Edit3,
  Save,
  Share2
} from 'lucide-react';

interface ApostilaViewProps {
  apostila: GeneratedApostila;
  onUpdateApostila?: (updated: GeneratedApostila) => void;
  onRegenerateWithFocus?: (focus: string) => void;
}

export const ApostilaView: React.FC<ApostilaViewProps> = ({
  apostila,
  onUpdateApostila
}) => {
  const [copiedDocs, setCopiedDocs] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<GeneratedApostila>(apostila);

  React.useEffect(() => {
    setEditedData(apostila);
    setIsEditing(false);
  }, [apostila]);

  const handlePrint = () => {
    window.print();
  };

  const copyRichHtml = async () => {
    try {
      const element = document.getElementById('apostila-document');
      if (!element) return;
      const htmlContent = element.outerHTML;
      const plainText = element.innerText;
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([htmlContent], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText
          })
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setCopiedDocs(true);
      setTimeout(() => setCopiedDocs(false), 2500);
    } catch (err) {
      console.error('Falha ao copiar HTML rico:', err);
    }
  };

  const copyMarkdown = async () => {
    const md = `# ${apostila.lessonTitle}\n\n**${apostila.eyebrow}**\n${apostila.lessonDate}\n\n## Pontos-Chave\n${apostila.keyPoints.map(kp => `- ${kp}`).join('\n')}\n\n## Legislação Aplicável\n${apostila.legislation.map(l => `### ${l.lawTag} - ${l.article}\n> "${l.text}"\n*Fonte: ${l.sourceName}*\n`).join('\n')}\n\n## Doutrina Citada\n${apostila.doctrineQuotes.map(d => `> "${d.quote}"\n> — **${d.author}**, *${d.work}* (${d.year || 's.d.'})\n`).join('\n')}\n\n## Análise Dogmática e Prática\n${apostila.detailedAnalysis}\n\n---\n*${apostila.footerReference}*`;
    await navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2500);
  };

  const saveEdits = () => {
    if (onUpdateApostila) {
      onUpdateApostila(editedData);
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-2 sm:px-4">
      {/* Utility action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-[#f6f5f7] border border-[#625d66]/30 rounded-2xl no-print shadow-2xs">
        <div className="flex items-center gap-2 text-xs text-[#625d66]">
          <span className="font-bold text-[#8b1538]">Apostila Oficial LDS FDR</span>
          <span aria-hidden="true">•</span>
          <span>Aula {apostila.lessonNumber.toString().padStart(2, '0')}</span>
          <span aria-hidden="true">•</span>
          <span>Pronta para estudo & exportação</span>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={saveEdits}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#8b1538] hover:bg-[#6f0f2c] rounded-full transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Edições</span>
              </button>
              <button
                onClick={() => {
                  setEditedData(apostila);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-xs text-[#625d66] hover:text-[#1c1a1e] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#625d66] hover:text-[#8b1538] bg-white border border-[#625d66]/30 rounded-full transition-colors cursor-pointer shadow-2xs"
              title="Editar o teor da apostila"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Texto</span>
            </button>
          )}
          <button
            onClick={copyRichHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1c1a1e] bg-white hover:bg-[#f6f5f7] border border-[#625d66]/30 rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Copiar com formatação completa para colar no Google Docs"
          >
            {copiedDocs ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copiado p/ Docs!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#8b1538]" />
                <span>Copiar p/ Docs</span>
              </>
            )}
          </button>
          <button
            onClick={copyMarkdown}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#625d66] hover:text-[#1c1a1e] bg-white border border-[#625d66]/30 rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Copiar em sintaxe Markdown"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#f6f5f7] bg-[#6f0f2c] hover:bg-[#8b1538] rounded-full transition-colors cursor-pointer shadow-sm"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* APOSTILA SHEET */}
      <article
        id="apostila-document"
        className="apostila-sheet bg-[#f6f5f7] text-[#1c1a1e] border border-[#e6e4e8] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-sm font-['Source_Serif_4',serif] transition-all"
        style={{
          backgroundColor: '#f6f5f7',
          color: '#1c1a1e',
          lineHeight: '1.65'
        }}
      >
        {/* 1. CABEÇALHO DE CAPÍTULO */}
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="eyebrow-lds text-[#8b1538] tracking-[0.18em] font-semibold text-xs">
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.eyebrow}
                  onChange={e => setEditedData({ ...editedData, eyebrow: e.target.value })}
                  className="w-full bg-white border border-[#8b1538] rounded px-2 py-1 text-xs"
                />
              ) : (
                apostila.eyebrow
              )}
            </span>
            <LdsCrest size={32} color="#8b1538" className="opacity-80" />
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl lg:text-4xl font-bold text-[#8b1538] tracking-tight mb-2 leading-tight">
            {isEditing ? (
              <input
                type="text"
                value={editedData.lessonTitle}
                onChange={e => setEditedData({ ...editedData, lessonTitle: e.target.value })}
                className="w-full bg-white border border-[#8b1538] rounded px-3 py-1.5 font-bold"
              />
            ) : (
              `Aula ${apostila.lessonNumber.toString().padStart(2, '0')} • ${apostila.lessonTitle}`
            )}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#625d66] tracking-wide">
            <span>{apostila.lessonDate}</span>
            <span aria-hidden="true">•</span>
            <span>60 minutos</span>
            <span aria-hidden="true">•</span>
            <span>Faculdade de Direito do Recife (FDR / UFPE)</span>
          </div>
          <div className="mt-4 h-[2px] bg-[#8b1538] w-full" />
        </header>

        {/* Introduction text */}
        <div className="mb-8 text-base text-[#1c1a1e] leading-relaxed">
          {isEditing ? (
            <textarea
              rows={4}
              value={editedData.introduction}
              onChange={e => setEditedData({ ...editedData, introduction: e.target.value })}
              className="w-full bg-white border border-[#625d66] rounded p-2 text-sm"
            />
          ) : (
            <p className="first-letter:text-4xl first-letter:font-serif-title first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-[#8b1538]">
              {apostila.introduction}
            </p>
          )}
        </div>

        {/* 2. CALLOUT DE PONTOS-CHAVE */}
        <div className="mb-8 p-4 sm:p-5 bg-[#f6f5f7] border-l-4 border-[#625d66] rounded-r-2xl shadow-xs border border-r-[#e6e4e8] border-y-[#e6e4e8]">
          <h2 className="eyebrow-lds text-[#625d66] font-medium text-xs mb-2">
            PONTOS-CHAVE
          </h2>
          <p className="text-sm sm:text-[15px] text-[#1c1a1e] font-normal leading-relaxed">
            {isEditing ? (
              <input
                type="text"
                value={editedData.keyPoints.join(' • ')}
                onChange={e => setEditedData({ ...editedData, keyPoints: e.target.value.split(' • ') })}
                className="w-full bg-white border border-[#625d66] rounded p-1 text-sm"
              />
            ) : (
              apostila.keyPoints.join(' • ')
            )}
          </p>
        </div>

        {/* 3. QUADRO DE DISPOSITIVO LEGAL */}
        {apostila.legislation && apostila.legislation.length > 0 && (
          <div className="space-y-5 mb-8">
            {apostila.legislation.map((leg, idx) => (
              <div
                key={idx}
                className="border border-[#e6e4e8] rounded-2xl p-4 sm:p-5 bg-[#f6f5f7] shadow-xs"
              >
                <div className="inline-block bg-[#8b1538] text-[#f6f5f7] font-medium text-xs px-2.5 py-0.5 rounded-sm mb-3">
                  {leg.lawTag}
                </div>
                <blockquote className="text-sm sm:text-base font-medium text-[#1c1a1e] leading-relaxed mb-2">
                  <span className="font-bold text-[#8b1538] mr-1.5">{leg.article}.</span>
                  {leg.text}
                </blockquote>
                <div className="text-xs text-[#625d66] italic">
                  {leg.sourceName}
                </div>
                {leg.commentary && (
                  <div className="mt-3 pt-2.5 border-t border-[#e6e4e8] text-xs text-[#1c1a1e] leading-normal font-sans">
                    <span className="font-semibold text-[#8b1538]">Exegese LDS FDR: </span>
                    {leg.commentary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 4. CITAÇÃO DE DOUTRINA */}
        {apostila.doctrineQuotes && apostila.doctrineQuotes.length > 0 && (
          <div className="space-y-6 mb-8">
            {apostila.doctrineQuotes.map((doc, idx) => (
              <figure
                key={idx}
                className="pl-5 border-l-2 border-[#8b1538] py-1 my-4"
              >
                <blockquote className="font-['Source_Serif_4',serif] italic text-base sm:text-lg text-[#1c1a1e] leading-relaxed">
                  "{doc.quote}"
                </blockquote>
                <figcaption className="mt-2 text-xs sm:text-sm text-[#625d66]">
                  — <span className="font-semibold text-[#8b1538]">{doc.author}</span>,{' '}
                  <cite className="italic">{doc.work}</cite> {doc.year ? `(${doc.year})` : ''}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {/* 5. TABELA COMPARATIVA */}
        {apostila.comparisonTable && apostila.comparisonTable.rows.length > 0 && (
          <div className="my-8 overflow-x-auto rounded-2xl border border-[#8b1538]/30 shadow-xs">
            <div className="bg-[#6f0f2c] text-[#f6f5f7] px-4 py-2 text-xs font-medium text-center">
              {apostila.comparisonTable.title}
            </div>
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-['Source_Serif_4',serif]">
              <thead>
                <tr className="bg-[#6f0f2c] text-[#f6f5f7] text-xs">
                  <th className="p-3 border-r border-[#f6f5f7]/20 font-semibold w-1/3">Critério</th>
                  <th className="p-3 border-r border-[#f6f5f7]/20 font-semibold w-1/3">
                    {apostila.comparisonTable.leftHeader}
                  </th>
                  <th className="p-3 font-semibold w-1/3">
                    {apostila.comparisonTable.rightHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e4e8]">
                {apostila.comparisonTable.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? 'bg-[#f6f5f7]' : 'bg-[#f6f5f7]'}
                  >
                    <td className="p-3 font-semibold text-[#1c1a1e] border-r border-[#e6e4e8]">
                      {row.criterion}
                    </td>
                    <td className="p-3 text-[#1c1a1e] border-r border-[#e6e4e8]">
                      {row.left}
                    </td>
                    <td className="p-3 text-[#1c1a1e]">
                      {row.right}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. ANÁLISE DOGMÁTICA E CASOS PRÁTICOS */}
        <section className="mb-8">
          <h2 className="font-serif-title text-xl sm:text-2xl font-bold text-[#8b1538] mb-4 border-b border-[#e6e4e8] pb-2">
            Desenvolvimento Dogmático e Aplicação Prática
          </h2>
          {isEditing ? (
            <textarea
              rows={12}
              value={editedData.detailedAnalysis}
              onChange={e => setEditedData({ ...editedData, detailedAnalysis: e.target.value })}
              className="w-full bg-white border border-[#8b1538] rounded p-3 text-sm font-serif"
            />
          ) : (
            <div className="prose max-w-none text-base text-[#1c1a1e] leading-relaxed space-y-4">
              {apostila.detailedAnalysis.split('\n\n').map((paragraph, pIdx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={pIdx}
                      className="font-serif-title text-lg font-bold text-[#6f0f2c] mt-6 mb-2"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                return (
                  <p key={pIdx} className="text-[#1c1a1e]">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          )}
        </section>

        {/* 7. PRECEDENTE JURISPRUDENCIAL / CVM */}
        {apostila.jurisprudenceCase && (
          <div className="mb-8 p-4 sm:p-5 bg-[#f6f5f7] border border-[#625d66]/35 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="eyebrow-lds text-[#8b1538] font-bold text-xs uppercase">
                Jurisprudência & Precedente Aplicável
              </span>
              <span className="text-[11px] text-[#625d66] bg-white px-2 py-0.5 rounded border border-[#625d66]/25">
                {apostila.jurisprudenceCase.courtOrAgency}
              </span>
            </div>
            <h4 className="font-serif-title text-lg font-bold text-[#1c1a1e] mb-1">
              {apostila.jurisprudenceCase.title}
            </h4>
            <div className="text-xs font-mono text-[#625d66] mb-2">
              {apostila.jurisprudenceCase.caseNumber}
            </div>
            <p className="text-sm text-[#1c1a1e] leading-relaxed">
              {apostila.jurisprudenceCase.summary}
            </p>
          </div>
        )}

        {/* Conclusion */}
        <div className="mb-10 text-base text-[#1c1a1e] leading-relaxed pt-4 border-t border-[#e6e4e8]">
          <p className="font-medium text-[#1c1a1e]">
            <span className="font-semibold text-[#8b1538]">Síntese Metodológica: </span>
            {apostila.conclusion}
          </p>
        </div>

        {/* 8. RODAPÉ DE PÁGINA */}
        <footer className="mt-12 pt-4 border-t border-[#e6e4e8] flex items-center justify-between text-xs text-[#625d66]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#8b1538]">LDS FDR</span>
            <span aria-hidden="true">•</span>
            <span>GRUPO DE ESTUDOS 2026.2</span>
          </div>
          <div className="font-bold text-[#8b1538]">
            AULA {apostila.lessonNumber.toString().padStart(2, '0')}
          </div>
        </footer>
      </article>
    </div>
  );
};
