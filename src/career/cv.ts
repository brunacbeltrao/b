// Living CV: entries are stored as 'cv' records; versions are assembled on demand.
import type { BaseRecord } from '../records/useRecords';

export type CvType =
  | 'cargo'
  | 'estagio'
  | 'monitoria'
  | 'evento'
  | 'competicao'
  | 'artigo'
  | 'curso'
  | 'premio'
  | 'voluntariado'
  | 'idioma';

export interface CvEntry extends BaseRecord {
  kind: 'cv';
  date: string; // start (YYYY-MM-DD or YYYY-MM-01)
  endDate?: string; // empty = ongoing
  type: CvType;
  title: string;
  org?: string;
  description?: string;
  results?: string; // one quantified result per line
  titleEn?: string;
  descriptionEn?: string;
  resultsEn?: string;
  link?: string;
  featured?: boolean;
}

export const CV_TYPES: { id: CvType; label: string; en: string; section: string; sectionEn: string }[] = [
  { id: 'cargo', label: 'Cargo', en: 'Position', section: 'Experiência', sectionEn: 'Experience' },
  { id: 'estagio', label: 'Estágio', en: 'Internship', section: 'Experiência', sectionEn: 'Experience' },
  { id: 'monitoria', label: 'Monitoria', en: 'Teaching assistant', section: 'Experiência acadêmica', sectionEn: 'Academic experience' },
  { id: 'evento', label: 'Evento organizado', en: 'Event', section: 'Liderança e eventos', sectionEn: 'Leadership and events' },
  { id: 'competicao', label: 'Competição', en: 'Competition', section: 'Competições e prêmios', sectionEn: 'Competitions and awards' },
  { id: 'premio', label: 'Prêmio', en: 'Award', section: 'Competições e prêmios', sectionEn: 'Competitions and awards' },
  { id: 'artigo', label: 'Artigo ou publicação', en: 'Publication', section: 'Publicações', sectionEn: 'Publications' },
  { id: 'curso', label: 'Curso', en: 'Course', section: 'Formação complementar', sectionEn: 'Additional education' },
  { id: 'voluntariado', label: 'Voluntariado', en: 'Volunteering', section: 'Voluntariado', sectionEn: 'Volunteering' },
  { id: 'idioma', label: 'Idioma', en: 'Language', section: 'Idiomas', sectionEn: 'Languages' },
];

export const typeOf = (t: CvType) => CV_TYPES.find((x) => x.id === t)!;

export type CvFormat = 'cv' | 'perfil' | 'candidatura';
export type CvLang = 'pt' | 'en';

const MONTHS_PT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function period(e: CvEntry, lang: CvLang) {
  const fmt = (iso?: string) => {
    if (!iso) return '';
    const [y, m] = iso.split('-').map(Number);
    return `${(lang === 'en' ? MONTHS_EN : MONTHS_PT)[m - 1]} ${y}`;
  };
  const start = fmt(e.date);
  if (e.type === 'artigo' || e.type === 'premio' || e.type === 'competicao' || e.type === 'curso') return start;
  return `${start} – ${e.endDate ? fmt(e.endDate) : lang === 'en' ? 'present' : 'atual'}`;
}

const lines = (text?: string) =>
  (text || '')
    .split('\n')
    .map((l) => l.replace(/^[-•\s]+/, '').trim())
    .filter(Boolean);

/** Plain-text version assembled without AI, used when Gemini isn't configured. */
export function assembleCv(entries: CvEntry[], format: CvFormat, lang: CvLang, focus: string): string {
  const en = lang === 'en';
  const pick = (pt?: string, eng?: string) => (en ? eng || pt : pt) || '';
  const sorted = [...entries].sort((a, b) => (b.endDate || '9999').localeCompare(a.endDate || '9999') || b.date.localeCompare(a.date));
  const header = en
    ? 'BRUNA BELTRÃO\nLaw student · Faculdade de Direito do Recife (UFPE)'
    : 'BRUNA BELTRÃO\nEstudante de Direito · Faculdade de Direito do Recife (UFPE)';

  if (format === 'cv') {
    const sections = new Map<string, CvEntry[]>();
    for (const e of sorted) {
      const key = en ? typeOf(e.type).sectionEn : typeOf(e.type).section;
      sections.set(key, [...(sections.get(key) || []), e]);
    }
    const body = [...sections.entries()]
      .map(([title, items]) => {
        const rows = items.map((e) => {
          const head = [pick(e.title, e.titleEn), e.org].filter(Boolean).join(' — ');
          const desc = pick(e.description, e.descriptionEn);
          const res = lines(pick(e.results, e.resultsEn)).map((r) => `  • ${r}`);
          return [`${head} (${period(e, lang)})`, desc && `  ${desc}`, ...res].filter(Boolean).join('\n');
        });
        return `${title.toUpperCase()}\n${rows.join('\n\n')}`;
      })
      .join('\n\n');
    return `${header}\n\n${body}`;
  }

  const highlights = sorted.filter((e) => e.featured).concat(sorted.filter((e) => !e.featured)).slice(0, 4);
  const roles = [
    ...new Set(
      highlights.map((e) => {
        const title = pick(e.title, e.titleEn);
        return e.org ? `${title} (${e.org})` : title;
      }),
    ),
  ];
  const results = [...new Set(highlights.flatMap((e) => lines(pick(e.results, e.resultsEn))))].slice(0, 3);

  if (format === 'perfil') {
    return en
      ? `Law student at the Faculdade de Direito do Recife (UFPE). ${roles.length ? `Experience as ${roles.join('; ')}.` : ''} ${
          results.length ? `Highlights: ${results.join('; ')}.` : ''
        }${focus ? ` Currently focused on ${focus}.` : ''}`.trim()
      : `Estudante de Direito na Faculdade de Direito do Recife (UFPE). ${roles.length ? `Experiência como ${roles.join('; ')}.` : ''} ${
          results.length ? `Destaques: ${results.join('; ')}.` : ''
        }${focus ? ` Hoje com foco em ${focus}.` : ''}`.trim();
  }

  return en
    ? `Dear hiring team,\n\nI am a law student at the Faculdade de Direito do Recife (UFPE) and I would like to apply${
        focus ? ` for ${focus}` : ''
      }. ${roles.length ? `My recent experience includes ${roles.join('; ')}.` : ''}\n\n${
        results.length ? `Some results I am proud of: ${results.join('; ')}.\n\n` : ''
      }I would welcome the chance to talk about how I can contribute.\n\nKind regards,\nBruna Beltrão`
    : `Prezada equipe,\n\nSou estudante de Direito na Faculdade de Direito do Recife (UFPE) e gostaria de me candidatar${
        focus ? ` a ${focus}` : ''
      }. ${roles.length ? `Minha experiência recente inclui ${roles.join('; ')}.` : ''}\n\n${
        results.length ? `Alguns resultados de que me orgulho: ${results.join('; ')}.\n\n` : ''
      }Fico à disposição para conversar sobre como posso contribuir.\n\nAtenciosamente,\nBruna Beltrão`;
}
