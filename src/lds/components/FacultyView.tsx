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
      <div className="mb-8 border-b border-[#625d66]/25 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="eyebrow-lds text-[#8b1538] tracking-[0.16em] font-semibold text-xs mb-1">
              GOVERNANÇA & QUADRO ACADÊMICO
            </div>
            <h1 className="font-serif-title text-3xl sm:text-4xl font-bold text-[#8b1538] tracking-tight">
              Corpo Docente, Diretoria e Orientadores
            </h1>
            <p className="mt-1 text-sm text-[#625d66] font-sans">
              Estrutura estatutária da Liga de Direito Societário e Mercado de Capitais da Faculdade de Direito do Recife (FDR / UFPE).
            </p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-[#f6f5f7] border border-[#625d66]/25 rounded-2xl overflow-x-auto self-start sm:self-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-white text-[#8b1538] font-semibold shadow-xs'
                  : 'text-[#625d66] hover:text-[#1c1a1e]'
              }`}
            >
              Todos ({FACULTY_MEMBERS.length})
            </button>
            <button
              onClick={() => setActiveCategory('diretoria')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'diretoria'
                  ? 'bg-white text-[#8b1538] font-semibold shadow-xs'
                  : 'text-[#625d66] hover:text-[#1c1a1e]'
              }`}
            >
              Diretoria
            </button>
            <button
              onClick={() => setActiveCategory('orientador')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === 'orientador'
                  ? 'bg-white text-[#8b1538] font-semibold shadow-xs'
                  : 'text-[#625d66] hover:text-[#1c1a1e]'
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
            className="bg-[#f6f5f7] border border-[#e6e4e8] hover:border-[#8b1538]/60 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="eyebrow-lds text-[#8b1538] font-bold text-xs uppercase">
                  {member.role}
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-[#f6f5f7] text-[#6f0f2c] rounded-full border border-[#625d66]/25">
                  {getCategoryTitle(member.category)}
                </span>
              </div>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-[#6f0f2c] text-[#f6f5f7] flex items-center justify-center font-serif-title text-xl font-bold shrink-0 shadow-xs border border-[#625d66]/30">
                  {member.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <h3 className="font-serif-title text-xl font-bold text-[#1c1a1e]">
                    {member.name}
                  </h3>
                  <p className="text-xs text-[#625d66] font-medium leading-tight">
                    {member.affiliation}
                  </p>
                </div>
              </div>
              <p className="text-xs text-[#1c1a1e] leading-relaxed font-['Source_Serif_4',serif] mb-4">
                {member.bio}
              </p>
            </div>
            {member.contact && (
              <div className="pt-3 border-t border-[#e6e4e8] flex items-center justify-between text-xs text-[#625d66]">
                <span className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#625d66] shrink-0" />
                  <span className="truncate">{member.contact}</span>
                </span>
                <span className="text-[10px] text-[#8b1538] font-semibold shrink-0">FDR • UFPE</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Governance Banner */}
      <div className="mt-12 p-6 bg-[#f6f5f7] border border-[#625d66]/35 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="eyebrow-lds text-[#8b1538] text-xs font-bold uppercase">
            CONSTITUIÇÃO INSTITUCIONAL DA LIGA
          </div>
          <h3 className="font-serif-title text-2xl font-bold text-[#1c1a1e]">
            Liga de Direito Societário e Mercado de Capitais (LDS FDR)
          </h3>
          <p className="text-xs text-[#625d66] max-w-2xl font-serif">
            Entidade acadêmica sem fins lucrativos vinculada ao Centro de Ciências Jurídicas da UFPE. O corpo social se reúne semanalmente para formação teórica de excelência e prática simulada perante o mercado jurídico nacional.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <LdsCrest size={48} color="#8b1538" />
        </div>
      </div>
    </div>
  );
};
