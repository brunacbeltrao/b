import { Componente, PlanoSemestre, Tentativa } from './types';
import { ordemSemestre, proximoSemestre } from './status';
import {
  contarDependentesTotais,
  validarDisciplinaNoSemestre,
  ErroValidacaoDisciplina,
} from './prereq';

export interface ErroPlanoGeral {
  semestre: string;
  errosDisciplinas: ErroValidacaoDisciplina[];
  chTotal: number;
  excedeTeto: boolean;
}

export interface PrevisaoFormatura {
  semestreConclusao: string | null;
  dentroPrazoMinimo: boolean;
  dentroPrazoMaximo: boolean;
  semestresRestantes: number;
  mensagem: string;
}

export function calcularHorasSemestre(
  plano: PlanoSemestre,
  componentesMap: Map<string, Componente>
): number {
  let soma = 0;
  for (const cod of plano.codigos) {
    const comp = componentesMap.get(cod);
    soma += comp ? comp.ch : 60;
  }
  for (const e of plano.eletivas || []) {
    soma += e.ch;
  }
  return soma;
}

export function validarPlanoCompleto(
  planoSemestres: PlanoSemestre[],
  tentativas: Tentativa[],
  componentes: Componente[]
): {
  temErros: boolean;
  errosPorSemestre: Map<string, ErroPlanoGeral>;
  codigosDuplicados: string[];
} {
  const compMap = new Map<string, Componente>(componentes.map((c) => [c.codigo, c]));
  const errosPorSemestre = new Map<string, ErroPlanoGeral>();
  let temErros = false;

  const contagemCodigos = new Map<string, number>();
  for (const p of planoSemestres) {
    for (const c of p.codigos) {
      contagemCodigos.set(c, (contagemCodigos.get(c) || 0) + 1);
    }
  }

  const codigosDuplicados: string[] = [];
  for (const [cod, count] of contagemCodigos.entries()) {
    if (count > 1) {
      codigosDuplicados.push(cod);
      temErros = true;
    }
  }

  const ordenados = [...planoSemestres].sort(
    (a, b) => ordemSemestre(a.semestre) - ordemSemestre(b.semestre)
  );

  for (let i = 0; i < ordenados.length; i++) {
    const semPlano = ordenados[i];
    const sem = semPlano.semestre;
    const errosSemestre: ErroValidacaoDisciplina[] = [];
    const planoAnterior = ordenados.slice(0, i + 1);

    for (const cod of semPlano.codigos) {
      const comp = compMap.get(cod);
      if (comp) {
        const errosComp = validarDisciplinaNoSemestre(
          comp,
          sem,
          tentativas,
          planoAnterior,
          compMap
        );
        if (errosComp.length > 0) {
          errosSemestre.push(...errosComp);
          temErros = true;
        }
      }
    }

    const chTotal = calcularHorasSemestre(semPlano, compMap);
    const excedeTeto = chTotal > 480;

    errosPorSemestre.set(sem, {
      semestre: sem,
      errosDisciplinas: errosSemestre,
      chTotal,
      excedeTeto,
    });
  }

  return {
    temErros,
    errosPorSemestre,
    codigosDuplicados,
  };
}

