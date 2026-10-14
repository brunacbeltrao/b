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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-[#F4EDE0] border border-[#A9832E]/30 rounded-3xl no-print shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-['Inter',sans-serif] text-[#6B5D4F]">
          <span className="font-bold text-[#A7002F]">Apostila Oficial LDS FDR</span>
          <span aria-hidden="true">•</span>
          <span>Aula {apostila.lessonNumber.toString().padStart(2, '0')}</span>
          <span aria-hidden="true">•</span>
          <span>Pronta para estudo & exportação</span>
        </div>
        <div className="flex items-center gap-2 font-['Inter',sans-serif]">
          {isEditing ? (
            <>
              <button
                onClick={saveEdits}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#A7002F] hover:bg-[#5C0A22] rounded-full transition-colors cursor-pointer shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Edições</span>
              </button>
              <button
                onClick={() => {
                  setEditedData(apostila);
                  setIsEditing(false);
                }}
                className="px-3 py-1.5 text-xs text-[#6B5D4F] hover:text-[#211A15] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#6B5D4F] hover:text-[#A7002F] bg-white border border-[#A9832E]/30 rounded-full transition-colors cursor-pointer shadow-2xs"
              title="Editar o teor da apostila"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Texto</span>
            </button>
          )}
          <button
            onClick={copyRichHtml}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#211A15] bg-white hover:bg-[#FAF5EA] border border-[#A9832E]/30 rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Copiar com formatação completa para colar no Google Docs"
          >
            {copiedDocs ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copiado p/ Docs!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#A7002F]" />
                <span>Copiar p/ Docs</span>
              </>
            )}
          </button>
          <button
            onClick={copyMarkdown}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#6B5D4F] hover:text-[#211A15] bg-white border border-[#A9832E]/30 rounded-full transition-colors cursor-pointer shadow-2xs"
            title="Copiar em sintaxe Markdown"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Markdown</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#FAF5EA] bg-[#5C0A22] hover:bg-[#A7002F] rounded-full transition-colors cursor-pointer shadow-sm"
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
        className="apostila-sheet bg-[#FAF5EA] text-[#211A15] border border-[#D9CBB7] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm font-['Source_Serif_4',serif] transition-all"
        style={{
          backgroundColor: '#FAF5EA',
          color: '#211A15',
          lineHeight: '1.65'
        }}
      >
        {/* 1. CABEÇALHO DE CAPÍTULO */}
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="eyebrow-lds text-[#A7002F] tracking-[0.18em] font-semibold text-xs uppercase">
              {isEditing ? (
                <input
                  type="text"
                  value={editedData.eyebrow}
                  onChange={e => setEditedData({ ...editedData, eyebrow: e.target.value })}
                  className="w-full bg-white border border-[#A7002F] rounded px-2 py-1 text-xs"
                />
              ) : (
                apostila.eyebrow
              )}
            </span>
            <LdsCrest size={32} color="#A7002F" className="opacity-80" />
          </div>
          <h1 className="font-['Cormorant_Garamond',serif] text-2xl sm:text-3xl lg:text-4xl font-bold text-[#A7002F] tracking-tight mb-2 leading-tight">
            {isEditing ? (
              <input
                type="text"
                value={editedData.lessonTitle}
                onChange={e => setEditedData({ ...editedData, lessonTitle: e.target.value })}
                className="w-full bg-white border border-[#A7002F] rounded px-3 py-1.5 font-bold"
              />
            ) : (
              `Aula ${apostila.lessonNumber.toString().padStart(2, '0')} • ${apostila.lessonTitle}`
            )}
          </h1>
          <div className="flex items-center gap-2 text-xs font-['Inter',sans-serif] text-[#6B5D4F] tracking-wide">
            <span>{apostila.lessonDate}</span>
            <span aria-hidden="true">•</span>
            <span>60 minutos</span>
            <span aria-hidden="true">•</span>
            <span>Faculdade de Direito do Recife (FDR / UFPE)</span>
          </div>
          <div className="mt-4 h-[2px] bg-[#A7002F] w-full" />
        </header>

        {/* Introduction text */}
        <div className="mb-8 text-base text-[#211A15] leading-relaxed">
          {isEditing ? (
            <textarea
              rows={4}
              value={editedData.introduction}
              onChange={e => setEditedData({ ...editedData, introduction: e.target.value })}
              className="w-full bg-white border border-[#A9832E] rounded p-2 text-sm"
            />
          ) : (
            <p className="first-letter:text-4xl first-letter:font-['Cormorant_Garamond',serif] first-letter:font-bold first-letter:float-left first-letter:mr-2.5 first-letter:text-[#A7002F]">
              {apostila.introduction}
            </p>
          )}
        </div>

        {/* 2. CALLOUT DE PONTOS-CHAVE */}
        <div className="mb-8 p-4 sm:p-5 bg-[#FAF5EA] border-l-4 border-[#A9832E] rounded-r-2xl shadow-xs border border-r-[#E5DBCA] border-y-[#E5DBCA]">
          <h2 className="eyebrow-lds text-[#A9832E] font-bold text-xs tracking-widest uppercase mb-2">
            PONTOS-CHAVE
          </h2>
          <p className="text-sm sm:text-[15px] text-[#211A15] font-normal leading-relaxed">
            {isEditing ? (
              <input
                type="text"
                value={editedData.keyPoints.join(' • ')}
                onChange={e => setEditedData({ ...editedData, keyPoints: e.target.value.split(' • ') })}
                className="w-full bg-white border border-[#A9832E] rounded p-1 text-sm"
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
                className="border border-[#E5DBCA] rounded-2xl p-4 sm:p-5 bg-[#FAF5EA] shadow-xs"
              >
                <div className="inline-block bg-[#A7002F] text-[#FAF5EA] font-['Inter',sans-serif] font-bold text-[11px] tracking-wider uppercase px-2.5 py-0.5 rounded-sm mb-3">
                  {leg.lawTag}
                </div>
                <blockquote className="text-sm sm:text-base font-medium text-[#211A15] leading-relaxed mb-2">
                  <span className="font-bold text-[#A7002F] mr-1.5">{leg.article}.</span>
                  {leg.text}
                </blockquote>
                <div className="text-xs font-['Inter',sans-serif] text-[#6B5D4F] italic">
                  {leg.sourceName}
                </div>
                {leg.commentary && (
                  <div className="mt-3 pt-2.5 border-t border-[#E5DBCA] text-xs text-[#211A15] leading-normal font-sans">
                    <span className="font-semibold text-[#A7002F]">Exegese LDS FDR: </span>
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
                className="pl-5 border-l-2 border-[#A7002F] py-1 my-4"
              >
                <blockquote className="font-['Source_Serif_4',serif] italic text-base sm:text-lg text-[#211A15] leading-relaxed">
                  "{doc.quote}"
                </blockquote>
                <figcaption className="mt-2 text-xs sm:text-sm font-['Inter',sans-serif] text-[#6B5D4F]">
                  — <span className="font-semibold text-[#A7002F]">{doc.author}</span>,{' '}
                  <cite className="italic">{doc.work}</cite> {doc.year ? `(${doc.year})` : ''}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {/* 5. TABELA COMPARATIVA */}
        {apostila.comparisonTable && apostila.comparisonTable.rows.length > 0 && (
          <div className="my-8 overflow-x-auto rounded-2xl border border-[#A7002F]/30 shadow-xs">
            <div className="bg-[#5C0A22] text-[#FAF5EA] px-4 py-2 text-xs font-['Inter',sans-serif] font-bold uppercase tracking-wider text-center">
              {apostila.comparisonTable.title}
            </div>
            <table className="w-full text-left border-collapse text-xs sm:text-sm font-['Source_Serif_4',serif]">
              <thead>
                <tr className="bg-[#5C0A22] text-[#FAF5EA] font-['Inter',sans-serif] text-[11px] uppercase tracking-wider">
                  <th className="p-3 border-r border-[#FAF5EA]/20 font-semibold w-1/3">Critério</th>
                  <th className="p-3 border-r border-[#FAF5EA]/20 font-semibold w-1/3">
                    {apostila.comparisonTable.leftHeader}
                  </th>
                  <th className="p-3 font-semibold w-1/3">
                    {apostila.comparisonTable.rightHeader}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DBCA]">
                {apostila.comparisonTable.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? 'bg-[#FAF5EA]' : 'bg-[#F4EDE0]'}
                  >
                    <td className="p-3 font-semibold text-[#211A15] border-r border-[#E5DBCA]">
                      {row.criterion}
                    </td>
                    <td className="p-3 text-[#211A15] border-r border-[#E5DBCA]">
                      {row.left}
                    </td>
                    <td className="p-3 text-[#211A15]">
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
          <h2 className="font-['Cormorant_Garamond',serif] text-xl sm:text-2xl font-bold text-[#A7002F] mb-4 border-b border-[#E5DBCA] pb-2">
            Desenvolvimento Dogmático e Aplicação Prática
          </h2>
          {isEditing ? (
            <textarea
              rows={12}
              value={editedData.detailedAnalysis}
              onChange={e => setEditedData({ ...editedData, detailedAnalysis: e.target.value })}
              className="w-full bg-white border border-[#A7002F] rounded p-3 text-sm font-serif"
            />
          ) : (
            <div className="prose max-w-none text-base text-[#211A15] leading-relaxed space-y-4">
              {apostila.detailedAnalysis.split('\n\n').map((paragraph, pIdx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={pIdx}
                      className="font-['Cormorant_Garamond',serif] text-lg font-bold text-[#5C0A22] mt-6 mb-2"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                return (
                  <p key={pIdx} className="text-[#211A15]">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          )}
        </section>

        {/* 7. PRECEDENTE JURISPRUDENCIAL / CVM */}
        {apostila.jurisprudenceCase && (
          <div className="mb-8 p-4 sm:p-5 bg-[#F4EDE0] border border-[#A9832E]/35 rounded-2xl">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="eyebrow-lds text-[#A7002F] font-bold text-xs uppercase">
                Jurisprudência & Precedente Aplicável
              </span>
              <span className="text-[11px] font-['Inter',sans-serif] text-[#6B5D4F] bg-white px-2 py-0.5 rounded border border-[#A9832E]/25">
                {apostila.jurisprudenceCase.courtOrAgency}
              </span>
            </div>
            <h4 className="font-['Cormorant_Garamond',serif] text-lg font-bold text-[#211A15] mb-1">
              {apostila.jurisprudenceCase.title}
            </h4>
            <div className="text-xs font-mono text-[#6B5D4F] mb-2">
              {apostila.jurisprudenceCase.caseNumber}
            </div>
            <p className="text-sm text-[#211A15] leading-relaxed">
              {apostila.jurisprudenceCase.summary}
            </p>
          </div>
        )}

        {/* Conclusion */}
        <div className="mb-10 text-base text-[#211A15] leading-relaxed pt-4 border-t border-[#E5DBCA]">
          <p className="font-medium text-[#211A15]">
            <span className="font-semibold text-[#A7002F]">Síntese Metodológica: </span>
            {apostila.conclusion}
          </p>
        </div>

        {/* 8. RODAPÉ DE PÁGINA */}
        <footer className="mt-12 pt-4 border-t border-[#D9CBB7] flex items-center justify-between text-xs font-['Inter',sans-serif] tracking-wider text-[#6B5D4F] uppercase">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#A7002F]">LDS FDR</span>
            <span aria-hidden="true">•</span>
            <span>GRUPO DE ESTUDOS 2026.2</span>
          </div>
          <div className="font-bold text-[#A7002F]">
            AULA {apostila.lessonNumber.toString().padStart(2, '0')}
          </div>
        </footer>
      </article>
    </div>
  );
};
