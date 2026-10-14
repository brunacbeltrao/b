import { Estado, StatusGrade, Componente, Tentativa } from '../domain/types';
import {
  calcularIndices,
  ResultadoIndices,
} from '../domain/indices';
import { statusDaDisciplina, ordemSemestre } from '../domain/status';
import { validarPlanoCompleto, preverFormatura } from '../domain/planner';
import { calcularProgressoTopicos } from '../domain/guia';

export interface PontoGraficoIndice {
  semestre: string;
  cr: number;
  mc: number;
  chAcumulada: number;
}

export interface ProgressoCategorias {
  obrigatorias: { atual: number; total: number; porcentagem: number };
  eletivasPerfil: { atual: number; total: number; porcentagem: number };
  eletivasLivres: { atual: number; total: number; porcentagem: number };
  complementares: { atual: number; total: number; porcentagem: number };
  total: { atual: number; total: number; porcentagem: number };
}

export interface AlertaItem {
  id: string;
  tipo: 'erro' | 'aviso' | 'info';
  titulo: string;
  descricao: string;
  origem: 'plano' | 'semestre' | 'prazo' | 'eletivas';
}

export function selectIndices(state: Estado): ResultadoIndices {
  return calcularIndices(
    state.tentativas,
    state.componentes,
    state.perfil.parametrosIndices,
    '2026.1'
  );
}

export function selectStatusPorDisciplina(state: Estado): Map<string, StatusGrade> {
  const mapa = new Map<string, StatusGrade>();
  for (const c of state.componentes) {
    mapa.set(c.codigo, statusDaDisciplina(c.codigo, state.tentativas));
  }
  return mapa;
}

export function selectProgressoPorCategoria(state: Estado): ProgressoCategorias {
  const compMap = new Map<string, Componente>(state.componentes.map((c) => [c.codigo, c]));

  let chObrigAprovada = 0;
  for (const t of state.tentativas) {
    if (t.situacao === 'APR' || t.situacao === 'APRN') {
      const comp = compMap.get(t.codigo);
      if (comp && comp.tipo === 'OBRIG') {
        chObrigAprovada += comp.ch;
      }
    }
  }

  let chEletivaPerfil = 0;
  let chEletivaLivre = 0;
  for (const e of state.eletivasCursadas || []) {
    if (e.categoria === 'perfil') chEletivaPerfil += e.ch;
    else chEletivaLivre += e.ch;
  }

  let chComplementar = 0;
  for (const c of state.complementares || []) {
    chComplementar += c.horas;
  }

  const chComplementarAproveitavel = Math.min(
    state.perfil.chExigida.complementares,
    chComplementar
  );

  const totalAtual =
    chObrigAprovada + chEletivaPerfil + chEletivaLivre + chComplementarAproveitavel;
  const totalExigido = state.perfil.chExigida.total;

  return {
    obrigatorias: {
      atual: chObrigAprovada,
      total: state.perfil.chExigida.obrigatorias,
      porcentagem: Math.min(100, Math.round((chObrigAprovada / state.perfil.chExigida.obrigatorias) * 100)),
    },
    eletivasPerfil: {
      atual: chEletivaPerfil,
      total: state.perfil.chExigida.eletivasPerfil,
      porcentagem: Math.min(100, Math.round((chEletivaPerfil / state.perfil.chExigida.eletivasPerfil) * 100)),
    },
    eletivasLivres: {
      atual: chEletivaLivre,
      total: state.perfil.chExigida.eletivasLivres,
      porcentagem: Math.min(100, Math.round((chEletivaLivre / state.perfil.chExigida.eletivasLivres) * 100)),
    },
    complementares: {
      atual: chComplementar,
      total: state.perfil.chExigida.complementares,
      porcentagem: Math.min(100, Math.round((chComplementar / state.perfil.chExigida.complementares) * 100)),
    },
    total: {
      atual: totalAtual,
      total: totalExigido,
      porcentagem: Math.min(100, Math.round((totalAtual / totalExigido) * 100)),
    },
  };
}

export function selectDisciplinasMatriculadas(
  state: Estado
): { tentativa: Tentativa; componente: Componente }[] {
  const compMap = new Map<string, Componente>(state.componentes.map((c) => [c.codigo, c]));
  const lista: { tentativa: Tentativa; componente: Componente }[] = [];
  for (const t of state.tentativas) {
    if (t.situacao === 'MATR' && t.semestre === state.perfil.periodoAtual) {
      const comp = compMap.get(t.codigo);
      if (comp) {
        lista.push({ tentativa: t, componente: comp });
      }
    }
  }
  return lista;
}

