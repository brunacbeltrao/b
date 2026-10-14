import { Componente, PlanoSemestre, Tentativa } from './types';
import { ordemSemestre } from './status';

export type TipoErroPreReq = 'PRE' | 'CO' | 'CH_MIN';

export interface ErroValidacaoDisciplina {
  codigo: string;
  tipo: TipoErroPreReq;
  requisito?: string;
  faltamCh?: number;
  mensagem: string;
}

export function codigosAprovadosHistorico(tentativas: Tentativa[]): Set<string> {
  const set = new Set<string>();
  for (const t of tentativas) {
    if (t.situacao === 'APR' || t.situacao === 'APRN') {
      set.add(t.codigo);
    }
  }
  return set;
}

export function chIntegralizadaHistorico(
  tentativas: Tentativa[],
  componentesMap: Map<string, Componente>
): number {
  let soma = 0;
  for (const t of tentativas) {
    if (t.situacao === 'APR' || t.situacao === 'APRN') {
      const comp = componentesMap.get(t.codigo);
      soma += comp ? comp.ch : 60;
    }
  }
  return soma;
}

export function codigosAprovadosAte(
  semestre: string,
  tentativas: Tentativa[],
  planoSemestres: PlanoSemestre[],
  modo: 'exclusivo' | 'inclusivo'
): Set<string> {
  const ordemRef = ordemSemestre(semestre);
  const aprovadas = new Set<string>();

  for (const t of tentativas) {
    const ordemT = ordemSemestre(t.semestre);
    const cond = modo === 'exclusivo' ? ordemT < ordemRef : ordemT <= ordemRef;
    if (cond && (t.situacao === 'APR' || t.situacao === 'APRN')) {
      aprovadas.add(t.codigo);
    }
  }

  for (const p of planoSemestres) {
    const ordemP = ordemSemestre(p.semestre);
    const cond = modo === 'exclusivo' ? ordemP < ordemRef : ordemP <= ordemRef;
    if (cond) {
      for (const cod of p.codigos) {
        aprovadas.add(cod);
      }
    }
  }

  return aprovadas;
}

export function chIntegralizadaAte(
  semestre: string,
  tentativas: Tentativa[],
  planoSemestres: PlanoSemestre[],
  componentesMap: Map<string, Componente>,
  modo: 'exclusivo' | 'inclusivo'
): number {
  const ordemRef = ordemSemestre(semestre);
  const codigosContabilizados = new Set<string>();
  let chTotal = 0;

  for (const t of tentativas) {
    const ordemT = ordemSemestre(t.semestre);
    const cond = modo === 'exclusivo' ? ordemT < ordemRef : ordemT <= ordemRef;
    if (cond && (t.situacao === 'APR' || t.situacao === 'APRN')) {
      if (!codigosContabilizados.has(t.codigo)) {
        codigosContabilizados.add(t.codigo);
        const comp = componentesMap.get(t.codigo);
        chTotal += comp ? comp.ch : 60;
      }
    }
  }

  for (const p of planoSemestres) {
    const ordemP = ordemSemestre(p.semestre);
    const cond = modo === 'exclusivo' ? ordemP < ordemRef : ordemP <= ordemRef;
    if (cond) {
      for (const cod of p.codigos) {
        if (!codigosContabilizados.has(cod)) {
          codigosContabilizados.add(cod);
          const comp = componentesMap.get(cod);
          chTotal += comp ? comp.ch : 60;
        }
      }
      for (const e of p.eletivas || []) {
        chTotal += e.ch;
      }
    }
  }

  return chTotal;
}

export function validarDisciplinaNoSemestre(
  comp: Componente,
  semestre: string,
  tentativas: Tentativa[],
  planoSemestres: PlanoSemestre[],
  componentesMap: Map<string, Componente>
): ErroValidacaoDisciplina[] {
  const erros: ErroValidacaoDisciplina[] = [];
  const aprovadasAntes = codigosAprovadosAte(semestre, tentativas, planoSemestres, 'exclusivo');
  const ateMesmoSemestre = codigosAprovadosAte(semestre, tentativas, planoSemestres, 'inclusivo');
  const chAntes = chIntegralizadaAte(semestre, tentativas, planoSemestres, componentesMap, 'exclusivo');

  for (const pre of comp.preReq || []) {
    if (!aprovadasAntes.has(pre)) {
      const preComp = componentesMap.get(pre);
      const nomePre = preComp ? preComp.nome : pre;
      erros.push({
        codigo: comp.codigo,
        tipo: 'PRE',
        requisito: pre,
        mensagem: `Pré-requisito não cumprido: ${nomePre} (${pre}) deve ser aprovada antes.`,
      });
    }
  }

  for (const co of comp.coReq || []) {
    if (!ateMesmoSemestre.has(co)) {
      const coComp = componentesMap.get(co);
      const nomeCo = coComp ? coComp.nome : co;
      erros.push({
        codigo: comp.codigo,
        tipo: 'CO',
        requisito: co,
        mensagem: `Co-requisito não cumprido: ${nomeCo} (${co}) deve ser cursada no mesmo semestre ou antes.`,
      });
    }
  }

  if (comp.chMin > 0 && chAntes < comp.chMin) {
    const faltam = comp.chMin - chAntes;
    erros.push({
      codigo: comp.codigo,
      tipo: 'CH_MIN',
      faltamCh: faltam,
      mensagem: `Carga horária insuficiente: exige ${comp.chMin}h integralizadas antes (faltam ${faltam}h; acumulado: ${chAntes}h).`,
    });
  }

  return erros;
}

export function buscarDependentesDiretos(
  codigo: string,
  componentes: Componente[]
): Componente[] {
  return componentes.filter(
    (c) => (c.preReq && c.preReq.includes(codigo)) || (c.coReq && c.coReq.includes(codigo))
  );
}

export function contarDependentesTotais(
  codigo: string,
  componentesMap: Map<string, Componente>,
  visitados: Set<string> = new Set()
): number {
  let contagem = 0;
  for (const comp of componentesMap.values()) {
    if (
      (comp.preReq?.includes(codigo) || comp.coReq?.includes(codigo)) &&
      !visitados.has(comp.codigo)
    ) {
      visitados.add(comp.codigo);
      contagem += 1 + contarDependentesTotais(comp.codigo, componentesMap, visitados);
    }
  }
  return contagem;
}
