import { Guia, PerguntaProfessor, Programa, Topico } from './types';

export const PERGUNTAS_PADRAO_PROFESSOR: string[] = [
  'Quais são as datas oficiais e os pesos de cada avaliação?',
  'Qual é a fórmula de cálculo da média e o critério da prova final?',
  'Haverá trabalhos ou seminários complementares com pontuação extra?',
  'Qual é a bibliografia básica e a doutrina recomendada para estudo?',
  'Como será feito o controle de chamada e o limite de faltas?',
];

export function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function criarGuia(
  tentativaId: string,
  codigo: string,
  programas: Programa[]
): { guia: Guia; topicos: Topico[] } {
  const p = programas.find((x) => x.componente === codigo);

  const perguntas: PerguntaProfessor[] = PERGUNTAS_PADRAO_PROFESSOR.map((texto, i) => ({
    id: `perg-${i + 1}`,
    pergunta: texto,
    respondida: false,
  }));

  const guia: Guia = {
    tentativaId,
    ementa: p?.ementa ?? '',
    bibliografia: p?.bibliografia ?? '',
    observacoes: '',
    aviso: '',
    perguntasProfessor: perguntas,
  };

  const topicos: Topico[] = (p?.topicos ?? []).map((t, idx) => ({
    id: `topico-${tentativaId}-${t.ordem || idx + 1}`,
    tentativaId,
    ordem: t.ordem ?? idx + 1,
    titulo: t.titulo,
    subtopicos: t.subtopicos ?? '',
    origem: 'programa',
    concluido: false,
    avaliacaoIds: [],
  }));

  return { guia, topicos };
}

export function calcularProgressoTopicos(topicos: Topico[]): {
  total: number;
  concluidos: number;
  porcentagem: number;
} {
  const total = topicos.length;
  const concluidos = topicos.filter((t) => t.concluido).length;
  const porcentagem = total === 0 ? 0 : Math.round((concluidos / total) * 100);

  return {
    total,
    concluidos,
    porcentagem,
  };
}

export function calcularProgressoPorAvaliacao(
  topicos: Topico[],
  avaliacaoId: string
): { total: number; concluidos: number; porcentagem: number } {
  const associados = topicos.filter((t) => t.avaliacaoIds?.includes(avaliacaoId));
  const total = associados.length;
  const concluidos = associados.filter((t) => t.concluido).length;
  const porcentagem = total === 0 ? 0 : Math.round((concluidos / total) * 100);

  return {
    total,
    concluidos,
    porcentagem,
  };
}

export function redefinirParaPrograma(
  topicosAtuais: Topico[],
  programa: Programa | undefined,
  tentativaId: string
): Topico[] {
  if (!programa) {
    return topicosAtuais;
  }

  const personalizados = topicosAtuais.filter(
    (t) => t.origem === 'professor' || t.origem === 'propria'
  );

  const mapaAtuais = new Map<number, Topico>();
  for (const t of topicosAtuais) {
    if (t.origem === 'programa') {
      mapaAtuais.set(t.ordem, t);
    }
  }

  const restaurados: Topico[] = programa.topicos.map((mod, idx) => {
    const ordem = mod.ordem ?? idx + 1;
    const existente = mapaAtuais.get(ordem);

    return {
      id: existente?.id ?? `topico-${tentativaId}-${ordem}`,
      tentativaId,
      ordem,
      titulo: mod.titulo,
      subtopicos: mod.subtopicos ?? '',
      origem: 'programa',
      concluido: existente?.concluido ?? false,
      concluidoEm: existente?.concluidoEm,
      nota: existente?.nota,
      avaliacaoIds: existente?.avaliacaoIds ?? [],
    };
  });

  const todos = [...restaurados, ...personalizados].sort((a, b) => a.ordem - b.ordem);

  return todos.map((t, index) => ({
    ...t,
    ordem: index + 1,
  }));
}
