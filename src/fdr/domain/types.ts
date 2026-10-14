export type Situacao =
  | 'APR'
  | 'APRN'
  | 'REP'
  | 'REPN'
  | 'REPF'
  | 'REPMF'
  | 'REPNF'
  | 'MATR'
  | 'TRANC'
  | 'CANC'
  | 'DISP'
  | 'INCORP'
  | 'CUMP';

export type StatusGrade = 'APROVADA' | 'CURSANDO' | 'REPROVADA' | 'PENDENTE';

export type TipoComponente = 'OBRIG' | 'ELETIVO';

export interface Componente {
  codigo: string;
  nome: string;
  ch: number;
  periodo: number | null;
  tipo: TipoComponente;
  preReq: string[];
  coReq: string[];
  chMin: number;
  ementa?: string;
  bibliografia?: string;
}

export interface Tentativa {
  id: string;
  codigo: string;
  semestre: string; // formato 'AAAA.S' ex: '2026.1'
  nota: number | null;
  freq: number | null;
  situacao: Situacao;
}

export interface EletivaPlanejada {
  id: string;
  nome: string;
  ch: number;
  categoria: 'perfil' | 'livre';
}

export interface PlanoSemestre {
  semestre: string;
  codigos: string[];
  eletivas: EletivaPlanejada[];
}

export interface Avaliacao {
  id: string;
  tentativaId: string;
  nome: string;
  data: string | null;
  peso: number;
  nota: number | null;
}

export interface Falta {
  id: string;
  tentativaId: string;
  data: string;
  quantidade: number;
}

export interface Cenario {
  id: string;
  nome: string;
  notas: Record<string, number>;
  dataCriacao?: string;
}

export type TipoComplementar = 'monitoria' | 'extensao' | 'pesquisa' | 'evento' | 'outro';

export interface Complementar {
  id: string;
  tipo: TipoComplementar;
  descricao: string;
  horas: number;
  data: string;
  comprovante: string;
}

export interface Estagio {
  codigo: string; // 'INT0065' (Estágio 1) ou 'INT0066' (Estágio 2)
  local: string;
  supervisor: string;
  horasCumpridas: number;
  inicio?: string;
  fim?: string;
}

export type StatusEtapaTcc = 'pendente' | 'em_andamento' | 'concluida';

export interface TccEtapa {
  codigo: string; // 'INT0067' (Proj), 'INT0068' (TCC1), 'INT0069' (TCC2), 'INT0072' (TCC3)
  status: StatusEtapaTcc;
  prazo: string | null;
  nota?: number | null;
  tituloVersao?: string;
}

export interface Tcc {
  orientador: string;
  tema: string;
  etapas: TccEtapa[];
}

export interface Enade {
  ingressante: boolean;
  concluinte: boolean;
  ingressanteEm?: string;
  concluinteEm?: string;
}

export interface EletivaCursada {
  id: string;
  codigo?: string;
  nome: string;
  ch: number;
  categoria: 'perfil' | 'livre';
  semestre?: string;
  nota?: number | null;
}

export type OrigemTopico = 'programa' | 'professor' | 'propria';

export interface Topico {
  id: string;
  tentativaId: string;
  ordem: number;
  titulo: string;
  subtopicos?: string;
  origem: OrigemTopico;
  concluido: boolean;
  concluidoEm?: string;
  nota?: string;
  avaliacaoIds: string[];
}

export interface Guia {
  tentativaId: string;
  ementa: string;
  bibliografia: string;
  observacoes: string;
  aviso: string;
  perguntasProfessor?: PerguntaProfessor[];
}

export interface PerguntaProfessor {
  id: string;
  pergunta: string;
  respondida: boolean;
  resposta?: string;
}

export interface ProgramaTopico {
  ordem: number;
  titulo: string;
  subtopicos?: string;
}

export interface Programa {
  componente: string;
  ementa: string;
  bibliografia: string;
  topicos: ProgramaTopico[];
}

export interface Perfil {
  curso: string;
  curriculo: string;
  ingresso: string;
  periodoAtual: string;
  prazoMinimo: string;
  prazoMaximo: string;
  nome?: string;
  matricula?: string;
  chExigida: {
    obrigatorias: number;
    eletivasPerfil: number;
    eletivasLivres: number;
    complementares: number;
    total: number;
  };
  parametrosIndices: {
    mu: number;
    sigma: number;
    chm: number;
    pm: number | null;
    p: number | null;
    chEsperada?: number | null;
    percentualManual?: number | null;
  };
}

export interface HorarioAula {
  id: string;
  tentativaId: string;
  codigo: string;
  diaSemana: number; // 0 = Domingo, 1 = Segunda, 2 = Terça, 3 = Quarta, 4 = Quinta, 5 = Sexta, 6 = Sábado
  horarioInicio: string;
  horarioFim: string;
  sala?: string;
}

export interface RegistroPresenca {
  id: string;
  tentativaId: string;
  data: string; // 'AAAA-MM-DD'
  presente: boolean;
  quantidade: number; // número de horas-aula (geralmente 2h)
}

export interface LembreteCalendario {
  id: string;
  titulo: string;
  data: string; // 'AAAA-MM-DD'
  horario?: string;
  tipo: 'prova' | 'trabalho' | 'matricula' | 'trancamento' | 'academico';
  disciplinaCodigo?: string;
  descricao?: string;
}

export interface ItemCadernoErro {
  id: string;
  tentativaId: string;
  avaliacaoId?: string;
  topicoId?: string;
  tituloQuestao: string;
  oQueErrou: string;
  oQueRevisar: string;
  anexoNome?: string;
  anexoUrl?: string; // base64 ou dataURL da foto/PDF da prova
  resolvido: boolean;
  dataRegistro: string;
}

export interface ItemLeitura {
  id: string;
  tentativaId: string;
  codigoDisciplina: string;
  titulo: string;
  autor: string;
  tipo: 'obrigatoria' | 'complementar';
  status: 'fila' | 'lendo' | 'concluido';
  paginasLidas: number;
  totalPaginas: number;
  fichamento: string;
  dataUltimaLeitura?: string;
}

export interface FavoritoTopico {
  id: string;
  topicoId: string;
  tentativaId: string;
  titulo: string;
  tipo: 'sumula' | 'julgado' | 'artigo' | 'lei';
  referencia?: string;
  url?: string;
  anotacoes?: string;
}

export interface MetaSemanal {
  metaTopicos: number;
}

export interface Estado {
  schemaVersion: number;
  perfil: Perfil;
  componentes: Componente[];
  tentativas: Tentativa[];
  avaliacoes: Avaliacao[];
  faltas: Falta[];
  planoSemestres: PlanoSemestre[];
  cenarios: Cenario[];
  complementares: Complementar[];
  estagios: Estagio[];
  tcc: Tcc;
  enade: Enade;
  eletivasCursadas: EletivaCursada[];
  guias: Guia[];
  topicos: Topico[];
  programas: Programa[];
  horariosAulas?: HorarioAula[];
  registrosPresenca?: RegistroPresenca[];
  lembretesCalendario?: LembreteCalendario[];
  cadernoErros?: ItemCadernoErro[];
  leituras?: ItemLeitura[];
  favoritosTopicos?: FavoritoTopico[];
  metaSemanal?: MetaSemanal;
}
