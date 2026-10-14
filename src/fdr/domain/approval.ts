import { Avaliacao } from './types';

export interface ResultadoMediaParcial {
  media: number | null;
  pesoTotal: number;
  pesoConcluido: number;
  pesoRestante: number;
  pontosAtuais: number;
  todasConcluidas: boolean;
}

export interface ResultadoNotaNecessaria {
  necessaria: number | null;
  possivel: boolean;
  garantida: boolean;
  meta: number;
}

export interface ResultadoFinal {
  vaiParaFinal: boolean;
  notaNecessariaFinal: number | null;
  notaMinimaExigida: number;
  aprovadaDireto: boolean;
  reprovadaDireto: boolean;
  explicacao: string;
}

export function calcularMediaParcial(avaliacoes: Avaliacao[]): ResultadoMediaParcial {
  if (!avaliacoes || avaliacoes.length === 0) {
    return {
      media: null,
      pesoTotal: 0,
      pesoConcluido: 0,
      pesoRestante: 0,
      pontosAtuais: 0,
      todasConcluidas: false,
    };
  }

  let pesoTotal = 0;
  let pesoConcluido = 0;
  let pontosAtuais = 0;

  for (const a of avaliacoes) {
    const peso = a.peso > 0 ? a.peso : 1;
    pesoTotal += peso;
    if (a.nota != null) {
      pesoConcluido += peso;
      pontosAtuais += a.nota * peso;
    }
  }

  const pesoRestante = pesoTotal - pesoConcluido;
  const media = pesoConcluido > 0 ? pontosAtuais / pesoConcluido : null;
  const todasConcluidas = pesoRestante === 0 && pesoTotal > 0;

  return {
    media,
    pesoTotal,
    pesoConcluido,
    pesoRestante,
    pontosAtuais,
    todasConcluidas,
  };
}

export function calcularNotaNecessaria(
  avaliacoes: Avaliacao[],
  metaMedia: number = 7.0
): ResultadoNotaNecessaria {
  const parcial = calcularMediaParcial(avaliacoes);

  if (parcial.pesoTotal === 0 || parcial.pesoRestante === 0) {
    if (parcial.media != null) {
      return {
        necessaria: null,
        possivel: parcial.media >= metaMedia,
        garantida: parcial.media >= metaMedia,
        meta: metaMedia,
      };
    }
    return {
      necessaria: null,
      possivel: false,
      garantida: false,
      meta: metaMedia,
    };
  }

  const necessaria =
    (metaMedia * parcial.pesoTotal - parcial.pontosAtuais) / parcial.pesoRestante;

  return {
    necessaria: Math.max(0, necessaria),
    possivel: necessaria <= 10.0,
    garantida: necessaria <= 0.0,
    meta: metaMedia,
  };
}

export function calcularRegraFinal(
  mediaParcial: number | null,
  criterio: {
    mediaAprovacaoDireta?: number; // 7.0
    mediaMinimaParaFinal?: number; // 3.0 ou 5.0
    mediaFinalAprovacao?: number; // 5.0
    notaMinimaNaFinal?: number; // 3.0
  } = {}
): ResultadoFinal {
  const direta = criterio.mediaAprovacaoDireta ?? 7.0;
  const minFinal = criterio.mediaMinimaParaFinal ?? 3.0;
  const finalMeta = criterio.mediaFinalAprovacao ?? 5.0;
  const pisoFinal = criterio.notaMinimaNaFinal ?? 3.0;

  if (mediaParcial == null) {
    return {
      vaiParaFinal: false,
      notaNecessariaFinal: null,
      notaMinimaExigida: pisoFinal,
      aprovadaDireto: false,
      reprovadaDireto: false,
      explicacao: 'Aguardando notas das avaliações.',
    };
  }

  if (mediaParcial >= direta) {
    return {
      vaiParaFinal: false,
      notaNecessariaFinal: null,
      notaMinimaExigida: pisoFinal,
      aprovadaDireto: true,
      reprovadaDireto: false,
      explicacao: `Aprovada por média direta (≥ ${direta.toFixed(1)}).`,
    };
  }

  if (mediaParcial < minFinal) {
    return {
      vaiParaFinal: false,
      notaNecessariaFinal: null,
      notaMinimaExigida: pisoFinal,
      aprovadaDireto: false,
      reprovadaDireto: true,
      explicacao: `Média parcial inferior a ${minFinal.toFixed(1)} (reprovada sem direito a final).`,
    };
  }

  const calculada = 2 * finalMeta - mediaParcial;
  const necessaria = Math.max(pisoFinal, calculada);

  return {
    vaiParaFinal: true,
    notaNecessariaFinal: necessaria <= 10 ? necessaria : null,
    notaMinimaExigida: pisoFinal,
    aprovadaDireto: false,
    reprovadaDireto: false,
    explicacao: `Em prova final. Necessário tirar no mínimo ${necessaria.toFixed(1)} (piso regulamentar de ${pisoFinal.toFixed(1)}).`,
  };
}

export interface StatusFaltas {
  totalFaltas: number;
  limiteFaltas: number; // 25% da carga horária
  porcentagemFrequencia: number;
  emRisco: boolean; // >= 75% do limite
  reprovadaPorFalta: boolean;
}

export function calcularStatusFaltas(ch: number, faltasHoras: number): StatusFaltas {
  const limiteFaltas = ch * 0.25; // 25% de faltas permitidas
  const porcentagemFrequencia = Math.max(0, 100 - (faltasHoras / ch) * 100);
  const emRisco = faltasHoras >= limiteFaltas * 0.75 && faltasHoras <= limiteFaltas;
  const reprovadaPorFalta = faltasHoras > limiteFaltas;

  return {
    totalFaltas: faltasHoras,
    limiteFaltas,
    porcentagemFrequencia,
    emRisco,
    reprovadaPorFalta,
  };
}
