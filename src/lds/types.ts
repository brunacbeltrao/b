/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DocumentType =
  | 'Norma'
  | 'Doutrina'
  | 'Jurisprudência'
  | 'Parecer CVM'
  | 'Artigo'
  | 'Slide'
  | 'Material de Aula'
  | 'Link Útil';

export interface LegalDevice {
  lawTag: string; // e.g. "LEI 6.404/76" or "CÓDIGO CIVIL"
  article: string; // e.g. "Art. 5º"
  text: string;
  sourceName: string; // e.g. "Lei das Sociedades por Ações" or "Lei 10.406/2002"
  commentary?: string;
}

export interface DoctrineQuote {
  quote: string;
  author: string;
  work: string;
  year?: string;
  note?: string;
}

export interface ComparisonRow {
  criterion: string;
  left: string;
  right: string;
}

export interface ComparisonTable {
  title: string;
  leftHeader: string;
  rightHeader: string;
  rows: ComparisonRow[];
}

export interface LessonMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'slide' | 'doc' | 'link';
  size?: string;
  url?: string;
  addedAt: string;
  notes?: string;
}

export interface LessonLink {
  id: string;
  title: string;
  url: string;
  category?: 'Legislação' | 'Jurisprudência CVM/STJ' | 'Artigo / Doutrina' | 'Slides / Apresentação' | 'Geral';
  description?: string;
}

export interface BibliographyItem {
  id: string;
  author: string;
  title: string;
  work?: string;
  pages?: string;
  link?: string;
  required?: boolean; // Leitura obrigatória vs complementar
}

export interface Lesson {
  id: number;
  lessonNumber: number;
  dateStr: string; // e.g. "12/08", "19/08"
  fullDate: string; // e.g. "19 de agosto de 2026"
  title: string;
  subtitle?: string;
  duration: string; // e.g. "60 minutos"
  phase: 'Direito Societário Básico' | 'Mercado de Capitais' | 'Reorganizações & Prática';
  instructorName?: string;
  instructorRole?: string;
  actualProfessor?: string; // Professor que efetivamente ministrou a aula
  actualProfessorRole?: string;
  status: 'completed' | 'current' | 'upcoming';
  slidesUrl?: string; // Link direto para slides (Google Slides, Canva, Drive)
  slidesTitle?: string;
  materials: LessonMaterial[];
  links?: LessonLink[];
  bibliographyItems?: BibliographyItem[];
  personalNotes?: string;
  keyPoints: string[];
  legislation: LegalDevice[];
  doctrineQuotes: DoctrineQuote[];
  comparisonTable?: ComparisonTable;
  overviewText: string;
  practicalCases?: string;
  recommendedBibliography: string[];
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  category: 'diretoria' | 'orientador' | 'conselho_advogados' | 'conselho_admin' | 'convidado';
  bio: string;
  contact?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  lessonNumber: number;
  source: string;
  summary: string;
  content: string;
  dateAdded: string;
  tags: string[];
  fileUrl?: string;
  isLessonAttachment?: boolean;
}

export interface GeneratedApostila {
  id: string;
  lessonNumber: number;
  lessonTitle: string;
  lessonDate: string;
  generatedAt: string;
  eyebrow: string;
  introduction: string;
  keyPoints: string[];
  legislation: LegalDevice[];
  doctrineQuotes: DoctrineQuote[];
  comparisonTable?: ComparisonTable;
  detailedAnalysis: string;
  jurisprudenceCase?: {
    title: string;
    courtOrAgency: string; // e.g. "CVM Colegiado" or "STJ - Terceira Turma"
    caseNumber: string;
    summary: string;
  };
  conclusion: string;
  footerReference: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  lessonNumber?: number;
  lessonReferenced?: number;
  apostilaData?: GeneratedApostila;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  latinOrEnglish?: string;
  category: 'Societário Básico' | 'Mercado de Capitais' | 'M&A & Reorganizações' | 'Governança & Fiduciário' | 'Processual & Conflitos';
  definition: string;
  legalBasis?: string;
  lessonNumber: number; // Aula onde o conceito é abordado
  practicalExample?: string;
  tags: string[];
}
