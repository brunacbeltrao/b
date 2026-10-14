import { Componente, Tentativa } from './types';
import {
  calcularIndices,
  ParametrosIndices,
  ResultadoIndices,
  buscarChDoComponente,
} from './indices';

export interface ResultadoSimulacao {
  atual: ResultadoIndices;
  simulado: ResultadoIndices;
  deltaCr: number;
  deltaMc: number;
  deltaMcn: number;
  chSimulada: number;
}

export interface ItemSimulado {
  codigo: string;
  nota: number;
  situacao?: 'APR' | 'REP';
}

export function simularCenario(
  tentativasBase: Tentativa[],
  componentes: Componente[],
  parametros: ParametrosIndices,
  itensSimulados: ItemSimulado[],
  semestreSimulado: string = '2026.2'
): ResultadoSimulacao {
  const compMap = new Map<string, Componente>(componentes.map((c) => [c.codigo, c]));
  const atual = calcularIndices(tentativasBase, componentes, parametros);

  const novasTentativas: Tentativa[] = tentativasBase.filter(
    (t) => !(t.semestre === semestreSimulado && itensSimulados.some((i) => i.codigo === t.codigo))
  );

  let chSimulada = 0;
  for (const item of itensSimulados) {
    const ch = buscarChDoComponente(item.codigo, compMap);
    chSimulada += ch;
    const situacao =
      item.situacao ??
      (item.nota >= 7.0 ? 'APR' : item.nota >= 5.0 ? 'APRN' : 'REP');

    novasTentativas.push({
      id: `sim-${item.codigo}`,
      codigo: item.codigo,
      semestre: semestreSimulado,
      nota: item.nota,
      freq: 100,
      situacao,
    });
  }

  const simulado = calcularIndices(novasTentativas, componentes, parametros, semestreSimulado);
  const deltaCr = (simulado.cr ?? 0) - (atual.cr ?? 0);
  const deltaMc = (simulado.mc ?? 0) - (atual.mc ?? 0);
  const deltaMcn = (simulado.mcn ?? 0) - (atual.mcn ?? 0);

  return {
    atual,
    simulado,
    deltaCr,
    deltaMc,
    deltaMcn,
    chSimulada,
  };
}

export interface ResultadoMediaNecessaria {
  media: number;
  possivel: boolean;
  teto: number;
  chAtual: number;
  chFutura: number;
  pontosAtuais: number;
  alvo: number;
}

export function calcularMediaNecessariaAlvo(
  alvo: number,
  pontosAtuais: number,
  chAtual: number,
  chFutura: number
): ResultadoMediaNecessaria {
  if (chFutura <= 0) {
    const tetoAtual = chAtual > 0 ? pontosAtuais / chAtual : 0;
    return {
      media: 0,
      possivel: tetoAtual >= alvo,
      teto: tetoAtual,
      chAtual,
      chFutura,
      pontosAtuais,
      alvo,
    };
  }

  const totalCarga = chAtual + chFutura;
  const pontosNecessarios = alvo * totalCarga - pontosAtuais;
  const media = pontosNecessarios / chFutura;
  const teto = (pontosAtuais + 10 * chFutura) / totalCarga;

  return {
    media,
    possivel: media <= 10.0,
    teto,
    chAtual,
    chFutura,
    pontosAtuais,
    alvo,
  };
}
