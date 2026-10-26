export type NavigationTab = 
  | 'cockpit'
  | 'fdr'
  | 'lds'
  | 'calendario'
  | 'financeiro'
  | 'livros'
  | 'rotina';

export interface PriorityItem {
  id: string;
  text: string;
  completed: boolean;
  category: 'executivo' | 'academico' | 'pessoal' | 'espiritual';
}

export type EventCategory = 
  | 'estagio'        // #0d9488 (Projetos / Atividades)
  | 'lds'            // #8b1538 (Bordô/Vinho)
  | 'fdr'            // #625d66 (Azul/Marinho suave)
  | 'descanso'       // #c89d56 (Dourado/Champagne)
  | 'espiritualidade'
  | 'pessoal';       // #c9a3ae (Rosa seco)

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  location?: string;
  category: EventCategory;
  description?: string;
  completed?: boolean;
}

export type ProposalStage = 'diagnostico' | 'proposta' | 'negociacao' | 'fechado';
export type ServiceTag = 'Registro de Marca (INPI)' | 'Acordo de Sócios' | 'Consultoria Preventiva';

export interface CommercialProposal {
  id: string;
  clientName: string;
  companyName?: string;
  serviceTag: ServiceTag;
  stage: ProposalStage;
  value: number; // R$
  leadContact: string;
  responsibleMember: string;
  nextStep: string;
  updatedAt: string;
}

export interface DelegationInboxItem {
  id: string;
  text: string;
  suggestedLeader: 'Aline Alves' | 'Lucas Almeida' | 'Tereza Araújo' | 'Luiza Goldstein' | 'A definir';
  completed: boolean;
  createdAt: string;
  notes?: string;
}

export interface AssessorItem {
  id: string;
  name: string;
  area: 'marketing' | 'ares' | 'atena';
  manager: 'Luiza Goldstein' | 'Lucas Almeida' | 'Tereza Araújo';
  oneOnOneWithAlineDone: boolean;
  notes?: string;
}

export interface TeamOneOnOne {
  id: string;
  memberName: string;
  role: string;
  lastDate: string;
  nextDate: string;
  keyTopics: string[];
  notes?: string;
}

export interface DelegatedTask {
  id: string;
  title: string;
  assignee: 'Aline Alves' | 'Lucas Almeida' | 'Tereza Araújo' | 'Luiza Goldstein' | string;
  area?: 'Coordenação' | 'Comercial Ares' | 'Comercial Atena' | 'Marketing';
  deadline: string;
  status: 'a_fazer' | 'em_andamento' | 'revisao' | 'concluido';
  priority: 'alta' | 'media' | 'normal';
  notes?: string;
}

export interface PendingAgenda {
  id: string;
  title: string;
  category: 'comercial' | 'diretoria' | 'rh';
  done: boolean;
}

export interface FDRSubject {
  id: string;
  name: string;
  code: string;
  professor: string;
  bookBase?: string;
  syllabusTopics?: string[];
  complementaryBiblio?: string[];
  exams: {
    id: string;
    title: string;
    date: string;
    weight?: string;
    grade?: string;
    completed: boolean;
  }[];
  assignments: {
    id: string;
    title: string;
    deadline: string;
    completed: boolean;
  }[];
  fichamentos: {
    id: string;
    title: string;
    deadline: string;
    completed: boolean;
  }[];
  color: string;
}

export interface LDSSession {
  id: string;
  date: string; // DD/MM
  fullDate: string; // YYYY-MM-DD
  topic: string;
  materialsUrl?: string;
  status: 'concluida' | 'destaque' | 'espera';
  time: string;
  readingDone?: boolean;
  location?: string;
  readingRequirements?: string;
  notes?: string;
}

// Formação e Estudo Doutrinário (Vem, e Segue-Me & Escrituras)
export interface PersonalDoctrineTopic {
  id: string;
  theme?: string;
  title?: string;
  description?: string;
  date: string;
  completed: boolean;
  notes?: string;
}

