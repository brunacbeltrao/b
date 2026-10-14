import React, { useState } from 'react';
import { useFdrStore } from '../../store/useStore';
import { validarPlanoCompleto, preverFormatura, calcularHorasSemestre } from '../../domain/planner';
import { Componente } from '../../domain/types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Sparkles,
  AlertTriangle,
  Plus,
  Trash2,
  MoveRight,
  GraduationCap,
} from 'lucide-react';

export const PlanejadorPage: React.FC = () => {
  const store = useFdrStore();
  const compMap = new Map<string, Componente>(store.componentes.map((c) => [c.codigo, c]));
  const validacao = validarPlanoCompleto(
    store.planoSemestres,
    store.tentativas,
    store.componentes
  );
  const previsao = preverFormatura(
    store.planoSemestres,
    store.perfil.prazoMinimo,
    store.perfil.prazoMaximo
  );

  const todosSemestresPlanejaveis = [
    '2027.1',
    '2027.2',
    '2028.1',
    '2028.2',
    '2029.1',
    '2029.2',
    '2030.1',
    '2030.2',
    '2031.1',
    '2031.2',
  ];

  const codigosConcluidosOuMatriculados = new Set<string>();
  store.tentativas.forEach((t) => {
    if (t.situacao === 'APR' || t.situacao === 'APRN' || t.situacao === 'MATR') {
      codigosConcluidosOuMatriculados.add(t.codigo);
    }
  });

  const codigosNoPlano = new Set<string>();
  store.planoSemestres.forEach((p) => {
    p.codigos.forEach((c) => codigosNoPlano.add(c));
  });

  const pendentesNaoAlocadas = store.componentes.filter(
    (c) =>
      c.tipo === 'OBRIG' &&
      !codigosConcluidosOuMatriculados.has(c.codigo) &&
      !codigosNoPlano.has(c.codigo)
  );

  const [modalEletivaAberto, setModalEletivaAberto] = useState(false);
  const [semestreEletivaAlvo, setSemestreEletivaAlvo] = useState<string>('2027.1');
  const [nomeEletiva, setNomeEletiva] = useState('');
  const [chEletiva, setChEletiva] = useState('30');
  const [catEletiva, setCatEletiva] = useState<'perfil' | 'livre'>('perfil');

  const [modalMoverAberto, setModalMoverAberto] = useState(false);
  const [disciplinaParaMover, setDisciplinaParaMover] = useState<Componente | null>(null);

  const salvarNovaEletiva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeEletiva.trim()) return;
    store.adicionarEletivaAoPlano(semestreEletivaAlvo, {
      nome: nomeEletiva.trim(),
      ch: parseInt(chEletiva, 10) || 30,
      categoria: catEletiva,
    });
    setNomeEletiva('');
    setModalEletivaAberto(false);
  };

  const handleMoverDisciplina = (semestreDestino: string) => {
    if (!disciplinaParaMover) return;
    store.moverDisciplinaNoPlano(disciplinaParaMover.codigo, semestreDestino);
    setModalMoverAberto(false);
    setDisciplinaParaMover(null);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header com Previsão e Sugestão */}
      <div className="space-y-4 pb-4 border-b border-[#ece8e1]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Distribuição Curricular</span>
            <h2 className="font-serif-title text-2xl md:text-3xl font-bold text-stone-900 mt-1">
              Planejador de Semestres
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Planeje semestres futuros de 2027.1 até 2031.2 com validação contínua de travas e teto de até 480h.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="leaf"
              size="sm"
              onClick={() => {
                if (
                  store.planoSemestres.length === 0 ||
                  confirm(
                    'Deseja recalcular o plano sugerido? As disciplinas pendentes serão distribuídas respeitando pré-requisitos e a sequência de TCC.'
                  )
                ) {
                  store.sugerirPlanoAutomatico();
                }
              }}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              <span>Sugerir Plano Automático</span>
            </Button>
            <Button
              variant="soft"
              size="sm"
              onClick={() => {
                if (confirm('Deseja limpar todos os semestres do plano?')) {
                  store.limparPlano();
                }
              }}
            >
              Limpar Plano
            </Button>
          </div>
        </div>

        {/* Resumo da Previsão de Formatura */}
        <div className="p-4 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
            <div>
              <p className="font-bold text-stone-900">
                Formatura Estimada: {previsao.semestreConclusao || 'A definir'}
              </p>
              <p className="text-stone-500 text-[11px]">{previsao.mensagem}</p>
            </div>
          </div>
          <div className="font-mono text-xs text-stone-400 flex items-center gap-2">
            <span>Mínimo: {store.perfil.prazoMinimo}</span>
            <span>•</span>
            <span>Máximo: {store.perfil.prazoMaximo}</span>
          </div>
        </div>
      </div>

      {/* Disciplinas Pendentes Não Alocadas */}
      {pendentesNaoAlocadas.length > 0 && (
        <div className="p-4 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Disciplinas Pendentes ({pendentesNaoAlocadas.length} não alocadas)
            </span>
            <span className="text-[11px] text-stone-400">
              Toque para alocar em um semestre
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {pendentesNaoAlocadas.map((comp) => (
              <button
                key={comp.codigo}
                onClick={() => {
                  setDisciplinaParaMover(comp);
                  setModalMoverAberto(true);
                }}
                className="px-2.5 py-1 rounded-xl text-xs border border-[#ece8e1] bg-[#faf8f5] hover:bg-stone-100 text-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="font-mono font-semibold text-stone-500">{comp.codigo}</span>
                <span>{comp.nome}</span>
                <span className="text-[10px] text-stone-400 font-mono">({comp.ch}h)</span>
                <Plus className="w-3 h-3 text-emerald-700" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grade de Semestres do Plano */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.planoSemestres.map((semPlano) => {
          const dadosValidacao = validacao.errosPorSemestre.get(semPlano.semestre);
          const chTotal = dadosValidacao?.chTotal ?? calcularHorasSemestre(semPlano, compMap);
          const temErroRegra = (dadosValidacao?.errosDisciplinas.length ?? 0) > 0;
          const excedeTeto = chTotal > 480;
          return (
            <div
              key={semPlano.semestre}
              className={`p-4 bg-white rounded-2xl border flex flex-col justify-between overflow-hidden shadow-2xs transition-all ${
                temErroRegra
                  ? 'border-rose-400'
                  : excedeTeto
                  ? 'border-amber-400'
                  : 'border-[#ece8e1]'
              }`}
            >
              {/* Header do Cartão */}
              <div className="pb-3 border-b border-[#ece8e1] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                    <span>Semestre {semPlano.semestre}</span>
                    {temErroRegra && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-100 text-rose-800">
                        Bloqueio
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {semPlano.codigos.length} obrigatórias • {semPlano.eletivas?.length || 0} eletivas
                  </p>
                </div>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-md border font-semibold ${
                    excedeTeto
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-[#faf8f5] text-stone-800 border-[#ece8e1]'
                  }`}
                >
                  {chTotal}h {excedeTeto ? '(> 480h)' : ''}
                </span>
              </div>

              {/* Erros de Validação */}
              {dadosValidacao && dadosValidacao.errosDisciplinas.length > 0 && (
                <div className="p-3 my-2 rounded-xl text-xs text-rose-700 bg-rose-50 border border-rose-200 space-y-1">
                  {dadosValidacao.errosDisciplinas.map((err, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                      <span>{err.mensagem}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista de Disciplinas Alocadas */}
              <div className="py-3 space-y-1.5 flex-1 min-h-[140px]">
                {semPlano.codigos.map((cod) => {
                  const comp = compMap.get(cod);
                  const erroNesta = dadosValidacao?.errosDisciplinas.find((e) => e.codigo === cod);
                  return (
                    <div
                      key={cod}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                        erroNesta
                          ? 'border-rose-300 bg-rose-50/50 text-rose-800'
                          : 'border-[#ece8e1] bg-[#faf8f5] text-stone-800'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="font-semibold text-stone-500">{cod}</span>
                          <span className="text-[10px] text-stone-400">
                            {comp?.ch || 60}h
                          </span>
                        </div>
                        <p className="truncate text-stone-800 text-[11px]">{comp?.nome || cod}</p>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (comp) {
                              setDisciplinaParaMover(comp);
                              setModalMoverAberto(true);
                            }
                          }}
                          title="Mover disciplina"
                        >
                          <MoveRight className="w-3.5 h-3.5 text-stone-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => store.removerDisciplinaDoPlano(cod)}
                          title="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {/* Eletivas */}
                {semPlano.eletivas && semPlano.eletivas.length > 0 && (
                  <div className="pt-2 border-t border-[#ece8e1] space-y-1">
                    {semPlano.eletivas.map((el) => (
                      <div
                        key={el.id}
                        className="p-2 rounded-xl border border-[#ece8e1] bg-white text-xs flex items-center justify-between"
                      >
                        <div className="truncate">
                          <span className="text-stone-800 font-medium">{el.nome}</span>
                          <span className="text-[10px] ml-1 text-stone-400 font-mono">
                            ({el.ch}h • {el.categoria})
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => store.removerEletivaDoPlano(semPlano.semestre, el.id)}
                          title="Remover eletiva"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rodapé do Cartão */}
              <div className="pt-3 border-t border-[#ece8e1] flex items-center justify-between text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSemestreEletivaAlvo(semPlano.semestre);
                    setModalEletivaAberto(true);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-900"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  <span>Eletiva</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => store.removerPlanoSemestre(semPlano.semestre)}
                  className="text-xs text-stone-400 hover:text-rose-600"
                >
                  Excluir
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Mover Disciplina */}
      <Modal
        aberto={modalMoverAberto}
        aoFechar={() => {
          setModalMoverAberto(false);
          setDisciplinaParaMover(null);
        }}
        titulo={disciplinaParaMover ? `Alocar ${disciplinaParaMover.codigo}` : ''}
        subtitulo={disciplinaParaMover?.nome}
      >
        <div className="space-y-3">
          <p className="text-xs text-stone-500">
            Escolha o semestre de destino para cursar este componente:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {todosSemestresPlanejaveis.map((sem) => (
              <button
                key={sem}
                onClick={() => handleMoverDisciplina(sem)}
                className="p-3 rounded-xl border border-[#ece8e1] bg-[#faf8f5] hover:bg-stone-100 text-xs font-mono font-medium text-stone-800 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>{sem}</span>
                <MoveRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Adicionar Eletiva */}
      <Modal
        aberto={modalEletivaAberto}
        aoFechar={() => setModalEletivaAberto(false)}
        titulo={`Adicionar Eletiva em ${semestreEletivaAlvo}`}
      >
        <form onSubmit={salvarNovaEletiva} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-500 mb-1">
              Nome da Disciplina Eletiva
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Direito Digital, Biodireito..."
              value={nomeEletiva}
              onChange={(e) => setNomeEletiva(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-stone-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-500 mb-1">
                Carga Horária (h)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={chEletiva}
                onChange={(e) => setChEletiva(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white font-mono text-stone-800"
              />
            </div>
            <div>
              <label className="block text-stone-500 mb-1">
                Categoria
              </label>
              <select
                value={catEletiva}
                onChange={(e) => setCatEletiva(e.target.value as 'perfil' | 'livre')}
                className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white font-medium text-stone-800"
              >
                <option value="perfil">Eletiva do Perfil (FDR)</option>
                <option value="livre">Eletiva Livre (UFPE)</option>
              </select>
            </div>
          </div>
          <div className="pt-3 border-t border-[#ece8e1] flex justify-end gap-2">
            <Button
              variant="soft"
              onClick={() => setModalEletivaAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="leaf"
            >
              Salvar no Plano
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
