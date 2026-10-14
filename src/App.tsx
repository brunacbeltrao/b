import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  HeartPulse,
  Menu,
} from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CockpitView } from './components/views/CockpitView';
import { CalendarView } from './components/views/CalendarView';
import { FdrGraduacaoView } from './components/views/FdrGraduacaoView';
import { LdsView } from './components/views/LdsView';
import { RotinaBemEstarView } from './components/views/RotinaBemEstarView';
import { FinanceView } from './components/views/FinanceView';
import { BooksView } from './components/views/BooksView';

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
      default:
        return <CockpitView key="cockpit-default" />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#faf8f5] flex text-[#2a2420] font-sans-ui selection:bg-[#ecd5dc] selection:text-[#5e2d3b]">
      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overscroll-y-contain">
        <TopBar />

        <main className="flex-1 p-3.5 sm:p-6 md:p-10 max-w-7xl w-full mx-auto pb-28 md:pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Ultra-responsive & Touch-Friendly) */}
      <nav
        id="mobile-bottom-bar"
        aria-label="Navegação Rápida Mobile"
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#ece8e1] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] flex items-center justify-around z-30 lg:hidden shadow-lg"
      >
        <button
          onClick={() => setCurrentTab('cockpit')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-medium transition-colors min-h-[44px] ${
            currentTab === 'cockpit' ? 'text-[#8b1538] font-bold bg-[#fce4e4]/50' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Cockpit</span>
        </button>

        <button
          onClick={() => setCurrentTab('fdr')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-medium transition-colors relative min-h-[44px] ${
            currentTab === 'fdr' ? 'text-[#24426b] font-bold bg-[#e4ebf5]/70' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <GraduationCap className="w-5 h-5 mb-0.5" />
          <span>FDR</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#24426b] absolute top-1.5 right-2.5" />
        </button>

        <button
          onClick={() => setCurrentTab('lds')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-medium transition-colors relative min-h-[44px] ${
            currentTab === 'lds' ? 'text-[#8b1538] font-bold bg-[#fce4e4]/50' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span>LDS</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#8b1538] absolute top-1.5 right-2.5" />
        </button>

        <button
          onClick={() => setCurrentTab('calendario')}
          className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-medium transition-colors min-h-[44px] ${
            currentTab === 'calendario' ? 'text-[#8b1538] font-bold bg-[#fce4e4]/50' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Agenda</span>
        </button>

        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl text-[10px] font-medium text-stone-500 hover:text-stone-800 transition-colors min-h-[44px]"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>Mais</span>
        </button>
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
