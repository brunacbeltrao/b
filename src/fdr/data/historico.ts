import { Tentativa } from '../domain/types';

export const HISTORICO_INICIAL: Tentativa[] = [
  // 2024.2 (1º período cursado)
  { id: 't-2024.2-CS004', codigo: 'CS004', semestre: '2024.2', nota: 7.3, freq: 100, situacao: 'APR' },
  { id: 't-2024.2-EC001', codigo: 'EC001', semestre: '2024.2', nota: 7.5, freq: 100, situacao: 'APR' },
  { id: 't-2024.2-FL003', codigo: 'FL003', semestre: '2024.2', nota: 9.8, freq: 100, situacao: 'APR' },
  { id: 't-2024.2-PG516', codigo: 'PG516', semestre: '2024.2', nota: 10.0, freq: 100, situacao: 'APR' },
  { id: 't-2024.2-PR428', codigo: 'PR428', semestre: '2024.2', nota: 9.5, freq: 100, situacao: 'APR' },

  // 2025.1 (2º período cursado)
  { id: 't-2025.1-PE464', codigo: 'PE464', semestre: '2025.1', nota: 8.0, freq: 100, situacao: 'APR' },
  { id: 't-2025.1-PG517', codigo: 'PG517', semestre: '2025.1', nota: 9.0, freq: 100, situacao: 'APR' },
  { id: 't-2025.1-PG518', codigo: 'PG518', semestre: '2025.1', nota: 7.5, freq: 100, situacao: 'APR' },
  { id: 't-2025.1-PR429', codigo: 'PR429', semestre: '2025.1', nota: 10.0, freq: 100, situacao: 'APR' },
  { id: 't-2025.1-PR430', codigo: 'PR430', semestre: '2025.1', nota: 6.1, freq: 100, situacao: 'APRN' },
  { id: 't-2025.1-PR464', codigo: 'PR464', semestre: '2025.1', nota: 8.5, freq: 100, situacao: 'APR' },

  // 2025.2 (3º período cursado)
  { id: 't-2025.2-PE465', codigo: 'PE465', semestre: '2025.2', nota: 5.8, freq: 100, situacao: 'APRN' },
  { id: 't-2025.2-PG519', codigo: 'PG519', semestre: '2025.2', nota: 9.1, freq: 100, situacao: 'APR' },
  { id: 't-2025.2-PG524', codigo: 'PG524', semestre: '2025.2', nota: 7.5, freq: 100, situacao: 'APR' },
  { id: 't-2025.2-PR431', codigo: 'PR431', semestre: '2025.2', nota: 8.5, freq: 100, situacao: 'APR' },
  { id: 't-2025.2-PR436', codigo: 'PR436', semestre: '2025.2', nota: 9.0, freq: 100, situacao: 'APR' },
  { id: 't-2025.2-PR438', codigo: 'PR438', semestre: '2025.2', nota: 8.0, freq: 100, situacao: 'APR' },

  // 2026.1 (4º período cursado)
  { id: 't-2026.1-AM131', codigo: 'AM131', semestre: '2026.1', nota: 9.0, freq: 100, situacao: 'APR' },
  { id: 't-2026.1-PE466', codigo: 'PE466', semestre: '2026.1', nota: 9.0, freq: 100, situacao: 'APR' },
  { id: 't-2026.1-PE467', codigo: 'PE467', semestre: '2026.1', nota: 7.0, freq: 100, situacao: 'APR' },
  { id: 't-2026.1-PG520', codigo: 'PG520', semestre: '2026.1', nota: 1.5, freq: 100, situacao: 'REP' },
  { id: 't-2026.1-PG525', codigo: 'PG525', semestre: '2026.1', nota: 3.5, freq: 100, situacao: 'REPN' },
  { id: 't-2026.1-PR432', codigo: 'PR432', semestre: '2026.1', nota: 8.5, freq: 100, situacao: 'APR' },
  { id: 't-2026.1-PR437', codigo: 'PR437', semestre: '2026.1', nota: 9.5, freq: 100, situacao: 'APR' },
  { id: 't-2026.1-PR439', codigo: 'PR439', semestre: '2026.1', nota: 7.0, freq: 100, situacao: 'APR' },

  // 2026.2 (5º período - semestre atual matriculado)
  { id: 't-2026.2-PG520', codigo: 'PG520', semestre: '2026.2', nota: null, freq: null, situacao: 'MATR' },
  { id: 't-2026.2-PG525', codigo: 'PG525', semestre: '2026.2', nota: null, freq: null, situacao: 'MATR' },
  { id: 't-2026.2-PR433', codigo: 'PR433', semestre: '2026.2', nota: null, freq: null, situacao: 'MATR' },
];
