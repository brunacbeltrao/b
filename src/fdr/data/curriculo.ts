import { Componente } from '../domain/types';

export const CURRICULO_OBRIGATORIO: Componente[] = [
  // 1º Período
  { codigo: 'EC001', nome: 'Economia 1', ch: 60, periodo: 1, tipo: 'OBRIG', preReq: [], coReq: [], chMin: 0 },
  { codigo: 'FL003', nome: 'Filosofia', ch: 60, periodo: 1, tipo: 'OBRIG', preReq: [], coReq: [], chMin: 0 },
  { codigo: 'CS004', nome: 'Fundamentos de Sociologia', ch: 60, periodo: 1, tipo: 'OBRIG', preReq: [], coReq: [], chMin: 0 },
  { codigo: 'PR428', nome: 'Introdução ao Estudo do Direito 1', ch: 60, periodo: 1, tipo: 'OBRIG', preReq: [], coReq: [], chMin: 0 },
  { codigo: 'PG516', nome: 'Teoria Política e do Estado', ch: 60, periodo: 1, tipo: 'OBRIG', preReq: [], coReq: [], chMin: 0 },

  // 2º Período
  { codigo: 'PR430', nome: 'Direito Civil 1', ch: 60, periodo: 2, tipo: 'OBRIG', preReq: ['PR428'], coReq: [], chMin: 0 },
  { codigo: 'PE464', nome: 'Direito Penal 1', ch: 60, periodo: 2, tipo: 'OBRIG', preReq: ['PR428'], coReq: [], chMin: 0 },
  { codigo: 'PR429', nome: 'História do Direito', ch: 30, periodo: 2, tipo: 'OBRIG', preReq: ['PR428'], coReq: [], chMin: 0 },
  { codigo: 'PR464', nome: 'Introdução ao Estudo do Direito 2', ch: 60, periodo: 2, tipo: 'OBRIG', preReq: ['PR428'], coReq: [], chMin: 0 },
  { codigo: 'PG518', nome: 'Teoria da Constituição', ch: 30, periodo: 2, tipo: 'OBRIG', preReq: ['PR428'], coReq: [], chMin: 0 },
  { codigo: 'PG517', nome: 'Teoria Geral do Processo', ch: 60, periodo: 2, tipo: 'OBRIG', preReq: [], coReq: [], chMin: 0 },

  // 3º Período
  { codigo: 'PR431', nome: 'Direito Civil 2', ch: 60, periodo: 3, tipo: 'OBRIG', preReq: ['PR430'], coReq: [], chMin: 0 },
  { codigo: 'PG524', nome: 'Direito Constitucional 1', ch: 60, periodo: 3, tipo: 'OBRIG', preReq: ['PG518'], coReq: [], chMin: 0 },
  { codigo: 'PE465', nome: 'Direito Penal 2', ch: 60, periodo: 3, tipo: 'OBRIG', preReq: ['PE464'], coReq: [], chMin: 0 },
  { codigo: 'PG519', nome: 'Direito Processual Civil 1', ch: 60, periodo: 3, tipo: 'OBRIG', preReq: ['PG517'], coReq: [], chMin: 0 },
  { codigo: 'PR436', nome: 'Hermenêutica Jurídica', ch: 60, periodo: 3, tipo: 'OBRIG', preReq: ['PR428', 'PR464'], coReq: [], chMin: 0 },

  // 4º Período
  { codigo: 'PR432', nome: 'Direito Civil 3', ch: 60, periodo: 4, tipo: 'OBRIG', preReq: ['PR431', 'PR464'], coReq: [], chMin: 600 },
  { codigo: 'PG525', nome: 'Direito Constitucional 2', ch: 60, periodo: 4, tipo: 'OBRIG', preReq: ['PG524'], coReq: [], chMin: 0 },
  { codigo: 'PR438', nome: 'Direito Empresarial 1', ch: 30, periodo: 4, tipo: 'OBRIG', preReq: ['PR430'], coReq: ['PR431'], chMin: 300 },
  { codigo: 'PE466', nome: 'Direito Penal 3', ch: 60, periodo: 4, tipo: 'OBRIG', preReq: ['PE465'], coReq: [], chMin: 0 },
  { codigo: 'PG520', nome: 'Direito Processual Civil 2', ch: 60, periodo: 4, tipo: 'OBRIG', preReq: ['PG519'], coReq: [], chMin: 0 },
  { codigo: 'PR437', nome: 'Pesquisa e Direito', ch: 30, periodo: 4, tipo: 'OBRIG', preReq: ['PR428', 'PR436'], coReq: [], chMin: 0 },

  // 5º Período
  { codigo: 'AM131', nome: 'Antropologia Jurídica', ch: 30, periodo: 5, tipo: 'OBRIG', preReq: ['PR436'], coReq: [], chMin: 0 },
  { codigo: 'PE467', nome: 'Criminologia', ch: 30, periodo: 5, tipo: 'OBRIG', preReq: ['PE464'], coReq: [], chMin: 0 },
  { codigo: 'PR433', nome: 'Direito Civil 4', ch: 60, periodo: 5, tipo: 'OBRIG', preReq: ['PR432'], coReq: [], chMin: 900 },
  { codigo: 'PG526', nome: 'Direito Constitucional 3', ch: 60, periodo: 5, tipo: 'OBRIG', preReq: ['PG525'], coReq: [], chMin: 0 },
  { codigo: 'PR439', nome: 'Direito Empresarial 2', ch: 60, periodo: 5, tipo: 'OBRIG', preReq: ['PR438'], coReq: ['PR432'], chMin: 600 },
  { codigo: 'PG521', nome: 'Direito Processual Civil 3', ch: 60, periodo: 5, tipo: 'OBRIG', preReq: ['PG520'], coReq: [], chMin: 0 },

  // 6º Período
  { codigo: 'PR434', nome: 'Direito Civil 5', ch: 60, periodo: 6, tipo: 'OBRIG', preReq: ['PR433'], coReq: [], chMin: 600 },
  { codigo: 'PR442', nome: 'Direito do Consumidor', ch: 30, periodo: 6, tipo: 'OBRIG', preReq: ['PR439'], coReq: [], chMin: 900 },
  { codigo: 'PR440', nome: 'Direito Empresarial 3', ch: 30, periodo: 6, tipo: 'OBRIG', preReq: ['PR439'], coReq: ['PR432'], chMin: 600 },
  { codigo: 'PG522', nome: 'Direito Processual Civil 4', ch: 60, periodo: 6, tipo: 'OBRIG', preReq: ['PG521'], coReq: [], chMin: 0 },
  { codigo: 'PG527', nome: 'Direito Processual Penal 1', ch: 60, periodo: 6, tipo: 'OBRIG', preReq: ['PG520'], coReq: [], chMin: 0 },
  { codigo: 'PS646', nome: 'Psicologia e Direito', ch: 30, periodo: 6, tipo: 'OBRIG', preReq: ['PR436'], coReq: [], chMin: 0 },
  { codigo: 'PE468', nome: 'Teoria Geral do Direito do Trabalho', ch: 30, periodo: 6, tipo: 'OBRIG', preReq: ['PR433'], coReq: [], chMin: 0 },

  // 7º Período
  { codigo: 'PE470', nome: 'Direito Administrativo 1', ch: 60, periodo: 7, tipo: 'OBRIG', preReq: ['PG526'], coReq: [], chMin: 0 },
  { codigo: 'PR435', nome: 'Direito Civil 6', ch: 30, periodo: 7, tipo: 'OBRIG', preReq: ['PR434'], coReq: [], chMin: 900 },
  { codigo: 'PR441', nome: 'Direito Empresarial 4', ch: 60, periodo: 7, tipo: 'OBRIG', preReq: ['PR440'], coReq: ['PR434'], chMin: 1200 },
  { codigo: 'PG523', nome: 'Direito Processual Civil 5', ch: 30, periodo: 7, tipo: 'OBRIG', preReq: ['PG522'], coReq: [], chMin: 0 },
  { codigo: 'PG528', nome: 'Direito Processual Penal 2', ch: 60, periodo: 7, tipo: 'OBRIG', preReq: ['PG527'], coReq: [], chMin: 0 },
  { codigo: 'PE505', nome: 'Direito Sindical e Coletivo do Trabalho', ch: 30, periodo: 7, tipo: 'OBRIG', preReq: ['PE468'], coReq: [], chMin: 600 },
  { codigo: 'INT0065', nome: 'Estágio Supervisionado 1', ch: 120, periodo: 7, tipo: 'OBRIG', preReq: ['PG522', 'PG527'], coReq: [], chMin: 0 },
  { codigo: 'PR443', nome: 'Sociologia do Direito', ch: 30, periodo: 7, tipo: 'OBRIG', preReq: [], coReq: [], chMin: 0 },

  // 8º Período
  { codigo: 'PE472', nome: 'Direito Administrativo 2', ch: 60, periodo: 8, tipo: 'OBRIG', preReq: ['PE470'], coReq: [], chMin: 0 },
  { codigo: 'PE473', nome: 'Direito Financeiro', ch: 30, periodo: 8, tipo: 'OBRIG', preReq: ['PG524', 'PG525'], coReq: [], chMin: 0 },
  { codigo: 'PE469', nome: 'Direito Individual do Trabalho', ch: 60, periodo: 8, tipo: 'OBRIG', preReq: ['PE505'], coReq: [], chMin: 600 },
  { codigo: 'PE471', nome: 'Direito Internacional Público', ch: 60, periodo: 8, tipo: 'OBRIG', preReq: ['PG526'], coReq: [], chMin: 0 },
  { codigo: 'INT0066', nome: 'Estágio Supervisionado 2', ch: 120, periodo: 8, tipo: 'OBRIG', preReq: ['INT0065'], coReq: [], chMin: 0 },
  { codigo: 'INT0067', nome: 'Projeto de TCC', ch: 30, periodo: 8, tipo: 'OBRIG', preReq: [], coReq: [], chMin: 2000 },
  { codigo: 'INT0070', nome: 'Prática Jurídica Cível', ch: 60, periodo: 8, tipo: 'OBRIG', preReq: ['PG523'], coReq: [], chMin: 0 },

  // 9º Período
  { codigo: 'PE474', nome: 'Direito Internacional Privado 1', ch: 60, periodo: 9, tipo: 'OBRIG', preReq: ['PG526'], coReq: [], chMin: 0 },
  { codigo: 'PG530', nome: 'Direito Processual do Trabalho', ch: 60, periodo: 9, tipo: 'OBRIG', preReq: ['PE505', 'PG517'], coReq: [], chMin: 0 },
  { codigo: 'PG531', nome: 'Direitos Humanos 1', ch: 30, periodo: 9, tipo: 'OBRIG', preReq: ['PE471', 'PG526'], coReq: [], chMin: 0 },
  { codigo: 'INT0071', nome: 'Prática Jurídica Penal', ch: 30, periodo: 9, tipo: 'OBRIG', preReq: ['PG528'], coReq: [], chMin: 0 },
  { codigo: 'PE476', nome: 'Sistema Constitucional Tributário', ch: 60, periodo: 9, tipo: 'OBRIG', preReq: ['PG524', 'PG525'], coReq: [], chMin: 0 },
  { codigo: 'INT0068', nome: 'TCC 1', ch: 30, periodo: 9, tipo: 'OBRIG', preReq: ['INT0067'], coReq: [], chMin: 0 },

  // 10º Período
  { codigo: 'PE478', nome: 'Direito Ambiental', ch: 30, periodo: 10, tipo: 'OBRIG', preReq: ['PG526'], coReq: [], chMin: 600 },
  { codigo: 'PE475', nome: 'Direito Internacional Privado 2', ch: 30, periodo: 10, tipo: 'OBRIG', preReq: ['PE474'], coReq: [], chMin: 0 },
  { codigo: 'PR444', nome: 'Filosofia do Direito', ch: 60, periodo: 10, tipo: 'OBRIG', preReq: ['PR464'], coReq: [], chMin: 600 },
  { codigo: 'PE479', nome: 'Fundamentos de Seguridade Social', ch: 30, periodo: 10, tipo: 'OBRIG', preReq: ['PE472'], coReq: [], chMin: 0 },
  { codigo: 'PE477', nome: 'Normas Gerais de Direito Tributário', ch: 60, periodo: 10, tipo: 'OBRIG', preReq: ['PG524', 'PG525', 'PG526'], coReq: [], chMin: 0 },
  { codigo: 'INT0073', nome: 'Prática Jurídica Trabalhista', ch: 30, periodo: 10, tipo: 'OBRIG', preReq: ['PG530'], coReq: [], chMin: 0 },
  { codigo: 'INT0069', nome: 'TCC 2', ch: 30, periodo: 10, tipo: 'OBRIG', preReq: ['INT0067'], coReq: [], chMin: 0 },

  // 11º Período
  { codigo: 'INT0072', nome: 'TCC 3', ch: 30, periodo: 11, tipo: 'OBRIG', preReq: ['INT0068'], coReq: ['INT0069'], chMin: 0 },
  { codigo: 'PG532', nome: 'Ética e Profissões Jurídicas', ch: 30, periodo: 11, tipo: 'OBRIG', preReq: ['PE474'], coReq: [], chMin: 0 },
];
