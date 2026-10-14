import { StatusGrade, Tentativa } from './types';

export function ordemSemestre(semestre: string): number {
  if (!semestre || typeof semestre !== 'string') return 0;
  const partes = semestre.trim().split('.');
  const ano = parseInt(partes[0], 10) || 0;
  const per = parseInt(partes[1], 10) || 1;
  return ano * 2 + per;
}

export function compararSemestres(a: string, b: string): number {
  return ordemSemestre(a) - ordemSemestre(b);
}

export function proximoSemestre(semestre: string): string {
  const partes = semestre.trim().split('.');
  const ano = parseInt(partes[0], 10);
  const per = parseInt(partes[1], 10);
  if (per === 1) {
    return `${ano}.2`;
  }
  return `${ano + 1}.1`;
}

export function gerarSemestresSequenciais(inicio: string, quantidade: number): string[] {
  const lista: string[] = [inicio];
  let atual = inicio;
  for (let i = 1; i < quantidade; i++) {
    atual = proximoSemestre(atual);
    lista.push(atual);
  }
  return lista;
}

export function statusDaDisciplina(codigo: string, tentativas: Tentativa[]): StatusGrade {
  const t = tentativas
    .filter((x) => x.codigo === codigo)
    .sort((a, b) => ordemSemestre(a.semestre) - ordemSemestre(b.semestre));

  if (t.some((x) => x.situacao === 'APR' || x.situacao === 'APRN')) {
    return 'APROVADA';
  }

  const ultima = t[t.length - 1];
  if (!ultima) return 'PENDENTE';
  if (ultima.situacao === 'MATR') return 'CURSANDO';
  return 'REPROVADA';
}
