import { Estado } from '../domain/types';
import { criarEstadoInicial } from './initialState';

export const SCHEMA_VERSION_ATUAL = 1;

export function migrarEstado(dadosBrutos: any): Estado {
  if (!dadosBrutos || typeof dadosBrutos !== 'object') {
    return criarEstadoInicial();
  }

  let estado = { ...dadosBrutos };
  const versao = estado.schemaVersion || 0;

  if (versao === 0) {
    estado.schemaVersion = 1;
    if (!estado.guias) estado.guias = [];
    if (!estado.topicos) estado.topicos = [];
    if (!estado.programas) estado.programas = [];
    if (!estado.eletivasCursadas) estado.eletivasCursadas = [];
    if (!estado.planoSemestres) estado.planoSemestres = [];
  }

  const padrao = criarEstadoInicial();
  // Only seed the sample timetable once; an empty list means the student removed every class
  if (!estado.horariosAulas) estado.horariosAulas = padrao.horariosAulas || [];
  if (!estado.registrosPresenca) estado.registrosPresenca = padrao.registrosPresenca || [];
  if (!estado.lembretesCalendario || estado.lembretesCalendario.length === 0) estado.lembretesCalendario = padrao.lembretesCalendario || [];
  if (!estado.cadernoErros) estado.cadernoErros = padrao.cadernoErros || [];
  if (!estado.leituras || estado.leituras.length === 0) estado.leituras = padrao.leituras || [];
  if (!estado.favoritosTopicos || estado.favoritosTopicos.length === 0) estado.favoritosTopicos = padrao.favoritosTopicos || [];
  if (!estado.metaSemanal) estado.metaSemanal = padrao.metaSemanal || { metaTopicos: 5 };

  return estado as Estado;
}
