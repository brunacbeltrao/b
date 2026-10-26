import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, CalendarDays, GraduationCap, Scale, Menu } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, TAB_LABELS } from './components/Sidebar';
import { NavigationTab } from './types';
import { TopBar } from './components/TopBar';
import { CockpitView } from './components/views/CockpitView';
import { CalendarView } from './components/views/CalendarView';
import { FdrGraduacaoView } from './components/views/FdrGraduacaoView';
import { LdsView } from './components/views/LdsView';
import { RotinaBemEstarView } from './components/views/RotinaBemEstarView';
import { FinanceView } from './components/views/FinanceView';
import { BooksView } from './components/views/BooksView';
import { HealthView } from './components/views/HealthView';

/** Message shown once after returning from Google's consent screen (?google=conectado|erro). */
const GoogleReturnNotice: React.FC = () => {
  const [result] = useState(() => new URLSearchParams(window.location.search).get('google'));
  const [visible, setVisible] = useState(!!result);
  useEffect(() => {
    if (!result) return;
    const url = new URL(window.location.href);
    url.searchParams.delete('google');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, [result]);
  if (!visible) return null;
  return (
    <div
      role="status"
      className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-20 lg:bottom-6 max-w-[calc(100vw-2rem)] flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#1c1a1e] text-white text-sm shadow-lg"
    >
      {result === 'conectado'
        ? 'Google conectado. A agenda e as faturas do Gmail já aparecem aqui.'
        : 'Não foi possível conectar o Google. Tente de novo em Conta e conexões.'}
      <button onClick={() => setVisible(false)} className="text-stone-300 hover:text-white" aria-label="Fechar">
        ✕
      </button>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { currentTab, setCurrentTab, setIsMobileNavOpen } = useApp();

  const renderActiveView = () => {
    switch (currentTab) {
      case 'cockpit':
        return <CockpitView key="cockpit" />;
      case 'fdr':
        return <FdrGraduacaoView key="fdr" />;
      case 'lds':
        return <LdsView key="lds" />;
      case 'calendario':
        return <CalendarView key="calendario" />;
      case 'financeiro':
        return <FinanceView key="financeiro" />;
      case 'livros':
        return <BooksView key="livros" />;
      case 'rotina':
        return <RotinaBemEstarView key="rotina" />;
      case 'saude':
        return <HealthView key="saude" />;
      default:
        return <CockpitView key="cockpit-default" />;
    }
  };

  const mobileTabs: { id: NavigationTab; icon: React.ElementType }[] = [
    { id: 'cockpit', icon: Sun },
    { id: 'calendario', icon: CalendarDays },
    { id: 'fdr', icon: GraduationCap },
    { id: 'lds', icon: Scale },
  ];

  return (
    <div className="min-h-[100dvh] flex bg-[#f6f5f7] text-[#1c1a1e]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overscroll-y-contain">
        <TopBar />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-28 lg:pt-8 lg:pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <nav
        id="mobile-bottom-bar"
        aria-label="Navegação rápida"
        className="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-[#e6e4e8] pb-[max(env(safe-area-inset-bottom),0.25rem)]"
      >
        <div className="grid grid-cols-5">
          {mobileTabs.map(({ id, icon: Icon }) => {
            const active = currentTab === id;
            return (
              <button
                key={id}
                onClick={() => setCurrentTab(id)}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] ${
                  active ? 'text-[#8b1538] font-medium' : 'text-stone-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="truncate max-w-full px-1">{TAB_LABELS[id].split(' ')[0]}</span>
              </button>
            );
          })}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] text-stone-500"
          >
            <Menu className="w-5 h-5" />
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
      <GoogleReturnNotice />
    </AppProvider>
  );
}
