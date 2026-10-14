import { todayISO } from '../utils/dateUtils';
import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  HeartPulse,
  RotateCcw,
  Wallet,
  BookOpen,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import { BrandBLogo } from './BrandB';

interface NavItem {
  id: NavigationTab;
  label: string;
  sublabel: string;
  icon: React.ElementType;
  badgeColor?: string;
  badgeText?: string;
}

export const Sidebar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    isMobileNavOpen,
    setIsMobileNavOpen,
    resetToDefaults,
    priorities,
    events,
    books,
  } = useApp();

  // Calculate quick metrics for badges
  const todayStr = todayISO();
  const todayEventsCount = events.filter(e => e.date === todayStr).length;
  const pendingPrioritiesCount = priorities.filter(p => !p.completed).length;
  const booksReadCount = books.filter(b => b.status === 'lido').length;

  const navItems: NavItem[] = [
    {
      id: 'cockpit',
      label: 'Cockpit',
      sublabel: 'Visão Geral & Foco',
      icon: LayoutDashboard,
      badgeText: pendingPrioritiesCount > 0 ? `${pendingPrioritiesCount}` : undefined,
      badgeColor: 'bg-[#fce4e4] text-[#8b1538]',
    },
    {
      id: 'fdr',
      label: 'Direito FDR',
      sublabel: 'UFPE • Perfil 0807',
      icon: GraduationCap,
      badgeText: '5º Sem',
      badgeColor: 'bg-[#e4ebf5] text-[#24426b]',
    },
    {
      id: 'lds',
      label: 'Liga LDS',
      sublabel: 'Direito Societário',
      icon: ShieldCheck,
      badgeText: '26.2',
      badgeColor: 'bg-[#fce4e4] text-[#8b1538]',
    },
    {
      id: 'calendario',
      label: 'Calendário',
      sublabel: 'Agenda Integrada',
      icon: Calendar,
      badgeText: todayEventsCount > 0 ? `${todayEventsCount}` : undefined,
      badgeColor: 'bg-stone-100 text-stone-600',
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      sublabel: 'Receitas & Despesas',
      icon: Wallet,
      badgeText: 'R$ 1.1k+',
      badgeColor: 'bg-amber-50 text-amber-800',
    },
    {
      id: 'livros',
      label: 'Livros',
      sublabel: 'Estante 2026',
      icon: BookOpen,
      badgeText: `${booksReadCount} lidos`,
      badgeColor: 'bg-indigo-50 text-indigo-800',
    },
    {
      id: 'rotina',
      label: 'Rotina & Hábitos',
      sublabel: 'Sono & Treinos',
      icon: HeartPulse,
      badgeColor: 'bg-rose-50 text-[#8c4d61]',
    },
  ];

  const renderNavContent = (isMobile: boolean = false) => (
    <>
      <div>
        {/* Brand & Editorial Heading with Lovable "B" Identity */}
        <div className="mb-6 pt-1">
          <div className="flex items-center justify-between">
            <BrandBLogo subtitle="Personal OS" size="md" />
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#f3f3f3] text-stone-500">
                v2.6
              </span>
              {isMobile && (
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  aria-label="Fechar Menu"
                  className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="h-0.5 w-10 bg-[#8b1538] mt-3" />
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                id={`${isMobile ? 'mobile-' : ''}nav-tab-${item.id}`}
                onClick={() => {
                  setCurrentTab(item.id);
                  if (isMobile) setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#fce4e4] text-[#8b1538] font-semibold shadow-2xs'
                    : 'text-stone-600 hover:bg-[#f3f3f3] hover:text-[#212021]'
                }`}
              >
                <div className="flex items-center min-w-0">
                  <span className="w-5 h-5 mr-2.5 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#8b1538]' : 'text-stone-400'}`} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badgeText && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 shrink-0 ${
                      item.badgeColor || 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {item.badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Performance Executiva & Profile Footer */}
      <div className="pt-4 border-t border-[#ece8e1] space-y-3 mt-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1.5">
            Leituras 2026
          </div>
          <div className="flex items-center space-x-2 text-xs text-[#212021] font-medium">
            <div className="w-2 h-2 rounded-full bg-[#8b1538] shrink-0" />
            <span className="truncate">
              Progresso: {booksReadCount} de {books.length} livros
            </span>
          </div>
          <div className="w-full bg-[#ece8e1] h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-[#8b1538] h-1 rounded-full transition-all"
              style={{ width: `${Math.min(100, (booksReadCount / Math.max(1, books.length)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Compact User profile */}
        <div className="pt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#fce4e4] flex items-center justify-center text-[#8b1538] font-serif-title font-bold text-xs border border-[#f3ccd1] shrink-0">
              BB
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#212021] truncate">Bruna Beltrão</div>
              <div className="text-[10px] text-stone-400 truncate">Direito FDR • LDS</div>
            </div>
          </div>
          <button
            id={`btn-reset-defaults${isMobile ? '-mobile' : ''}`}
            onClick={resetToDefaults}
            title="Restaurar dados de exemplo"
            className="p-1 rounded text-stone-400 hover:text-[#8b1538] hover:bg-[#f3f3f3] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="sidebar-navigation"
        aria-label="Menu Principal"
        className="hidden lg:flex w-[240px] h-screen sticky top-0 bg-white border-r border-[#ece8e1] flex-col p-5 shadow-xs z-20 shrink-0 select-none justify-between overflow-y-auto"
      >
        {renderNavContent(false)}
      </aside>

      {/* Mobile Slide-Over Backdrop */}
      {isMobileNavOpen && (
        <div
          onClick={() => setIsMobileNavOpen(false)}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        id="sidebar-navigation-mobile"
        aria-label="Menu Lateral Mobile"
        className={`fixed inset-y-0 left-0 w-[270px] max-w-[80vw] bg-white border-r border-[#ece8e1] flex flex-col p-5 shadow-2xl z-50 select-none justify-between overflow-y-auto transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNavContent(true)}
      </aside>
    </>
  );
};
