import React, { useState } from 'react';
import { Feather, Search, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandBIcon } from './BrandB';
import { formatLongDate, greetingForNow } from '../utils/dateUtils';
import { SyncButton } from './SyncButton';

export const TopBar: React.FC<{ onOpenQuickCapture?: () => void }> = ({ onOpenQuickCapture }) => {
  const { currentTab, setCurrentTab, setIsMobileNavOpen } = useApp();
  const [searchFocused, setSearchFocused] = useState(false);

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    cockpit: {
      title: `${greetingForNow()}, Bruna.`,
      subtitle: formatLongDate(),
    },
    fdr: {
      title: 'Faculdade de Direito do Recife (FDR / UFPE)',
      subtitle: 'Perfil Curricular 0807 • 5º Período Noturno • Integralização, SIGAA & Provas',
    },
    lds: {
      title: 'Liga de Direito Societário (LDS)',
      subtitle: 'Ciclo 26.2 • Encontros Quinzenais, Casos Práticos e Governança Corporativa',
    },
    calendario: {
      title: 'Calendário Geral',
      subtitle: 'Visão integrada • FDR, LDS, Finanças, Livros e Rotina',
    },
    rotina: {
      title: 'Rotina & Hábitos',
      subtitle: 'Ritmo Circadiano, Descanso & Disciplina Diária',
    },
    financeiro: {
      title: 'Gestão Financeira',
      subtitle: 'Controle de Receitas, Apoio Familiar e Despesas Pessoais',
    },
    livros: {
      title: 'Estante de Livros',
      subtitle: 'Leituras Realizadas, Obras em Andamento & Lista 2026',
    },
  };

  const currentInfo = tabTitles[currentTab] || tabTitles.cockpit;

  return (
    <header
      id="app-topbar"
      className="h-16 px-4 md:px-8 border-b border-[#ece8e1] bg-[#faf8f5]/90 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between"
    >
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <button
          id="btn-mobile-menu-trigger"
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Abrir Menu de Navegação"
          className="p-1.5 -ml-1 rounded-lg text-stone-600 hover:text-[#8b1538] hover:bg-[#fce4e4]/60 lg:hidden shrink-0 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Lovable Brand Mark */}
        <div className="lg:hidden shrink-0">
          <BrandBIcon size="sm" withGlow={false} />
        </div>

        <div className="min-w-0">
          <h2
            className="font-serif-title text-lg md:text-2xl font-light text-[#212021] tracking-tight truncate"
          >
            {currentInfo.title}
          </h2>
          <p className="text-stone-400 mt-0.5 uppercase text-[10px] md:text-[11px] tracking-[0.12em] font-semibold truncate font-sans-ui">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 shrink-0">
        {/* Search input with ⌘K badge from High Density theme */}
        <div
          onClick={() => {
            if (currentTab !== 'cockpit') setCurrentTab('cockpit');
          }}
          className="hidden sm:flex items-center px-3.5 py-1.5 bg-white border border-[#ece8e1] rounded-full shadow-2xs text-xs cursor-pointer hover:border-stone-300 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-stone-400 mr-2" />
          <span className="mr-2 text-stone-400 text-xs">Buscar no sistema...</span>
          <span className="bg-stone-100 px-1 py-0.5 rounded text-[10px] text-stone-500 font-mono font-bold">
            ⌘K
          </span>
        </div>

        <SyncButton />

        {/* Quick capture button */}
        <button
          id="btn-quick-capture-top"
          onClick={() => {
            if (currentTab !== 'cockpit') {
              setCurrentTab('cockpit');
            }
            if (onOpenQuickCapture) onOpenQuickCapture();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#8b1538] hover:bg-[#72102c] text-white text-xs font-semibold shadow-2xs transition-all"
        >
          <Feather className="w-3.5 h-3.5 text-[#fce4e4]" />
          <span className="whitespace-nowrap">Captura</span>
        </button>
      </div>
    </header>
  );
};
