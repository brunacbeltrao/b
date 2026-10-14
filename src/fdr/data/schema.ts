import { z } from 'zod';

export const SituacaoEnum = z.enum([
  'APR',
  'APRN',
  'REP',
  'REPN',
  'REPF',
  'REPMF',
  'REPNF',
  'MATR',
  'TRANC',
  'CANC',
  'DISP',
  'INCORP',
  'CUMP',
]);

export const ComponenteSchema = z.object({
  codigo: z.string().min(1),
  nome: z.string().min(1),
  ch: z.number().positive(),
  periodo: z.number().nullable(),
  tipo: z.enum(['OBRIG', 'ELETIVO']),
  preReq: z.array(z.string()),
  coReq: z.array(z.string()),
  chMin: z.number().default(0),
  ementa: z.string().optional(),
  bibliografia: z.string().optional(),
});

export const TentativaSchema = z.object({
  id: z.string(),
  codigo: z.string(),
  semestre: z.string().regex(/^\d{4}\.[12]$/, 'Semestre deve estar no formato AAAA.S'),
  nota: z.number().min(0).max(10).nullable(),
  freq: z.number().min(0).max(100).nullable(),
  situacao: SituacaoEnum,
});

export const AvaliacaoSchema = z.object({
  id: z.string(),
  tentativaId: z.string(),
  nome: z.string().min(1),
  data: z.string().nullable().optional(),
  peso: z.number().positive(),
  nota: z.number().min(0).max(10).nullable(),
});

export const FaltaSchema = z.object({
  id: z.string(),
  tentativaId: z.string(),
  data: z.string(),
  quantidade: z.number().positive(),
});

export const EletivaPlanejadaSchema = z.object({
  id: z.string(),
  nome: z.string().min(1),
  ch: z.number().positive(),
  categoria: z.enum(['perfil', 'livre']),
});

export const PlanoSemestreSchema = z.object({
  semestre: z.string(),
  codigos: z.array(z.string()),
  eletivas: z.array(EletivaPlanejadaSchema).default([]),
});

export const CenarioSchema = z.object({
  id: z.string(),
  nome: z.string(),
  notas: z.record(z.string(), z.number()),
  dataCriacao: z.string().optional(),
});

export const ComplementarSchema = z.object({
  id: z.string(),
  tipo: z.enum(['monitoria', 'extensao', 'pesquisa', 'evento', 'outro']),
  descricao: z.string(),
  horas: z.number().positive(),
  data: z.string(),
  comprovante: z.string().default(''),
});

export const EstagioSchema = z.object({
  codigo: z.string(),
  local: z.string().default(''),
  supervisor: z.string().default(''),
  horasCumpridas: z.number().min(0),
  inicio: z.string().optional(),
  fim: z.string().optional(),
});

export const TccEtapaSchema = z.object({
  codigo: z.string(),
  status: z.enum(['pendente', 'em_andamento', 'concluida']),
  prazo: z.string().nullable().optional(),
  nota: z.number().nullable().optional(),
  tituloVersao: z.string().optional(),
});

export const TccSchema = z.object({
  orientador: z.string().default(''),
  tema: z.string().default(''),
  etapas: z.array(TccEtapaSchema),
});

export const EnadeSchema = z.object({
  ingressante: z.boolean(),
  concluinte: z.boolean(),
  ingressanteEm: z.string().optional(),
  concluinteEm: z.string().optional(),
});

export const EletivaCursadaSchema = z.object({
  id: z.string(),
  codigo: z.string().optional(),
  nome: z.string(),
  ch: z.number().positive(),
  categoria: z.enum(['perfil', 'livre']),
  semestre: z.string().optional(),
  nota: z.number().nullable().optional(),
});

export const TopicoSchema = z.object({
  id: z.string(),
  tentativaId: z.string(),
  ordem: z.number(),
  titulo: z.string(),
  subtopicos: z.string().optional(),
  origem: z.enum(['programa', 'professor', 'propria']),
  concluido: z.boolean(),
  concluidoEm: z.string().optional(),
  nota: z.string().optional(),
  avaliacaoIds: z.array(z.string()).default([]),
});

export const GuiaSchema = z.object({
  tentativaId: z.string(),
  ementa: z.string().default(''),
  bibliografia: z.string().default(''),
  observacoes: z.string().default(''),
  aviso: z.string().default(''),
  perguntasProfessor: z
    .array(
      z.object({
        id: z.string(),
        pergunta: z.string(),
        respondida: z.boolean(),
        resposta: z.string().optional(),
      })
    )
    .optional(),
});

export const ProgramaTopicoSchema = z.object({
  ordem: z.number(),
  titulo: z.string(),
  subtopicos: z.string().optional(),
});

