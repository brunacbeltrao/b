import { calcularIndices } from './indices';
import { CURRICULO_OBRIGATORIO } from '../data/curriculo';
import { HISTORICO_INICIAL } from '../data/historico';
import { PROGRAMAS_INICIAIS } from '../data/programas';
import { simularCenario, calcularMediaNecessariaAlvo } from './simulator';
import { validarDisciplinaNoSemestre } from './prereq';
import { criarGuia, redefinirParaPrograma, calcularProgressoTopicos } from './guia';
import { Componente } from './types';

export interface TestResult {
  nome: string;
  esperado: string;
  obtido: string;
  passou: boolean;
  detalhes?: string;
}

export function executarTestesDeDominio(): TestResult[] {
  const resultados: TestResult[] = [];
  const compMap = new Map<string, Componente>(
    CURRICULO_OBRIGATORIO.map((c) => [c.codigo, c])
  );
  const parametros = {
    mu: 8.8054,
    sigma: 0.3574,
    chm: 3900,
    pm: 10,
    p: 4,
    chEsperada: 1260,
  };

  const indices = calcularIndices(
    HISTORICO_INICIAL,
    CURRICULO_OBRIGATORIO,
    parametros,
    '2026.1'
  );

  resultados.push({
    nome: '1. CH Aprovada Inicial',
    esperado: '1.200 h',
    obtido: `${indices.chAprovada} h`,
    passou: indices.chAprovada === 1200,
  });

  const mcFormatado = indices.mc?.toFixed(2) ?? '';
  resultados.push({
    nome: '2. Média de Conclusão (MC) Inicial',
    esperado: '8,28',
    obtido: mcFormatado.replace('.', ','),
    passou: indices.mc != null && Math.abs(indices.mc - 8.28) < 0.005,
    detalhes: `9.936 / 1.200 = ${indices.mc}`,
  });

  const crFormatado = indices.cr?.toFixed(4) ?? '';
  resultados.push({
    nome: '3. Coeficiente de Rendimento (CR) Inicial',
    esperado: '7,7545',
    obtido: crFormatado.replace('.', ','),
    passou: indices.cr != null && Math.abs(indices.cr - 7.7545) < 0.0001,
    detalhes: `10.236 / 1.320 = ${indices.cr}`,
  });

  const iechFormatado = indices.iech?.toFixed(4) ?? '';
  resultados.push({
    nome: '4. IECH Inicial (Geral)',
    esperado: '0,9091',
    obtido: iechFormatado.replace('.', ','),
    passou: indices.iech != null && Math.abs(indices.iech - 0.9091) < 0.0001,
    detalhes: `1.200 / 1.320 = ${indices.iech}`,
  });

  const iechpFormatado = indices.iechp?.toFixed(4) ?? '';
  resultados.push({
    nome: '5. IECHP (Semestre 2026.1)',
    esperado: '0,6923',
    obtido: iechpFormatado.replace('.', ','),
    passou: indices.iechp != null && Math.abs(indices.iechp - 0.6923) < 0.0001,
    detalhes: `270 / 390 = ${indices.iechp}`,
  });

  const mcnFormatado = indices.mcn != null ? Math.round(indices.mcn).toString() : '';
  resultados.push({
    nome: '6. MCN Normalizada Inicial',
    esperado: '~353 (500 + 100 * (8,28 - 8,8054)/0,3574)',
    obtido: mcnFormatado,
    passou: indices.mcn != null && Math.abs(indices.mcn - 353) <= 1,
    detalhes: `MCN calculada: ${indices.mcn?.toFixed(2)}`,
  });

  const sim95 = simularCenario(
    HISTORICO_INICIAL,
    CURRICULO_OBRIGATORIO,
    parametros,
    [
      { codigo: 'PG520', nota: 9.5 },
      { codigo: 'PG525', nota: 9.5 },
      { codigo: 'PR433', nota: 9.5 },
    ],
    '2026.2'
  );
  const crSim95 = sim95.simulado.cr?.toFixed(3) ?? '';
  const mcSim95 = sim95.simulado.mc?.toFixed(2) ?? '';
  resultados.push({
    nome: '7. Simulador: Média 9,5 em 2026.2 (CR)',
    esperado: '7,964',
    obtido: crSim95.replace('.', ','),
    passou: sim95.simulado.cr != null && Math.abs(sim95.simulado.cr - 7.964) < 0.001,
    detalhes: `11.946 / 1.500 = ${sim95.simulado.cr}`,
  });
  resultados.push({
    nome: '8. Simulador: Média 9,5 em 2026.2 (MC)',
    esperado: '8,44',
    obtido: mcSim95.replace('.', ','),
    passou: sim95.simulado.mc != null && Math.abs(sim95.simulado.mc - 8.44) < 0.005,
    detalhes: `11.646 / 1.380 = ${sim95.simulado.mc}`,
  });

  const sim10 = simularCenario(
    HISTORICO_INICIAL,
    CURRICULO_OBRIGATORIO,
    parametros,
    [
      { codigo: 'PG520', nota: 10.0 },
      { codigo: 'PG525', nota: 10.0 },
      { codigo: 'PR433', nota: 10.0 },
    ],
    '2026.2'
  );
  const crSim10 = sim10.simulado.cr?.toFixed(3) ?? '';
  const mcSim10 = sim10.simulado.mc?.toFixed(3) ?? '';
  resultados.push({
    nome: '9. Simulador: Média 10,0 em 2026.2 (CR)',
    esperado: '8,024',
    obtido: crSim10.replace('.', ','),
    passou: sim10.simulado.cr != null && Math.abs(sim10.simulado.cr - 8.024) < 0.001,
    detalhes: `12.036 / 1.500 = ${sim10.simulado.cr}`,
  });
  resultados.push({
    nome: '10. Simulador: Média 10,0 em 2026.2 (MC)',
    esperado: '8,504',
    obtido: mcSim10.replace('.', ','),
    passou: sim10.simulado.mc != null && Math.abs(sim10.simulado.mc - 8.504) < 0.005,
    detalhes: `11.736 / 1.380 = ${sim10.simulado.mc}`,
  });

  const inv2700 = calcularMediaNecessariaAlvo(9.0, 10236, 1320, 2700);
  resultados.push({
    nome: '11. Cálculo Inverso: CR 9,0 com 2.700h (Média Necessária)',
    esperado: '~9,61',
    obtido: inv2700.media.toFixed(2).replace('.', ','),
    passou: Math.abs(inv2700.media - 9.6088) < 0.01,
    detalhes: `(9,0 * 4.020 - 10.236) / 2.700 = ${inv2700.media.toFixed(4)}`,
  });

  const compPG526 = compMap.get('PG526')!;
  const errosPG526 = validarDisciplinaNoSemestre(
    compPG526,
    '2026.2',
    HISTORICO_INICIAL,
    [],
    compMap
  );
  const temErroPrePG526 = errosPG526.some(
    (e) => e.tipo === 'PRE' && e.requisito === 'PG525'
  );
  resultados.push({
    nome: '14. Validação: PG526 em 2026.2 falha por pré-requisito (PG525)',
    esperado: 'Falha com erro de PRE (PG525)',
    obtido: temErroPrePG526 ? 'Detectou erro de pré-requisito corretamente' : 'Não detectou erro',
    passou: temErroPrePG526,
  });

  const compINT0067 = compMap.get('INT0067')!;
  const errosINT0067 = validarDisciplinaNoSemestre(
    compINT0067,
    '2026.2',
    HISTORICO_INICIAL,
    [],
    compMap
  );
  const temErroChINT0067 = errosINT0067.some((e) => e.tipo === 'CH_MIN');
  resultados.push({
    nome: '15. Validação: Projeto de TCC (INT0067) falha por CH Mínima (< 2000h)',
    esperado: 'Falha com erro de CH_MIN',
    obtido: temErroChINT0067 ? 'Detectou falta de CH mínima corretamente' : 'Não detectou',
    passou: temErroChINT0067,
  });

  const { topicos } = criarGuia('tentativa-teste', 'PG520', PROGRAMAS_INICIAIS);
  topicos[0].concluido = true;
  topicos[1].concluido = true;
  topicos[2].concluido = true;
  const prog = calcularProgressoTopicos(topicos);
  resultados.push({
    nome: '16. Guia da Disciplina: Progresso com 3 de 11 concluídos',
    esperado: '3 de 11 (27%)',
    obtido: `${prog.concluidos} de ${prog.total} (${prog.porcentagem}%)`,
    passou: prog.concluidos === 3 && prog.total === 11,
  });

  return resultados;
}
