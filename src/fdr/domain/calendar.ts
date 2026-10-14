import { LembreteCalendario } from './types';

export function gerarArquivoIcs(lembretes: LembreteCalendario[]): string {
  const agora = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0] + 'Z';

  const linhas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Direito UFPE//Acompanhamento Graduacao//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Direito UFPE - Calendário Acadêmico',
    'X-WR-TIMEZONE:America/Recife',
  ];

  for (const lembrete of lembretes) {
    if (!lembrete.data) continue;
    const dataLimpa = lembrete.data.replace(/-/g, '');
    const horario = lembrete.horario || '18:40';
    const [hh, mm] = horario.split(':');
    const horaFormatada = (hh || '18').padStart(2, '0') + (mm || '40').padStart(2, '0') + '00';
    const dtstart = `${dataLimpa}T${horaFormatada}`;
    const horaFim = (Math.min(23, parseInt(hh || '18', 10) + 2)).toString().padStart(2, '0') + (mm || '40').padStart(2, '0') + '00';
    const dtend = `${dataLimpa}T${horaFim}`;

    linhas.push('BEGIN:VEVENT');
    linhas.push(`UID:fdr-${lembrete.id}@direito-ufpe`);
    linhas.push(`DTSTAMP:${agora}`);
    linhas.push(`DTSTART:${dtstart}`);
    linhas.push(`DTEND:${dtend}`);
    linhas.push(`SUMMARY:${sanitizarTextoIcs(lembrete.titulo)}`);
    if (lembrete.descricao) {
      linhas.push(`DESCRIPTION:${sanitizarTextoIcs(lembrete.descricao)}`);
    }
    linhas.push('LOCATION:Faculdade de Direito do Recife (FDR / UFPE)');
    linhas.push('STATUS:CONFIRMED');
    linhas.push('END:VEVENT');
  }

  linhas.push('END:VCALENDAR');
  return linhas.join('\r\n');
}

function sanitizarTextoIcs(texto: string): string {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function exportarIcsParaDownload(
  lembretes: LembreteCalendario[],
  nomeArquivo: string = 'direito_ufpe_calendario.ics'
): void {
  const conteudoIcs = gerarArquivoIcs(lembretes);
  const blob = new Blob([conteudoIcs], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', nomeArquivo);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