// Backwards-compatible alias
export type PersonalCatechesisTopic = PersonalDoctrineTopic;

export interface PersonalCatechesisState {
  sacramentsAim: string;
  parish: string;
  celebrationDate: string;
  scheduleNote?: string;
  catechistName?: string;
  sponsorChosen?: string;
  confirmationSaint?: string;
  confessionDone?: boolean;
  modules: PersonalDoctrineTopic[];
  studyNotes: string;
}

export interface HabitItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  completed: boolean;
  streak: number;
}

export interface WorkoutDay {
  musculacao: boolean;
  cardio?: boolean;
  alongamento?: boolean;
  futebol?: boolean;
  volei?: boolean;
  notes?: string;
}

export interface SpiritualityState {
  mass: {
    dayTime: string;
    parish: string;
    gospelNotes: string;
    intentions: string[];
  };
  catechesis: PersonalCatechesisState;
  rosary: {
    currentStreak: number;
    lastCompletedDate: string;
    selectedMysteryType?: 'gozosos' | 'dolorosos' | 'gloriosos' | 'luminosos';
    mysteriesChecked?: boolean[];
    intentions: string[];
  };
}

// Saúde, Consultas, Exames e TDAH (Venvanse)
export interface HealthAppointment {
  id: string;
  specialty: string;
  doctorName: string;
  clinic: string;
  date: string;
  time: string;
  status: 'agendada' | 'realizada' | 'cancelada';
  notes?: string;
  prescriptionSummary?: string;
}

export interface HealthExam {
  id: string;
  name: string;
  title?: string;
  category?: string;
  laboratory: string;
  date: string;
  status: 'solicitado' | 'agendado' | 'realizado' | 'concluido' | 'resultado_disponivel';
  resultValue?: string;
  referenceRange?: string;
  interpretation?: 'normal' | 'otimo' | 'atencao' | 'baixo' | 'elevado';
  resultNotes?: string;
  doctorName?: string;
  orderNumber?: string;
}

export interface AdhdTreatment {
  medication: string;
  dosage: string;
  frequency: string;
  currentPillsRemaining: number;
  pillsTotalBottle: number;
  lastPrescriptionDate: string;
  prescriptionType: string;
  psychiatristName: string;
  nextPrescriptionRenewalDue: string;
  dailyLogTakenToday: boolean;
  takenTimeToday?: string;
  focusLevelToday?: 'ótimo' | 'bom' | 'regular' | 'baixo';
  notes?: string;
}

export interface HealthState {
  appointments: HealthAppointment[];
  exams: HealthExam[];
  adhd: AdhdTreatment;
}

// Gestão Financeira Pessoal (Estágio R$ 1.100 + Pai R$ 150/semana)
export type FinancialCategory = 
  | 'estagio' 
  | 'mesada_pai' 
  | 'saude_medicamentos' 
  | 'alimentacao' 
  | 'transporte' 
  | 'estudos_livros' 
  | 'lazer_pessoal' 
  | 'projetos_pessoais'
  | 'software_ia'
  | 'outros';

export type TransactionCategory = FinancialCategory | string;

export interface FinancialTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod?: 'pix' | 'cartao' | 'dinheiro' | 'ted' | 'transferencia' | string;
  notes?: string;
}

// Horários de Dormir/Acordar & Contagem de Sono
export interface SleepLogDay {
  id: string;
  dayName: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  totalHours: number;
  quality: 'restaurador' | 'bom' | 'regular' | 'insuficiente';
  notes?: string;
}

// Livros Lidos & Em Leitura (2026)
export type BookCategory = 'Direito' | 'Literatura' | 'Espiritualidade' | 'Desenvolvimento' | 'Outro';
export type BookStatus = 'lido' | 'lendo' | 'na_fila';

export interface BookItem {
  id: string;
  title: string;
  author: string;
  category: BookCategory;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  rating?: number; // 1-5
  startDate?: string;
  finishDate?: string;
  favoriteQuote?: string;
  notes?: string;
}
