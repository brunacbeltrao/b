import { create } from 'zustand';
import {
  Estado,
  Tentativa,
  Avaliacao,
  Falta,
  PlanoSemestre,
  Cenario,
  Complementar,
  Estagio,
  TccEtapa,
  EletivaCursada,
  Topico,
  Guia,
  OrigemTopico,
  HorarioAula,
  RegistroPresenca,
  LembreteCalendario,
  ItemCadernoErro,
  ItemLeitura,
  FavoritoTopico,
} from '../domain/types';
import { carregarEstadoDoStorage, salvarEstadoNoStorage } from './storage';
import { criarEstadoInicial } from '../data/initialState';
import { sugerirPlano } from '../domain/planner';
import { criarGuia, redefinirParaPrograma, gerarId } from '../domain/guia';
import { EstadoCompletoSchema } from '../data/schema';
import { migrarEstado } from '../data/migrations';

export interface FdrStoreState extends Estado {
  // Ações de Tentativa (Histórico)
  adicionarTentativa: (t: Omit<Tentativa, 'id'>) => void;
  editarTentativa: (id: string, t: Partial<Tentativa>) => void;
  removerTentativa: (id: string) => void;

  // Ações de Avaliações e Faltas
  adicionarAvaliacao: (a: Omit<Avaliacao, 'id'>) => void;
  editarAvaliacao: (id: string, a: Partial<Avaliacao>) => void;
  removerAvaliacao: (id: string) => void;
  adicionarFalta: (f: Omit<Falta, 'id'>) => void;
  removerFalta: (id: string) => void;

  // Ações do Planejador
  atualizarPlanoSemestre: (semestre: string, codigos: string[], eletivas?: any[]) => void;
  removerPlanoSemestre: (semestre: string) => void;
  moverDisciplinaNoPlano: (codigo: string, semestreDestino: string) => void;
  removerDisciplinaDoPlano: (codigo: string) => void;
  adicionarEletivaAoPlano: (semestre: string, eletiva: { nome: string; ch: number; categoria: 'perfil' | 'livre' }) => void;
  removerEletivaDoPlano: (semestre: string, eletivaId: string) => void;
  sugerirPlanoAutomatico: () => void;
  limparPlano: () => void;

  // Ações de Simulador
  salvarCenario: (nome: string, notas: Record<string, number>) => void;
  removerCenario: (id: string) => void;

  // Ações de Graduação
  adicionarComplementar: (c: Omit<Complementar, 'id'>) => void;
  editarComplementar: (id: string, c: Partial<Complementar>) => void;
  removerComplementar: (id: string) => void;
  atualizarEstagio: (codigo: string, dados: Partial<Estagio>) => void;
  atualizarTcc: (dados: { orientador?: string; tema?: string }) => void;
  atualizarTccEtapa: (codigo: string, etapa: Partial<TccEtapa>) => void;
  atualizarEnade: (dados: { ingressante?: boolean; concluinte?: boolean; ingressanteEm?: string; concluinteEm?: string }) => void;
  adicionarEletivaCursada: (e: Omit<EletivaCursada, 'id'>) => void;
  removerEletivaCursada: (id: string) => void;

  // Ações do Guia de Estudos e Tópicos
  garantirGuiaParaTentativa: (tentativaId: string, codigo: string) => void;
  editarGuia: (tentativaId: string, dados: Partial<Guia>) => void;
  adicionarTopico: (tentativaId: string, dados: { titulo: string; subtopicos?: string; origem?: OrigemTopico }) => void;
  editarTopico: (id: string, dados: Partial<Topico>) => void;
  reordenarTopicos: (tentativaId: string, novosIdsNaOrdem: string[]) => void;
  removerTopico: (id: string) => void;
  marcarTopico: (id: string, concluido: boolean) => void;
  associarTopicoAvaliacao: (topicoId: string, avaliacaoId: string, associar: boolean) => void;
  redefinirGuiaParaModelo: (tentativaId: string, codigo: string) => void;
  alternarPerguntaProfessor: (tentativaId: string, perguntaId: string) => void;