export function selectEvolucaoIndices(state: Estado): PontoGraficoIndice[] {
  const semestresUnicos = Array.from(
    new Set(
      state.tentativas
        .filter((t) => t.situacao !== 'MATR')
        .map((t) => t.semestre)
    )
  ).sort((a, b) => ordemSemestre(a) - ordemSemestre(b));

  const pontos: PontoGraficoIndice[] = [];

  for (const sem of semestresUnicos) {
    const tentativasAte = state.tentativas.filter(
      (t) => ordemSemestre(t.semestre) <= ordemSemestre(sem) && t.situacao !== 'MATR'
    );
    const indices = calcularIndices(
      tentativasAte,
      state.componentes,
      state.perfil.parametrosIndices,
      sem
    );
    if (indices.cr != null && indices.mc != null) {
      pontos.push({
        semestre: sem,
        cr: Number(indices.cr.toFixed(2)),
        mc: Number(indices.mc.toFixed(2)),
        chAcumulada: indices.chAprovada,
      });
    }
  }

  return pontos;
}

export function selectAlertas(state: Estado): AlertaItem[] {
  const alertas: AlertaItem[] = [];

  const validacaoPlano = validarPlanoCompleto(
    state.planoSemestres,
    state.tentativas,
    state.componentes
  );

  for (const [sem, dados] of validacaoPlano.errosPorSemestre.entries()) {
    if (dados.excedeTeto) {
      alertas.push({
        id: `teto-${sem}`,
        tipo: 'aviso',
        titulo: `Semestre ${sem} com carga elevada`,
        descricao: `O semestre planejado possui ${dados.chTotal}h, ultrapassando o limite máximo de 480h.`,
        origem: 'plano',
      });
    }
    if (dados.errosDisciplinas.length > 0) {
      alertas.push({
        id: `erro-plano-${sem}`,
        tipo: 'erro',
        titulo: `Pré-requisito bloqueado em ${sem}`,
        descricao: `${dados.errosDisciplinas[0].mensagem}`,
        origem: 'plano',
      });
    }
  }

  const matriculadas = selectDisciplinasMatriculadas(state);
  for (const { tentativa, componente } of matriculadas) {
    const faltasDaTentativa = (state.faltas || [])
      .filter((f) => f.tentativaId === tentativa.id)
      .reduce((s, f) => s + f.quantidade, 0);
    const limite = componente.ch * 0.25;

    if (faltasDaTentativa >= limite) {
      alertas.push({
        id: `falta-reprov-${tentativa.id}`,
        tipo: 'erro',
        titulo: `Reprovação por falta iminente em ${componente.nome}`,
        descricao: `Registradas ${faltasDaTentativa} faltas (limite máximo permitido de ${limite}h).`,
        origem: 'semestre',
      });
    } else if (faltasDaTentativa >= limite * 0.75) {
      alertas.push({
        id: `falta-risco-${tentativa.id}`,
        tipo: 'aviso',
        titulo: `Alerta de faltas em ${componente.nome}`,
        descricao: `Registradas ${faltasDaTentativa} faltas de um limite de ${limite}h (mais de 75% atingido).`,
        origem: 'semestre',
      });
    }
  }

  const previsao = preverFormatura(
    state.planoSemestres,
    state.perfil.prazoMinimo,
    state.perfil.prazoMaximo
  );

  if (previsao.semestreConclusao && !previsao.dentroPrazoMaximo) {
    alertas.push({
      id: 'alerta-prazo-max',
      tipo: 'erro',
      titulo: 'Prazo máximo de conclusão em risco',
      descricao: `A conclusão em ${previsao.semestreConclusao} ultrapassa o prazo máximo do curso (${state.perfil.prazoMaximo}).`,
      origem: 'prazo',
    });
  }

  const progresso = selectProgressoPorCategoria(state);
  const faltamEletivas =
    progresso.eletivasPerfil.total - progresso.eletivasPerfil.atual +
    (progresso.eletivasLivres.total - progresso.eletivasLivres.atual);

  if (faltamEletivas > 0) {
    alertas.push({
      id: 'alerta-eletivas',
      tipo: 'info',
      titulo: `${faltamEletivas}h de eletivas restantes`,
      descricao: `Lembre-se de encaixar eletivas nos semestres mais avançados (${progresso.eletivasPerfil.atual}/${progresso.eletivasPerfil.total}h perfil, ${progresso.eletivasLivres.atual}/${progresso.eletivasLivres.total}h livres).`,
      origem: 'eletivas',
    });
  }

  return alertas;
}