export function sugerirPlano(
  tentativas: Tentativa[],
  componentes: Componente[],
  semestreInicio: string = '2027.1',
  tetoHorasPorSemestre: number = 480,
  maxSemestres: number = 14
): PlanoSemestre[] {
  const compMap = new Map<string, Componente>(componentes.map((c) => [c.codigo, c]));

  const aprovadas = new Set<string>();
  for (const t of tentativas) {
    if (t.situacao === 'APR' || t.situacao === 'APRN') {
      aprovadas.add(t.codigo);
    }
  }

  for (const t of tentativas) {
    if (t.situacao === 'MATR' && ordemSemestre(t.semestre) < ordemSemestre(semestreInicio)) {
      aprovadas.add(t.codigo);
    }
  }

  const pendentes = new Set<string>();
  for (const comp of componentes) {
    if (comp.tipo === 'OBRIG' && !aprovadas.has(comp.codigo)) {
      pendentes.add(comp.codigo);
    }
  }

  const dependentesCache = new Map<string, number>();
  for (const comp of componentes) {
    dependentesCache.set(comp.codigo, contarDependentesTotais(comp.codigo, compMap));
  }

  const planoSugerido: PlanoSemestre[] = [];
  let semestreAtual = semestreInicio;
  let iteracao = 0;

  while (pendentes.size > 0 && iteracao < maxSemestres) {
    iteracao++;
    let chSemestre = 0;
    const codigosNoSemestre: string[] = [];
    const planoAteAgora = [...planoSugerido];

    const candidatas: Componente[] = [];
    for (const codigo of pendentes) {
      const comp = compMap.get(codigo);
      if (!comp) continue;
      const erros = validarDisciplinaNoSemestre(
        comp,
        semestreAtual,
        tentativas,
        planoAteAgora,
        compMap
      );
      const semPreOuChErro = erros.every((e) => e.tipo === 'CO');
      if (semPreOuChErro) {
        candidatas.push(comp);
      }
    }

    candidatas.sort((a, b) => {
      const depA = dependentesCache.get(a.codigo) || 0;
      const depB = dependentesCache.get(b.codigo) || 0;
      if (depB !== depA) return depB - depA;
      const perA = a.periodo ?? 99;
      const perB = b.periodo ?? 99;
      if (perA !== perB) return perA - perB;
      return a.codigo.localeCompare(b.codigo);
    });

    for (const cand of candidatas) {
      if (!pendentes.has(cand.codigo)) continue;
      const chCand = cand.ch;

      const coReqsFaltantes = (cand.coReq || []).filter(
        (co) => !aprovadas.has(co) && !codigosNoSemestre.includes(co)
      );

      let chAdicional = chCand;
      for (const co of coReqsFaltantes) {
        const compCo = compMap.get(co);
        chAdicional += compCo ? compCo.ch : 60;
      }

      if (chSemestre + chAdicional <= tetoHorasPorSemestre || codigosNoSemestre.length === 0) {
        codigosNoSemestre.push(cand.codigo);
        pendentes.delete(cand.codigo);
        aprovadas.add(cand.codigo);
        chSemestre += chCand;
        for (const co of coReqsFaltantes) {
          if (pendentes.has(co)) {
            codigosNoSemestre.push(co);
            pendentes.delete(co);
            aprovadas.add(co);
            const compCo = compMap.get(co);
            chSemestre += compCo ? compCo.ch : 60;
          }
        }
      }
    }

    if (codigosNoSemestre.length > 0) {
      planoSugerido.push({
        semestre: semestreAtual,
        codigos: codigosNoSemestre,
        eletivas: [],
      });
    }

    semestreAtual = proximoSemestre(semestreAtual);
  }

  return planoSugerido;
}

export function preverFormatura(
  planoSemestres: PlanoSemestre[],
  prazoMinimo: string = '2029.2',
  prazoMaximo: string = '2032.1'
): PrevisaoFormatura {
  if (!planoSemestres || planoSemestres.length === 0) {
    return {
      semestreConclusao: null,
      dentroPrazoMinimo: false,
      dentroPrazoMaximo: true,
      semestresRestantes: 0,
      mensagem: 'Nenhum semestre planejado ainda.',
    };
  }

  const ordenados = [...planoSemestres].sort(
    (a, b) => ordemSemestre(a.semestre) - ordemSemestre(b.semestre)
  );

  const ultimo = ordenados[ordenados.length - 1];
  const conclusao = ultimo.semestre;
  const ordemConclusao = ordemSemestre(conclusao);
  const ordemMin = ordemSemestre(prazoMinimo);
  const ordemMax = ordemSemestre(prazoMaximo);

  const dentroPrazoMinimo = ordemConclusao >= ordemMin;
  const dentroPrazoMaximo = ordemConclusao <= ordemMax;

  let mensagem = `Formatura estimada para ${conclusao}.`;
  if (!dentroPrazoMinimo) {
    mensagem += ` Atenção: término antes do prazo mínimo regulamentar (${prazoMinimo}).`;
  } else if (!dentroPrazoMaximo) {
    mensagem += ` Atenção: excede o prazo máximo de integralização (${prazoMaximo})!`;
  } else {
    mensagem += ` Dentro dos prazos regulamentares (${prazoMinimo} a ${prazoMaximo}).`;
  }

  return {
    semestreConclusao: conclusao,
    dentroPrazoMinimo,
    dentroPrazoMaximo,
    semestresRestantes: planoSemestres.length,
    mensagem,
  };
}
