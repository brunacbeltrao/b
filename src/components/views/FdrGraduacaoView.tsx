import React, { useState } from 'react';
import {
  Sun,
  Flame,
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Calculator,
  CalendarDays,
  Award,
  Settings,
} from 'lucide-react';
import { HojePage } from '../../fdr/ui/pages/HojePage';
import { EstudosPage } from '../../fdr/ui/pages/EstudosPage';
import { InicioPage } from '../../fdr/ui/pages/InicioPage';
import { SemestrePage } from '../../fdr/ui/pages/SemestrePage';
import { CurriculoPage } from '../../fdr/ui/pages/CurriculoPage';
import { SimuladorPage } from '../../fdr/ui/pages/SimuladorPage';
import { PlanejadorPage } from '../../fdr/ui/pages/PlanejadorPage';
import { GraduacaoPage } from '../../fdr/ui/pages/GraduacaoPage';
import { ConfigPage } from '../../fdr/ui/pages/ConfigPage';

export type FdrTabId =
  | 'hoje'
  | 'estudos'
  | 'inicio'
  | 'semestre'
  | 'curriculo'
  | 'simulador'
  | 'planejador'
  | 'graduacao'
  | 'config';

export const FdrGraduacaoView: React.FC = () => {
  const [abaAtiva, setAbaAtiva] = useState<FdrTabId>('hoje');

  const navItems: { id: FdrTabId; rotulo: string; icone: React.FC<{ className?: string }> }[] = [
    { id: 'hoje', rotulo: 'Hoje', icone: Sun },
    { id: 'estudos', rotulo: 'Estudos', icone: Flame },
    { id: 'inicio', rotulo: 'Dashboard', icone: LayoutDashboard },
    { id: 'semestre', rotulo: 'Semestre 2026.2', icone: GraduationCap },
    { id: 'curriculo', rotulo: 'Currículo', icone: BookOpen },
    { id: 'simulador', rotulo: 'Simulador', icone: Calculator },
    { id: 'planejador', rotulo: 'Planejador', icone: CalendarDays },
    { id: 'graduacao', rotulo: 'Graduação', icone: Award },
    { id: 'config', rotulo: 'Ajustes', icone: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navegação do Módulo FDR */}
      <div className="bg-white p-2 rounded-2xl border border-[#e6e4e8] shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {navItems.map((item) => {
            const Icone = item.icone;
            const ativo = abaAtiva === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  ativo
                    ? 'bg-[#8b1538] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-[#f6f5f7]'
                }`}
              >
                <Icone className={`w-3.5 h-3.5 ${ativo ? 'text-[#f7ecef]' : 'text-stone-400'}`} />
                <span>{item.rotulo}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo da Sub-Aba selecionada */}
      <div>
        {abaAtiva === 'hoje' && <HojePage aoMudarAba={(aba) => setAbaAtiva(aba as FdrTabId)} />}
        {abaAtiva === 'estudos' && <EstudosPage />}
        {abaAtiva === 'inicio' && <InicioPage aoMudarAba={(aba) => setAbaAtiva(aba as FdrTabId)} />}
        {abaAtiva === 'semestre' && <SemestrePage />}
        {abaAtiva === 'curriculo' && <CurriculoPage />}
        {abaAtiva === 'simulador' && <SimuladorPage />}
        {abaAtiva === 'planejador' && <PlanejadorPage />}
        {abaAtiva === 'graduacao' && <GraduacaoPage />}
        {abaAtiva === 'config' && <ConfigPage />}
      </div>
    </div>
  );
};
