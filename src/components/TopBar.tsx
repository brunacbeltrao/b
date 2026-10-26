import React from 'react';
import { PenLine, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatLongDate, greetingForNow } from '../utils/dateUtils';
import { SyncButton } from './SyncButton';
import { TAB_LABELS } from './Sidebar';

const SUBTITLES: Partial<Record<string, string>> = {
  fdr: '5º período noturno · Perfil 0807',
  lds: 'Grupo de estudos · Ciclo 2026.2',
};

/** Id of the quick-capture textarea on the Hoje page */
export const QUICK_CAPTURE_ID = 'quick-capture-input';

export const TopBar: React.FC = () => {
  const { currentTab, setCurrentTab, setIsMobileNavOpen } = useApp();

  const isHome = currentTab === 'cockpit';
  const title = isHome ? `${greetingForNow()}, Bruna` : TAB_LABELS[currentTab];
  const subtitle = isHome ? formatLongDate() : SUBTITLES[currentTab];

  const openCapture = () => {
    if (!isHome) setCurrentTab('cockpit');
    // Wait for the page transition before focusing the field
    setTimeout(() => {
      const field = document.getElementById(QUICK_CAPTURE_ID) as HTMLTextAreaElement | null;
      field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      field?.focus();
    }, isHome ? 0 : 300);
  };

  return (
    <header
      id="app-topbar"
      className="sticky top-0 z-20 bg-[#f6f5f7]/95 border-b border-[#e6e4e8] px-4 sm:px-6 lg:px-10"
    >
      <div className="max-w-6xl mx-auto h-16 flex items-center gap-3">
        <button
          id="btn-mobile-menu-trigger"
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Abrir menu"
          className="lg:hidden p-2 -ml-2 rounded-md text-stone-600 hover:bg-stone-200/60"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-lg sm:text-[22px] leading-tight text-[#1c1a1e] truncate">{title}</h1>
          {subtitle && <p className="text-xs sm:text-[13px] text-stone-500 truncate">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <SyncButton />
          <button
            id="btn-quick-capture-top"
            onClick={openCapture}
            className="flex items-center gap-1.5 h-9 px-3 rounded-md bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-sm font-medium transition-colors"
          >
            <PenLine className="w-4 h-4" />
            <span className="hidden sm:inline">Anotar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
