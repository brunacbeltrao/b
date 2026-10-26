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
import { SectionTabs } from '../ui';
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

  // Most-used first; labels say what each page is for
  const tabs: { id: FdrTabId; label: string }[] = [
    { id: 'hoje', label: 'Hoje' },
    { id: 'semestre', label: 'Semestre' },
    { id: 'estudos', label: 'Estudos' },
    { id: 'curriculo', label: 'Currículo' },
    { id: 'inicio', label: 'Visão geral' },
    { id: 'simulador', label: 'Simulador de notas' },
    { id: 'planejador', label: 'Planejador' },
    { id: 'graduacao', label: 'Formatura' },
    { id: 'config', label: 'Ajustes' },
  ];

  return (
    <div>
      <SectionTabs value={abaAtiva} onChange={setAbaAtiva} tabs={tabs} />

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