export function selectProgressoSemestreAtual(state: Estado): {
  total: number;
  concluidos: number;
  porcentagem: number;
} {
  const matriculadas = selectDisciplinasMatriculadas(state);
  const idsTentativas = new Set(matriculadas.map((m) => m.tentativa.id));
  const topicosDoSemestre = state.topicos.filter((t) => idsTentativas.has(t.tentativaId));
  return calcularProgressoTopicos(topicosDoSemestre);
}

export interface StatusFaltaDisciplina {
  tentativaId: string;
  codigo: string;
  nome: string;
  chTotal: number;
  maxFaltasHoras: number;
  faltasAtuaisHoras: number;
  aulasFaltadas: number;
  maxAulasFaltadas: number;
  aulasRestantes: number;
  porcentagemFaltas: number;
  porcentagemDoLimite: number;
  emRisco: boolean;
  reprovadaPorFalta: boolean;
}

export function selectStatusFaltasPorDisciplina(state: Estado): StatusFaltaDisciplina[] {
  const matriculadas = selectDisciplinasMatriculadas(state);
  return matriculadas.map(({ tentativa, componente }) => {
    const chTotal = componente.ch;
    const maxFaltasHoras = Math.floor(chTotal * 0.25);
    const faltasDaTentativa = (state.faltas || []).filter((f) => f.tentativaId === tentativa.id);
    const faltasAtuaisHoras = faltasDaTentativa.reduce((acc, f) => acc + f.quantidade, 0);
    const aulasFaltadas = Math.round(faltasAtuaisHoras / 2);
    const maxAulasFaltadas = Math.floor(maxFaltasHoras / 2);
    const aulasRestantes = Math.max(0, maxAulasFaltadas - aulasFaltadas);
    const porcentagemFaltas = Number(((faltasAtuaisHoras / chTotal) * 100).toFixed(1));
    const porcentagemDoLimite = Number(((faltasAtuaisHoras / maxFaltasHoras) * 100).toFixed(1));

    return {
      tentativaId: tentativa.id,
      codigo: componente.codigo,
      nome: componente.nome,
      chTotal,
      maxFaltasHoras,
      faltasAtuaisHoras,
      aulasFaltadas,
      maxAulasFaltadas,
      aulasRestantes,
      porcentagemFaltas,
      porcentagemDoLimite,
      emRisco: porcentagemDoLimite >= 50,
      reprovadaPorFalta: faltasAtuaisHoras > maxFaltasHoras,
    };
  });
}

export interface AulaDoDiaDetalhada {
  id: string;
  horarioId: string;
  tentativaId: string;
  codigo: string;
  nome: string;
  horarioInicio: string;
  horarioFim: string;
  sala?: string;
  statusFalta: StatusFaltaDisciplina;
  presencaRegistrada?: boolean;
}

export function selectAulasDoDia(
  state: Estado,
  diaSemanaAlvo?: number,
  dataStrAlvo?: string
): AulaDoDiaDetalhada[] {
  const agora = new Date();
  const diaSemana = diaSemanaAlvo !== undefined ? diaSemanaAlvo : agora.getDay();
  const dataHoje = dataStrAlvo || agora.toISOString().split('T')[0];
  const compMap = new Map<string, Componente>(state.componentes.map((c) => [c.codigo, c]));
  const statusFaltas = new Map(selectStatusFaltasPorDisciplina(state).map((sf) => [sf.tentativaId, sf]));
  const horarios = (state.horariosAulas || []).filter((h) => h.diaSemana === diaSemana);
  const registros = state.registrosPresenca || [];

  return horarios.map((h) => {
    const comp = compMap.get(h.codigo);
    const regHoje = registros.find((r) => r.tentativaId === h.tentativaId && r.data === dataHoje);
    const status = statusFaltas.get(h.tentativaId) || {
      tentativaId: h.tentativaId,
      codigo: h.codigo,
      nome: comp?.nome || h.codigo,
      chTotal: comp?.ch || 60,
      maxFaltasHoras: 15,
      faltasAtuaisHoras: 0,
      aulasFaltadas: 0,
      maxAulasFaltadas: 7,
      aulasRestantes: 7,
      porcentagemFaltas: 0,
      porcentagemDoLimite: 0,
      emRisco: false,
      reprovadaPorFalta: false,
    };

    return {
      id: h.id,
      horarioId: h.id,
      tentativaId: h.tentativaId,
      codigo: h.codigo,
      nome: comp?.nome || h.codigo,
      horarioInicio: h.horarioInicio,
      horarioFim: h.horarioFim,
      sala: h.sala,
      statusFalta: status,
      presencaRegistrada: regHoje ? regHoje.presente : undefined,
    };
  });
}

