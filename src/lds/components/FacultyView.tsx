/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FACULTY_MEMBERS } from '../data/curriculum';
import { LdsCrest } from './LdsBrand';
import { Mail } from 'lucide-react';

export const FacultyView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredMembers = FACULTY_MEMBERS.filter(member => {
    if (activeCategory === 'all') return true;
    return member.category === activeCategory;
  });

  const getCategoryTitle = (cat: string) => {
    switch (cat) {
      case 'diretoria':
        return 'Diretoria Executiva';
      case 'orientador':
        return 'Professor Orientador UFPE';
      case 'conselho_advogados':
        return 'Conselho de Advogados';
      case 'conselho_admin':
        return 'Conselho de Administração';
      default:
        return 'Corpo Docente';
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 px-2 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-[#A9832E]/25 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="eyebrow-lds text-[#A7002F] tracking-[0.16em] uppercase font-semibold text-xs mb-1">
              GOVERNANÇA & QUADRO ACADÊMICO
            </div>
            <h1 className="font-['Cormorant_Garamond',serif] text-3xl sm:text-4xl font-bold text-[#A7002F] tracking-tight">
              Corpo Docente, Diretoria e Orientadores
            </h1>
            <p className="mt-1 text-sm text-[#6B5D4F] font-sans">
              Estrutura estatutária da Liga de Direito Societário e Mercado de Capitais da Faculdade de Direito do Recife (FDR / UFPE).
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-[#F4EDE0] border border-[#A9832E]/25 rounded-2xl overflow-x-auto self-start sm:self-auto font-['Inter',sans-serif]">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white text-[#A7002F] font-semibold shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#211A15]'
              }`}
            >
              Todos ({FACULTY_MEMBERS.length})
            </button>
            <button
              onClick={() => setActiveCategory('diretoria')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'diretoria'
                  ? 'bg-white text-[#A7002F] font-semibold shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#211A15]'
              }`}
            >
              Diretoria
            </button>
            <button
              onClick={() => setActiveCategory('orientador')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'orientador'
                  ? 'bg-white text-[#A7002F] font-semibold shadow-xs'
                  : 'text-[#6B5D4F] hover:text-[#211A15]'
              }`}
            >
              Orientador
            </button>
          </div>
        </div>
      </div>

      {/* Grid of members */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className="bg-[#FAF5EA] border border-[#E5DBCA] hover:border-[#A7002F]/60 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="eyebrow-lds text-[#A7002F] font-bold text-xs uppercase">
                  {member.role}
                </span>
                <span className="text-[10px] font-['Inter',sans-serif] px-2 py-0.5 bg-[#F4EDE0] text-[#5C0A22] rounded-full border border-[#A9832E]/25">
                  {getCategoryTitle(member.category)}
                </span>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-[#5C0A22] text-[#FAF5EA] flex items-center justify-center font-['Cormorant_Garamond',serif] text-xl font-bold shrink-0 shadow-xs border border-[#A9832E]/30">
                  {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="font-['Cormorant_Garamond',serif] text-xl font-bold text-[#211A15]">
                    {member.name}
                  </h3>
                  <p className="text-xs font-['Inter',sans-serif] text-[#6B5D4F] font-medium leading-tight">
                    {member.affiliation}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#211A15] leading-relaxed font-['Source_Serif_4',serif] mb-4">
                {member.bio}
              </p>
            </div>
            {member.contact && (
              <div className="pt-3 border-t border-[#E5DBCA] flex items-center justify-between text-xs text-[#6B5D4F] font-['Inter',sans-serif]">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#A9832E] shrink-0" />
                  <span className="truncate">{member.contact}</span>
                </span>
                <span className="text-[10px] text-[#A7002F] font-semibold shrink-0">FDR • UFPE</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Governance Banner */}
      <div className="mt-12 p-6 bg-[#F4EDE0] border border-[#A9832E]/35 rounded-3xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="eyebrow-lds text-[#A7002F] text-xs font-bold uppercase">
            CONSTITUIÇÃO INSTITUCIONAL DA LIGA
          </div>
          <h3 className="font-['Cormorant_Garamond',serif] text-2xl font-bold text-[#211A15]">
            Liga de Direito Societário e Mercado de Capitais (LDS FDR)
          </h3>
          <p className="text-xs text-[#6B5D4F] max-w-2xl font-serif">
            Entidade acadêmica sem fins lucrativos vinculada ao Centro de Ciências Jurídicas da UFPE. O corpo social se reúne semanalmente para formação teórica de excelência e prática simulada perante o mercado jurídico nacional.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <LdsCrest size={48} color="#A7002F" />
        </div>
      </div>
    </div>
  );
};
