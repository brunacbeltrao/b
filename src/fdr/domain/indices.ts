import { Componente, Tentativa } from './types';

export const SITUACOES_EXITO = ['APR', 'APRN'] as const;

export const SITUACOES_COM_NOTA = [
  'APR',
  'APRN',
  'REP',
  'REPN',
  'REPF',
  'REPMF',
  'REPNF',
] as const;

export const SITUACOES_MATRICULA_EFETIVA = [
  'APR',
  'APRN',
  'REP',
  'REPN',
  'REPF',
  'REPMF',
  'REPNF',
  'TRANC',
  'CANC',
] as const;

export interface ParametrosIndices {
  mu: number;
  sigma: number;
  chm: number;
  pm: number | null;
  p: number | null;
  chEsperada?: number | null;
}

export interface ResultadoIndices {
  chAprovada: number;
  chComNota: number;
  chMatriculaEfetiva: number;
  pontosAprovadas: number;
  pontosComNota: number;
  mc: number | null;
  cr: number | null;
  mcn: number | null;
  iech: number | null;
  iechp: number | null;
  iepl: number | null;
  semestreReferencia: string;
}

export function buscarChDoComponente(
  codigo: string,
  componentesMap: Map<string, Componente>,
  fallbackCh: number = 60
): number {
  const comp = componentesMap.get(codigo);
  return comp ? comp.ch : fallbackCh;
}

export function calcularIndices(
  tentativas: Tentativa[],
  componentes: Componente[],
  parametros: ParametrosIndices,
  semestreReferencia: string = '2026.1'
): ResultadoIndices {
  const compMap = new Map<string, Componente>(componentes.map((c) => [c.codigo, c]));

  let chAprovada = 0;
  let pontosAprovadas = 0;
  let chComNota = 0;
  let pontosComNota = 0;
  let chMatriculaEfetiva = 0;

  let chAprovadaSemRef = 0;
  let chEfetivaSemRef = 0;

  for (const t of tentativas) {
    const ch = buscarChDoComponente(t.codigo, compMap);

    // Com êxito
    if (t.situacao === 'APR' || t.situacao === 'APRN') {
      if (t.nota != null) {
        chAprovada += ch;
        pontosAprovadas += t.nota * ch;
      }
    }

    // Com nota numérica (aprovações e reprovações numéricas)
    if (
      t.nota != null &&
      SITUACOES_COM_NOTA.includes(t.situacao as (typeof SITUACOES_COM_NOTA)[number])
    ) {
      chComNota += ch;
      pontosComNota += t.nota * ch;
    }

    // Matrícula efetiva
    if (
      SITUACOES_MATRICULA_EFETIVA.includes(
        t.situacao as (typeof SITUACOES_MATRICULA_EFETIVA)[number]
      )
    ) {
      chMatriculaEfetiva += ch;
    }

    // Para o IECHP (semestre de referência específico)
    if (t.semestre === semestreReferencia) {
      if (t.situacao === 'APR' || t.situacao === 'APRN') {
        chAprovadaSemRef += ch;
      }
      if (
        SITUACOES_MATRICULA_EFETIVA.includes(
          t.situacao as (typeof SITUACOES_MATRICULA_EFETIVA)[number]
        )
      ) {
        chEfetivaSemRef += ch;
      }
    }
  }

  // MC: média de conclusão ponderada
  const mc = chAprovada > 0 ? pontosAprovadas / chAprovada : null;

  // CR: coeficiente de rendimento ponderado
  const cr = chComNota > 0 ? pontosComNota / chComNota : null;

  // MCN: média normalizada
  let mcn: number | null = null;
  if (mc != null && parametros.sigma > 0) {
    mcn = 500 + 100 * ((mc - parametros.mu) / parametros.sigma);
  }

  // IECH: índice de eficiência em carga horária geral
  const iech = chMatriculaEfetiva > 0 ? chAprovada / chMatriculaEfetiva : null;

  // IECHP: índice de eficiência no período de referência
  const iechp = chEfetivaSemRef > 0 ? chAprovadaSemRef / chEfetivaSemRef : null;

  // IEPL: índice de eficiência de progressão linear
  let iepl: number | null = null;
  const p = parametros.p ?? 4;
  const pm = parametros.pm ?? 10;
  const chm = parametros.chm ?? 3900;
  const cargaEsperada =
    parametros.chEsperada && parametros.chEsperada > 0
      ? parametros.chEsperada
      : (p * chm) / pm;

  if (cargaEsperada > 0) {
    iepl = chAprovada / cargaEsperada;
  }

  return {
    chAprovada,
    chComNota,
    chMatriculaEfetiva,
    pontosAprovadas,
    pontosComNota,
    mc,
    cr,
    mcn,
    iech,
    iechp,
    iepl,
    semestreReferencia,
  };
}

export function formatarNumero(
  valor: number | null | undefined,
  casas: number = 2
): string {
  if (valor == null || isNaN(valor)) return '-';
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}