export interface ItemEventoCronologico {
  id: string;
  titulo: string;
  data: string;
  horario?: string;
  tipo: 'prova' | 'trabalho' | 'matricula' | 'trancamento' | 'academico';
  disciplinaNome?: string;
  disciplinaCodigo?: string;
  descricao?: string;
  diasRestantes: number;
}

export function selectProximosEventos(state: Estado): ItemEventoCronologico[] {
  const agora = new Date();
  agora.setHours(0, 0, 0, 0);
  const compMap = new Map<string, Componente>(state.componentes.map((c) => [c.codigo, c]));
  const tentMap = new Map<string, Tentativa>(state.tentativas.map((t) => [t.id, t]));
  const eventos: ItemEventoCronologico[] = [];

  for (const lembrete of state.lembretesCalendario || []) {
    if (!lembrete.data) continue;
    const [ano, mes, dia] = lembrete.data.split('-').map(Number);
    const dataEvt = new Date(ano, mes - 1, dia);
    const diffMs = dataEvt.getTime() - agora.getTime();
    const diasRestantes = Math.round(diffMs / (1000 * 60 * 60 * 24));
    let nomeDisc: string | undefined;
    if (lembrete.disciplinaCodigo) {
      nomeDisc = compMap.get(lembrete.disciplinaCodigo)?.nome;
    }
    eventos.push({
      id: lembrete.id,
      titulo: lembrete.titulo,
      data: lembrete.data,
      horario: lembrete.horario,
      tipo: lembrete.tipo,
      disciplinaCodigo: lembrete.disciplinaCodigo,
      disciplinaNome: nomeDisc,
      descricao: lembrete.descricao,
      diasRestantes,
    });
  }

  for (const av of state.avaliacoes || []) {
    if (av.nota !== null || !av.data) continue;
    const jaExiste = eventos.some((e) => e.data === av.data && e.titulo.includes(av.nome));
    if (jaExiste) continue;
    const tent = tentMap.get(av.tentativaId);
    const comp = tent ? compMap.get(tent.codigo) : undefined;
    const [ano, mes, dia] = av.data.split('-').map(Number);
    const dataEvt = new Date(ano, mes - 1, dia);
    const diffMs = dataEvt.getTime() - agora.getTime();
    const diasRestantes = Math.round(diffMs / (1000 * 60 * 60 * 24));
    eventos.push({
      id: `av-${av.id}`,
      titulo: av.nome,
      data: av.data,
      horario: '18:40',
      tipo: 'prova',
      disciplinaCodigo: comp?.codigo,
      disciplinaNome: comp?.nome,
      descricao: `Peso: ${av.peso}`,
      diasRestantes,
    });
  }

  return eventos.sort((a, b) => a.data.localeCompare(b.data));
}

export function selectResumoSemanalEstudo(state: Estado): {
  topicosConcluidosSemana: number;
  metaTopicos: number;
  porcentagemMeta: number;
  provasProximaSemana: ItemEventoCronologico[];
  leiturasEmAndamento: number;
  errosPendentes: number;
} {
  const meta = state.metaSemanal?.metaTopicos || 5;
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const concluidos = (state.topicos || []).filter((t) => {
    if (!t.concluido) return false;
    if (t.concluidoEm) return t.concluidoEm >= seteDiasAtras;
    return true;
  }).length;

  const eventos = selectProximosEventos(state);
  const provasSemana = eventos.filter((e) => e.tipo === 'prova' && e.diasRestantes >= 0 && e.diasRestantes <= 7);
  const leiturasAndamento = (state.leituras || []).filter((l) => l.status === 'lendo').length;
  const errosPendentes = (state.cadernoErros || []).filter((e) => !e.resolvido).length;

  return {
    topicosConcluidosSemana: concluidos,
    metaTopicos: meta,
    porcentagemMeta: Math.min(100, Math.round((concluidos / meta) * 100)),
    provasProximaSemana: provasSemana,
    leiturasEmAndamento: leiturasAndamento,
    errosPendentes,
  };
}