  // Perfil e Configuração
  atualizarParametrosIndices: (params: Partial<Estado['perfil']['parametrosIndices']>) => void;
  atualizarPerfil: (dados: Partial<Estado['perfil']>) => void;
  importarEstadoJson: (conteudoJson: string) => { sucesso: boolean; mensagem: string };
  restaurarDadosIniciais: () => void;

  // Tela Hoje e Falta em um toque
  registrarPresencaOuFalta: (tentativaId: string, dataStr: string, presente: boolean, quantidadeHoras?: number) => void;
  adicionarHorarioAula: (h: Omit<HorarioAula, 'id'>) => void;
  removerHorarioAula: (id: string) => void;
  editarHorarioAula: (id: string, dados: Partial<Omit<HorarioAula, 'id'>>) => void;

  // Calendário com lembretes
  adicionarLembreteCalendario: (lembrete: Omit<LembreteCalendario, 'id'>) => void;
  editarLembreteCalendario: (id: string, dados: Partial<LembreteCalendario>) => void;
  removerLembreteCalendario: (id: string) => void;

  // Caderno de Erros
  adicionarItemCadernoErro: (item: Omit<ItemCadernoErro, 'id'>) => void;
  editarItemCadernoErro: (id: string, dados: Partial<ItemCadernoErro>) => void;
  removerItemCadernoErro: (id: string) => void;
  alternarResolvidoErro: (id: string) => void;

  // Fila de Leitura & Fichamento
  adicionarLeitura: (item: Omit<ItemLeitura, 'id'>) => void;
  editarLeitura: (id: string, dados: Partial<ItemLeitura>) => void;
  removerLeitura: (id: string) => void;
  atualizarProgressoLeitura: (id: string, paginasLidas: number) => void;
  atualizarFichamentoLeitura: (id: string, fichamento: string) => void;

  // Favoritos por Tópico (Jurisprudência & Doutrina)
  adicionarFavoritoTopico: (fav: Omit<FavoritoTopico, 'id'>) => void;
  removerFavoritoTopico: (id: string) => void;

  // Meta Semanal
  atualizarMetaSemanal: (metaTopicos: number) => void;
}

