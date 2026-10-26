import React from 'react';
import {
  Sun,
  CalendarDays,
  GraduationCap,
  Scale,
  BookOpen,
  Wallet,
  HeartPulse,
  RotateCcw,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavigationTab } from '../types';
import { BrandBLogo } from './BrandB';
import { todayISO } from '../utils/dateUtils';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  count?: number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

/** Labels shared with the top bar and the mobile tab bar */
export const TAB_LABELS: Record<NavigationTab, string> = {
  cockpit: 'Hoje',
  calendario: 'Agenda',
  fdr: 'Faculdade',
  lds: 'Liga de Societário',
  livros: 'Leituras',
  financeiro: 'Finanças',
  rotina: 'Rotina',
};

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, isMobileNavOpen, setIsMobileNavOpen, resetToDefaults, priorities, events } =
    useApp();

  const todayStr = todayISO();
  const todayEventsCount = events.filter((e) => e.date === todayStr).length;
  const pendingPrioritiesCount = priorities.filter((p) => !p.completed).length;

  const groups: NavGroup[] = [
    {
      items: [
        { id: 'cockpit', label: TAB_LABELS.cockpit, icon: Sun, count: pendingPrioritiesCount },
        { id: 'calendario', label: TAB_LABELS.calendario, icon: CalendarDays, count: todayEventsCount },
      ],
    },
    {
      title: 'Estudos',
      items: [
        { id: 'fdr', label: TAB_LABELS.fdr, icon: GraduationCap },
        { id: 'lds', label: TAB_LABELS.lds, icon: Scale },
        { id: 'livros', label: TAB_LABELS.livros, icon: BookOpen },
      ],
    },
    {
      title: 'Vida',
      items: [
        { id: 'financeiro', label: TAB_LABELS.financeiro, icon: Wallet },
        { id: 'rotina', label: TAB_LABELS.rotina, icon: HeartPulse },
      ],
    },
  ];

  const renderNav = (isMobile: boolean) => (
    <>
      <div className="flex items-center justify-between px-2 pb-6">
        <BrandBLogo size="md" />
        {isMobile && (
          <button
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Fechar menu"
            className="p-2 -mr-2 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6" aria-label="Seções">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.title && <div className="px-2 pb-1.5 text-xs font-medium text-stone-500">{group.title}</div>}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = currentTab === item.id;
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      id={`${isMobile ? 'mobile-' : ''}nav-tab-${item.id}`}
                      onClick={() => {
                        setCurrentTab(item.id);
                        if (isMobile) setIsMobileNavOpen(false);
                      }}
                      aria-current={active ? 'page' : undefined}
                      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-left transition-colors ${
                        active
                          ? 'bg-[#f7ecef] text-[#6f0f2c] font-medium'
                          : 'text-stone-700 hover:bg-stone-100 hover:text-[#1c1a1e]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#8b1538]' : 'text-stone-500'}`} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {!!item.count && (
                        <span className={`text-xs tabular-nums ${active ? 'text-[#8b1538]' : 'text-stone-500'}`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-[#e6e4e8] flex items-center gap-2.5 px-2">
        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center text-xs font-semibold shrink-0">
          BB
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-sm font-medium text-[#1c1a1e] truncate">Bruna Beltrão</div>
          <div className="text-xs text-stone-500 truncate">FDR · UFPE</div>
        </div>
        <button
          id={`btn-reset-defaults${isMobile ? '-mobile' : ''}`}
          onClick={resetToDefaults}
          title="Restaurar dados de exemplo"
          aria-label="Restaurar dados de exemplo"
          className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside
        id="sidebar-navigation"
        aria-label="Menu principal"
        className="hidden lg:flex w-60 h-[100dvh] sticky top-0 bg-white border-r border-[#e6e4e8] flex-col px-3 py-5 shrink-0 overflow-y-auto"
      >
        {renderNav(false)}
      </aside>

      {isMobileNavOpen && (
        <div onClick={() => setIsMobileNavOpen(false)} className="fixed inset-0 bg-stone-900/40 z-40 lg:hidden" />
      )}
      <aside
        id="sidebar-navigation-mobile"
        aria-label="Menu"
        aria-hidden={!isMobileNavOpen}
        className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white flex flex-col px-3 py-5 shadow-xl z-50 overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {renderNav(true)}
      </aside>
    </>
  );
};