export const ProgramaSchema = z.object({
  componente: z.string(),
  ementa: z.string(),
  bibliografia: z.string(),
  topicos: z.array(ProgramaTopicoSchema),
});

export const PerfilSchema = z.object({
  curso: z.string(),
  curriculo: z.string(),
  ingresso: z.string(),
  periodoAtual: z.string(),
  prazoMinimo: z.string(),
  prazoMaximo: z.string(),
  nome: z.string().optional(),
  matricula: z.string().optional(),
  chExigida: z.object({
    obrigatorias: z.number(),
    eletivasPerfil: z.number(),
    eletivasLivres: z.number(),
    complementares: z.number(),
    total: z.number(),
  }),
  parametrosIndices: z.object({
    mu: z.number(),
    sigma: z.number(),
    chm: z.number(),
    pm: z.number().nullable(),
    p: z.number().nullable(),
    chEsperada: z.number().optional().nullable(),
    percentualManual: z.number().optional().nullable(),
  }),
});

export const HorarioAulaSchema = z.object({
  id: z.string(),
  tentativaId: z.string(),
  codigo: z.string(),
  diaSemana: z.number().min(0).max(6),
  horarioInicio: z.string(),
  horarioFim: z.string(),
  sala: z.string().optional(),
});

export const RegistroPresencaSchema = z.object({
  id: z.string(),
  tentativaId: z.string(),
  data: z.string(),
  presente: z.boolean(),
  quantidade: z.number().default(2),
});

export const LembreteCalendarioSchema = z.object({
  id: z.string(),
  titulo: z.string(),
  data: z.string(),
  horario: z.string().optional(),
  tipo: z.enum(['prova', 'trabalho', 'matricula', 'trancamento', 'academico']),
  disciplinaCodigo: z.string().optional(),
  descricao: z.string().optional(),
});

export const ItemCadernoErroSchema = z.object({
  id: z.string(),
  tentativaId: z.string(),
  avaliacaoId: z.string().optional(),
  topicoId: z.string().optional(),
  tituloQuestao: z.string(),
  oQueErrou: z.string(),
  oQueRevisar: z.string(),
  anexoNome: z.string().optional(),
  anexoUrl: z.string().optional(),
  resolvido: z.boolean().default(false),
  dataRegistro: z.string(),
});

export const ItemLeituraSchema = z.object({
  id: z.string(),
  tentativaId: z.string(),
  codigoDisciplina: z.string(),
  titulo: z.string(),
  autor: z.string(),
  tipo: z.enum(['obrigatoria', 'complementar']),
  status: z.enum(['fila', 'lendo', 'concluido']),
  paginasLidas: z.number().default(0),
  totalPaginas: z.number().default(100),
  fichamento: z.string().default(''),
  dataUltimaLeitura: z.string().optional(),
});

export const FavoritoTopicoSchema = z.object({
  id: z.string(),
  topicoId: z.string(),
  tentativaId: z.string(),
  titulo: z.string(),
  tipo: z.enum(['sumula', 'julgado', 'artigo', 'lei']),
  referencia: z.string().optional(),
  url: z.string().optional(),
  anotacoes: z.string().optional(),
});

export const MetaSemanalSchema = z.object({
  metaTopicos: z.number().default(5),
});

export const EstadoCompletoSchema = z.object({
  schemaVersion: z.number(),
  perfil: PerfilSchema,
  componentes: z.array(ComponenteSchema),
  tentativas: z.array(TentativaSchema),
  avaliacoes: z.array(AvaliacaoSchema).default([]),
  faltas: z.array(FaltaSchema).default([]),
  planoSemestres: z.array(PlanoSemestreSchema).default([]),
  cenarios: z.array(CenarioSchema).default([]),
  complementares: z.array(ComplementarSchema).default([]),
  estagios: z.array(EstagioSchema).default([]),
  tcc: TccSchema,
  enade: EnadeSchema,
  eletivasCursadas: z.array(EletivaCursadaSchema).default([]),
  guias: z.array(GuiaSchema).default([]),
  topicos: z.array(TopicoSchema).default([]),
  programas: z.array(ProgramaSchema).default([]),
  horariosAulas: z.array(HorarioAulaSchema).default([]),
  registrosPresenca: z.array(RegistroPresencaSchema).default([]),
  lembretesCalendario: z.array(LembreteCalendarioSchema).default([]),
  cadernoErros: z.array(ItemCadernoErroSchema).default([]),
  leituras: z.array(ItemLeituraSchema).default([]),
  favoritosTopicos: z.array(FavoritoTopicoSchema).default([]),
  metaSemanal: MetaSemanalSchema.default({ metaTopicos: 5 }),
});