export const useFdrStore = create<FdrStoreState>((set, get) => {
  const estadoInicial = carregarEstadoDoStorage();

  const salvarEAtualizar = (novoEstado: Partial<Estado>) => {
    set((state) => {
      const consolidado: Estado = {
        ...state,
        ...novoEstado,
      };
      salvarEstadoNoStorage(consolidado);
      return consolidado as FdrStoreState;
    });
  };

  return {
    ...estadoInicial,

    // Tentativas
    adicionarTentativa: (t) => {
      const nova: Tentativa = { ...t, id: gerarId() };
      const tentativas = [...get().tentativas, nova];
      salvarEAtualizar({ tentativas });
    },
    editarTentativa: (id, t) => {
      const tentativas = get().tentativas.map((item) =>
        item.id === id ? { ...item, ...t } : item
      );
      salvarEAtualizar({ tentativas });
    },
    removerTentativa: (id) => {
      const tentativas = get().tentativas.filter((item) => item.id !== id);
      salvarEAtualizar({ tentativas });
    },

    // Avaliações
    adicionarAvaliacao: (a) => {
      const nova: Avaliacao = { ...a, id: gerarId() };
      const avaliacoes = [...get().avaliacoes, nova];
      salvarEAtualizar({ avaliacoes });
    },
    editarAvaliacao: (id, a) => {
      const avaliacoes = get().avaliacoes.map((item) =>
        item.id === id ? { ...item, ...a } : item
      );
      salvarEAtualizar({ avaliacoes });
    },
    removerAvaliacao: (id) => {
      const avaliacoes = get().avaliacoes.filter((item) => item.id !== id);
      salvarEAtualizar({ avaliacoes });
    },

    // Faltas
    adicionarFalta: (f) => {
      const nova: Falta = { ...f, id: gerarId() };
      const faltas = [...get().faltas, nova];
      salvarEAtualizar({ faltas });
    },
    removerFalta: (id) => {
      const faltas = get().faltas.filter((item) => item.id !== id);
      salvarEAtualizar({ faltas });
    },

    // Planejador
    atualizarPlanoSemestre: (semestre, codigos, eletivas) => {
      const planoExistente = get().planoSemestres;
      const indice = planoExistente.findIndex((p) => p.semestre === semestre);
      let novoPlano: PlanoSemestre[];
      if (indice >= 0) {
        novoPlano = [...planoExistente];
        novoPlano[indice] = {
          semestre,
          codigos,
          eletivas: eletivas ?? planoExistente[indice].eletivas ?? [],
        };
      } else {
        novoPlano = [...planoExistente, { semestre, codigos, eletivas: eletivas ?? [] }];
      }
      salvarEAtualizar({ planoSemestres: novoPlano });
    },
    removerPlanoSemestre: (semestre) => {
      const novoPlano = get().planoSemestres.filter((p) => p.semestre !== semestre);
      salvarEAtualizar({ planoSemestres: novoPlano });
    },
    moverDisciplinaNoPlano: (codigo, semestreDestino) => {
      const planoAtual = get().planoSemestres;
      const limpo = planoAtual.map((p) => ({
        ...p,
        codigos: p.codigos.filter((c) => c !== codigo),
      }));
      const existeDestino = limpo.find((p) => p.semestre === semestreDestino);
      let final: PlanoSemestre[];
      if (existeDestino) {
        final = limpo.map((p) =>
          p.semestre === semestreDestino
            ? { ...p, codigos: [...p.codigos, codigo] }
            : p
        );
      } else {
        final = [...limpo, { semestre: semestreDestino, codigos: [codigo], eletivas: [] }];
      }
      salvarEAtualizar({ planoSemestres: final });
    },
    removerDisciplinaDoPlano: (codigo) => {
      const planoAtual = get().planoSemestres.map((p) => ({
        ...p,
        codigos: p.codigos.filter((c) => c !== codigo),
      }));
      salvarEAtualizar({ planoSemestres: planoAtual });
    },
    adicionarEletivaAoPlano: (semestre, eletiva) => {
      const novoPlano = get().planoSemestres.map((p) => {
        if (p.semestre === semestre) {
          const eletivas = p.eletivas || [];
          return {
            ...p,
            eletivas: [...eletivas, { ...eletiva, id: gerarId() }],
          };
        }
        return p;
      });
      salvarEAtualizar({ planoSemestres: novoPlano });
    },
    removerEletivaDoPlano: (semestre, eletivaId) => {
      const novoPlano = get().planoSemestres.map((p) => {
        if (p.semestre === semestre) {
          return {
            ...p,
            eletivas: (p.eletivas || []).filter((e) => e.id !== eletivaId),
          };
        }
        return p;
      });
      salvarEAtualizar({ planoSemestres: novoPlano });
    },
    sugerirPlanoAutomatico: () => {
      const sugerido = sugerirPlano(get().tentativas, get().componentes, '2027.1', 480);
      salvarEAtualizar({ planoSemestres: sugerido });
    },
    limparPlano: () => {
      salvarEAtualizar({ planoSemestres: [] });
    },

    // Simulador
    salvarCenario: (nome, notas) => {
      const novoCenario: Cenario = {
        id: gerarId(),
        nome,
        notas,
        dataCriacao: new Date().toISOString().split('T')[0],
      };
      const cenarios = [...get().cenarios, novoCenario];
      salvarEAtualizar({ cenarios });
    },
    removerCenario: (id) => {
      const cenarios = get().cenarios.filter((c) => c.id !== id);
      salvarEAtualizar({ cenarios });
    },

    // Graduação
    adicionarComplementar: (c) => {
      const nova: Complementar = { ...c, id: gerarId() };
      salvarEAtualizar({ complementares: [...get().complementares, nova] });
    },
    editarComplementar: (id, c) => {
      const complementares = get().complementares.map((item) =>
        item.id === id ? { ...item, ...c } : item
      );
      salvarEAtualizar({ complementares });
    },
    removerComplementar: (id) => {
      const complementares = get().complementares.filter((item) => item.id !== id);
      salvarEAtualizar({ complementares });
    },
    atualizarEstagio: (codigo, dados) => {
      const estagios = get().estagios.map((est) =>
        est.codigo === codigo ? { ...est, ...dados } : est
      );
      salvarEAtualizar({ estagios });
    },
    atualizarTcc: (dados) => {
      const tcc = { ...get().tcc, ...dados };
      salvarEAtualizar({ tcc });
    },
    atualizarTccEtapa: (codigo, etapa) => {
      const etapas = get().tcc.etapas.map((e) =>
        e.codigo === codigo ? { ...e, ...etapa } : e
      );
      salvarEAtualizar({ tcc: { ...get().tcc, etapas } });
    },
    atualizarEnade: (dados) => {
      const enade = { ...get().enade, ...dados };
      salvarEAtualizar({ enade });
    },
    adicionarEletivaCursada: (e) => {
      const nova: EletivaCursada = { ...e, id: gerarId() };
      salvarEAtualizar({ eletivasCursadas: [...get().eletivasCursadas, nova] });
    },
    removerEletivaCursada: (id) => {
      const eletivasCursadas = get().eletivasCursadas.filter((item) => item.id !== id);
      salvarEAtualizar({ eletivasCursadas });
    },

    // Guia de Estudos e Tópicos
    garantirGuiaParaTentativa: (tentativaId, codigo) => {
      const guiaExistente = get().guias.find((g) => g.tentativaId === tentativaId);
      if (!guiaExistente) {
        const { guia, topicos } = criarGuia(tentativaId, codigo, get().programas);
        salvarEAtualizar({
          guias: [...get().guias, guia],
          topicos: [...get().topicos, ...topicos],
        });
      }
    },
    editarGuia: (tentativaId, dados) => {
      const guias = get().guias.map((g) =>
        g.tentativaId === tentativaId ? { ...g, ...dados } : g
      );
      salvarEAtualizar({ guias });
    },
    adicionarTopico: (tentativaId, dados) => {
      const topicosDaTentativa = get().topicos.filter((t) => t.tentativaId === tentativaId);
      const proximaOrdem = topicosDaTentativa.length + 1;
      const novoTopico: Topico = {
        id: gerarId(),
        tentativaId,
        ordem: proximaOrdem,
        titulo: dados.titulo,
        subtopicos: dados.subtopicos ?? '',
        origem: dados.origem ?? 'professor',
        concluido: false,
        avaliacaoIds: [],
      };
      salvarEAtualizar({ topicos: [...get().topicos, novoTopico] });
    },
    editarTopico: (id, dados) => {
      const topicos = get().topicos.map((t) =>
        t.id === id ? { ...t, ...dados } : t
      );
      salvarEAtualizar({ topicos });
    },
    reordenarTopicos: (tentativaId, novosIdsNaOrdem) => {
      const idParaOrdem = new Map<string, number>();
      novosIdsNaOrdem.forEach((id, index) => idParaOrdem.set(id, index + 1));
      const topicos = get().topicos.map((t) => {
        if (t.tentativaId === tentativaId && idParaOrdem.has(t.id)) {
          return { ...t, ordem: idParaOrdem.get(t.id)! };
        }
        return t;
      });
      salvarEAtualizar({ topicos });
    },
    removerTopico: (id) => {
      const topicos = get().topicos.filter((t) => t.id !== id);
      salvarEAtualizar({ topicos });
    },
    marcarTopico: (id, concluido) => {
      const topicos = get().topicos.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            concluido,
            concluidoEm: concluido ? new Date().toISOString() : undefined,
          };
        }
        return t;
      });
      salvarEAtualizar({ topicos });
    },
    associarTopicoAvaliacao: (topicoId, avaliacaoId, associar) => {
      const topicos = get().topicos.map((t) => {
        if (t.id === topicoId) {
          const ids = new Set(t.avaliacaoIds || []);
          if (associar) ids.add(avaliacaoId);
          else ids.delete(avaliacaoId);
          return { ...t, avaliacaoIds: Array.from(ids) };
        }
        return t;
      });
      salvarEAtualizar({ topicos });
    },
    redefinirGuiaParaModelo: (tentativaId, codigo) => {
      const programa = get().programas.find((p) => p.componente === codigo);
      const topicosAtuais = get().topicos.filter((t) => t.tentativaId === tentativaId);
      const outrosTopicos = get().topicos.filter((t) => t.tentativaId !== tentativaId);
      const restaurados = redefinirParaPrograma(topicosAtuais, programa, tentativaId);
      const guias = get().guias.map((g) => {
        if (g.tentativaId === tentativaId && programa) {
          return {
            ...g,
            ementa: programa.ementa,
            bibliografia: programa.bibliografia,
          };
        }
        return g;
      });
      salvarEAtualizar({
        topicos: [...outrosTopicos, ...restaurados],
        guias,
      });
    },
    alternarPerguntaProfessor: (tentativaId, perguntaId) => {
      const guias = get().guias.map((g) => {
        if (g.tentativaId === tentativaId && g.perguntasProfessor) {
          const perguntas = g.perguntasProfessor.map((p) =>
            p.id === perguntaId ? { ...p, respondida: !p.respondida } : p
          );
          return { ...g, perguntasProfessor: perguntas };
        }
        return g;
      });
      salvarEAtualizar({ guias });
    },

    // Perfil e Configuração
    atualizarParametrosIndices: (params) => {
      const perfil = {
        ...get().perfil,
        parametrosIndices: {
          ...get().perfil.parametrosIndices,
          ...params,
        },
      };
      salvarEAtualizar({ perfil });
    },
    atualizarPerfil: (dados) => {
      const perfil = { ...get().perfil, ...dados };
      salvarEAtualizar({ perfil });
    },
    importarEstadoJson: (conteudoJson: string) => {
      try {
        const dados = JSON.parse(conteudoJson);
        const migrado = migrarEstado(dados);
        const validado = EstadoCompletoSchema.safeParse(migrado);
        if (!validado.success) {
          const primeiroErro = validado.error.issues[0]?.message || 'Estrutura JSON inválida.';
          return { sucesso: false, mensagem: `Erro na validação do arquivo: ${primeiroErro}` };
        }
        const estadoImportado = validado.data as Estado;
        salvarEAtualizar(estadoImportado);
        return { sucesso: true, mensagem: 'Histórico e dados importados com sucesso!' };
      } catch (err: any) {
        return { sucesso: false, mensagem: `Arquivo JSON inválido: ${err?.message || 'formato ilegível'}` };
      }
    },
    restaurarDadosIniciais: () => {
      const novo = criarEstadoInicial();
      salvarEAtualizar(novo);
    },

    // Tela Hoje e Falta em um toque
    registrarPresencaOuFalta: (tentativaId, dataStr, presente, quantidadeHoras = 2) => {
      const registrosAtuais = get().registrosPresenca || [];
      const faltasAtuais = get().faltas || [];
      const idRegistro = `rp-${tentativaId}-${dataStr}`;
      const outrosRegistros = registrosAtuais.filter((r) => !(r.tentativaId === tentativaId && r.data === dataStr));
      const novoRegistro: RegistroPresenca = {
        id: idRegistro,
        tentativaId,
        data: dataStr,
        presente,
        quantidade: quantidadeHoras,
      };

      let novasFaltas = [...faltasAtuais];
      if (!presente) {
        const jaTemFalta = faltasAtuais.some((f) => f.tentativaId === tentativaId && f.data === dataStr);
        if (!jaTemFalta) {
          novasFaltas.push({
            id: `f-${tentativaId}-${dataStr}`,
            tentativaId,
            data: dataStr,
            quantidade: quantidadeHoras,
          });
        }
      } else {
        novasFaltas = faltasAtuais.filter((f) => !(f.tentativaId === tentativaId && f.data === dataStr));
      }
      salvarEAtualizar({
        registrosPresenca: [...outrosRegistros, novoRegistro],
        faltas: novasFaltas,
      });
    },
    adicionarHorarioAula: (h) => {
      const novo: HorarioAula = { ...h, id: gerarId() };
      const horariosAulas = [...(get().horariosAulas || []), novo];
      salvarEAtualizar({ horariosAulas });
    },
    removerHorarioAula: (id) => {
      const horariosAulas = (get().horariosAulas || []).filter((h) => h.id !== id);
      salvarEAtualizar({ horariosAulas });
    },
    editarHorarioAula: (id, dados) => {
      const horariosAulas = (get().horariosAulas || []).map((h) => (h.id === id ? { ...h, ...dados } : h));
      salvarEAtualizar({ horariosAulas });
    },

    // Calendário com lembretes
    adicionarLembreteCalendario: (lembrete) => {
      const novo: LembreteCalendario = { ...lembrete, id: gerarId() };
      const lembretesCalendario = [...(get().lembretesCalendario || []), novo];
      salvarEAtualizar({ lembretesCalendario });
    },
    editarLembreteCalendario: (id, dados) => {
      const lembretesCalendario = (get().lembretesCalendario || []).map((l) =>
        l.id === id ? { ...l, ...dados } : l
      );
      salvarEAtualizar({ lembretesCalendario });
    },
    removerLembreteCalendario: (id) => {
      const lembretesCalendario = (get().lembretesCalendario || []).filter((l) => l.id !== id);
      salvarEAtualizar({ lembretesCalendario });
    },

    // Caderno de Erros
    adicionarItemCadernoErro: (item) => {
      const novo: ItemCadernoErro = { ...item, id: gerarId() };
      const cadernoErros = [novo, ...(get().cadernoErros || [])];
      salvarEAtualizar({ cadernoErros });
    },
    editarItemCadernoErro: (id, dados) => {
      const cadernoErros = (get().cadernoErros || []).map((e) =>
        e.id === id ? { ...e, ...dados } : e
      );
      salvarEAtualizar({ cadernoErros });
    },
    removerItemCadernoErro: (id) => {
      const cadernoErros = (get().cadernoErros || []).filter((e) => e.id !== id);
      salvarEAtualizar({ cadernoErros });
    },
    alternarResolvidoErro: (id) => {
      const cadernoErros = (get().cadernoErros || []).map((e) =>
        e.id === id ? { ...e, resolvido: !e.resolvido } : e
      );
      salvarEAtualizar({ cadernoErros });
    },

    // Fila de Leitura & Fichamento
    adicionarLeitura: (item) => {
      const novo: ItemLeitura = { ...item, id: gerarId() };
      const leituras = [...(get().leituras || []), novo];
      salvarEAtualizar({ leituras });
    },
    editarLeitura: (id, dados) => {
      const leituras = (get().leituras || []).map((l) =>
        l.id === id ? { ...l, ...dados } : l
      );
      salvarEAtualizar({ leituras });
    },
    removerLeitura: (id) => {
      const leituras = (get().leituras || []).filter((l) => l.id !== id);
      salvarEAtualizar({ leituras });
    },
    atualizarProgressoLeitura: (id, paginasLidas) => {
      const hoje = new Date().toISOString().split('T')[0];
      const leituras = (get().leituras || []).map((l) => {
        if (l.id === id) {
          const concluido = paginasLidas >= l.totalPaginas;
          return {
            ...l,
            paginasLidas,
            status: concluido ? ('concluido' as const) : paginasLidas > 0 ? ('lendo' as const) : ('fila' as const),
            dataUltimaLeitura: hoje,
          };
        }
        return l;
      });
      salvarEAtualizar({ leituras });
    },
    atualizarFichamentoLeitura: (id, fichamento) => {
      const leituras = (get().leituras || []).map((l) =>
        l.id === id ? { ...l, fichamento } : l
      );
      salvarEAtualizar({ leituras });
    },

    // Favoritos por Tópico (Doutrina / Jurisprudência)
    adicionarFavoritoTopico: (fav) => {
      const novo: FavoritoTopico = { ...fav, id: gerarId() };
      const favoritosTopicos = [...(get().favoritosTopicos || []), novo];
      salvarEAtualizar({ favoritosTopicos });
    },
    removerFavoritoTopico: (id) => {
      const favoritosTopicos = (get().favoritosTopicos || []).filter((f) => f.id !== id);
      salvarEAtualizar({ favoritosTopicos });
    },

    // Meta Semanal
    atualizarMetaSemanal: (metaTopicos) => {
      salvarEAtualizar({ metaSemanal: { metaTopicos } });
    },
  };
});
