import React, { useState } from 'react';
import { useFdrStore } from '../../store/useStore';
import { selectStatusPorDisciplina } from '../../store/selectors';
import { Componente, StatusGrade, Tentativa, Situacao } from '../../domain/types';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { buscarDependentesDiretos } from '../../domain/prereq';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const CurriculoPage: React.FC = () => {
  const store = useFdrStore();
  const statusMapa = selectStatusPorDisciplina(store);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>('todos');

  const [componenteSelecionado, setComponenteSelecionado] = useState<Componente | null>(null);

  const [modalTentativaAberto, setModalTentativaAberto] = useState(false);
  const [tentativaEmEdicao, setTentativaEmEdicao] = useState<Tentativa | null>(null);
  const [formSemestre, setFormSemestre] = useState('2026.2');
  const [formNota, setFormNota] = useState('');
  const [formFreq, setFormFreq] = useState('100');
  const [formSituacao, setFormSituacao] = useState<Situacao>('APR');

  const componentesFiltrados = store.componentes.filter((c) => {
    const status = statusMapa.get(c.codigo) || 'PENDENTE';
    const bateBusca =
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.codigo.toLowerCase().includes(busca.toLowerCase());
    const bateStatus =
      filtroStatus === 'todos' ||
      status.toLowerCase() === filtroStatus.toLowerCase();
    const batePeriodo =
      filtroPeriodo === 'todos' ||
      c.periodo?.toString() === filtroPeriodo;
    return bateBusca && bateStatus && batePeriodo;
  });

  const periodos = Array.from(
    new Set(store.componentes.map((c) => c.periodo || 0))
  ).sort((a, b) => a - b);

  const abrirModalNovaTentativa = (codigo: string) => {
    setTentativaEmEdicao(null);
    setFormSemestre('2026.2');
    setFormNota('');
    setFormFreq('100');
    setFormSituacao('APR');
    setModalTentativaAberto(true);
  };

  const abrirModalEditarTentativa = (t: Tentativa) => {
    setTentativaEmEdicao(t);
    setFormSemestre(t.semestre);
    setFormNota(t.nota != null ? t.nota.toString() : '');
    setFormFreq(t.freq != null ? t.freq.toString() : '100');
    setFormSituacao(t.situacao);
    setModalTentativaAberto(true);
  };

  const salvarTentativa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!componenteSelecionado) return;
    const notaNum = formNota.trim() !== '' ? parseFloat(formNota.replace(',', '.')) : null;
    const freqNum = formFreq.trim() !== '' ? parseFloat(formFreq) : null;
    if (tentativaEmEdicao) {
      store.editarTentativa(tentativaEmEdicao.id, {
        semestre: formSemestre,
        nota: notaNum,
        freq: freqNum,
        situacao: formSituacao,
      });
    } else {
      store.adicionarTentativa({
        codigo: componenteSelecionado.codigo,
        semestre: formSemestre,
        nota: notaNum,
        freq: freqNum,
        situacao: formSituacao,
      });
    }
    setModalTentativaAberto(false);
  };

  const obterBadgeStatus = (status: StatusGrade) => {
    switch (status) {
      case 'APROVADA':
        return {
          dot: 'bg-emerald-600',
          texto: 'Aprovada',
        };
      case 'CURSANDO':
        return {
          dot: 'bg-[#8b1538]',
          texto: 'Cursando',
        };
      case 'REPROVADA':
        return {
          dot: 'bg-rose-600',
          texto: 'Reprovada',
        };
      default:
        return {
          dot: 'bg-stone-300',
          texto: 'Pendente',
        };
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header com Filtros e Busca */}
      <div className="space-y-4 pb-4 border-b border-[#e6e4e8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-stone-400 block">Currículo 0807-2014.2</span>
            <h2 className="font-serif-title text-2xl md:text-3xl font-bold text-stone-900 mt-1">
              Grade Curricular
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              65 componentes obrigatórios organizados por período letivo.
            </p>
          </div>
          <div className="w-full md:w-72">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por disciplina ou código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#e6e4e8] bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8b1538]"
              />
            </div>
          </div>
        </div>

        {/* Chips de Filtro */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs text-stone-400 mr-1">Status:</span>
          {(['todos', 'aprovada', 'cursando', 'reprovada', 'pendente'] as const).map((s) => (
            <Button
              key={s}
              variant="chip"
              active={filtroStatus === s}
              onClick={() => setFiltroStatus(s)}
            >
              {s === 'todos' ? 'Todos' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
          <span className="text-xs text-stone-400 ml-3 mr-1">Período:</span>
          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="h-8 px-2.5 text-xs rounded-full border border-[#e6e4e8] bg-white text-stone-700 font-medium"
          >
            <option value="todos">Todos os períodos</option>
            {periodos.map((p) => (
              <option key={p} value={p.toString()}>
                {p}º Período
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade de Disciplinas Agrupadas por Período */}
      <div className="space-y-8">
        {periodos.map((periodo) => {
          const compsDoPeriodo = componentesFiltrados.filter((c) => c.periodo === periodo);
          if (compsDoPeriodo.length === 0) return null;
          const chPeriodo = compsDoPeriodo.reduce((s, c) => s + c.ch, 0);
          return (
            <div key={periodo} className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-[#e6e4e8]">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>{periodo}º Período</span>
                </h3>
                <span className="text-xs text-stone-400 font-mono">
                  {compsDoPeriodo.length} componentes • {chPeriodo}h
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {compsDoPeriodo.map((comp) => {
                  const status = statusMapa.get(comp.codigo) || 'PENDENTE';
                  const badge = obterBadgeStatus(status);
                  const tentativas = store.tentativas
                    .filter((t) => t.codigo === comp.codigo)
                    .sort((a, b) => a.semestre.localeCompare(b.semestre));
                  const ultima = tentativas[tentativas.length - 1];
                  return (
                    <div
                      key={comp.codigo}
                      onClick={() => setComponenteSelecionado(comp)}
                      className="p-4 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs transition-all cursor-pointer hover:border-[#8b1538]/40 flex flex-col justify-between gap-3 group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-stone-400 group-hover:text-stone-900 font-semibold">
                            {comp.codigo}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            <span>{badge.texto}</span>
                          </span>
                        </div>
                        <h4 className="font-medium text-xs text-stone-800 leading-snug">
                          {comp.nome}
                        </h4>
                      </div>
                      <div className="pt-2 border-t border-[#e6e4e8] flex items-center justify-between text-xs text-stone-400 font-mono">
                        <span>{comp.ch}h</span>
                        {ultima ? (
                          <span className="text-stone-700 font-medium">
                            {ultima.nota != null ? `Nota ${ultima.nota.toFixed(1)}` : ultima.situacao} ({ultima.semestre})
                          </span>
                        ) : comp.preReq.length > 0 ? (
                          <span className="text-[11px] text-stone-400">
                            {comp.preReq.length} pré-req
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes da Disciplina */}
      <Modal
        aberto={componenteSelecionado != null}
        aoFechar={() => setComponenteSelecionado(null)}
        titulo={componenteSelecionado ? `${componenteSelecionado.codigo} • ${componenteSelecionado.nome}` : ''}
        subtitulo={componenteSelecionado ? `${componenteSelecionado.periodo}º Período • ${componenteSelecionado.ch} horas` : ''}
      >
        {componenteSelecionado && (
          <div className="space-y-5 text-xs">
            {(() => {
              const status = statusMapa.get(componenteSelecionado.codigo) || 'PENDENTE';
              const badge = obterBadgeStatus(status);
              return (
                <div className="p-3.5 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    <div>
                      <span className="text-xs font-medium text-stone-400 block">Situação Curricular</span>
                      <p className="text-sm font-semibold text-stone-900">{badge.texto}</p>
                    </div>
                  </div>
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={() => abrirModalNovaTentativa(componenteSelecionado.codigo)}
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                    <span>Lançar Tentativa</span>
                  </Button>
                </div>
              );
            })()}

            {/* Histórico de Tentativas */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-stone-400 block">Histórico de Matrículas e Notas</span>
              {(() => {
                const ts = store.tentativas.filter((t) => t.codigo === componenteSelecionado.codigo);
                if (ts.length === 0) {
                  return (
                    <p className="text-xs text-stone-400 italic p-3 bg-[#f6f5f7] rounded-xl">
                      Nenhuma tentativa registrada até o momento.
                    </p>
                  );
                }
                return (
                  <div className="space-y-1.5">
                    {ts.map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border border-[#e6e4e8] bg-white flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold text-stone-900">
                            {t.semestre}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[11px] font-mono bg-[#f6f5f7] text-stone-600 border border-[#e6e4e8]">
                            {t.situacao}
                          </span>
                          {t.nota != null && (
                            <span className="font-mono text-stone-900">
                              Nota <strong>{t.nota.toFixed(1)}</strong>
                            </span>
                          )}
                          {t.freq != null && (
                            <span className="text-stone-400">Freq {t.freq}%</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => abrirModalEditarTentativa(t)}
                            title="Editar tentativa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('Deseja excluir esta tentativa do histórico?')) {
                                store.removerTentativa(t.id);
                              }
                            }}
                            title="Excluir tentativa"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Pré-requisitos e Co-requisitos */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-stone-400 block">Requisitos da Disciplina</span>
              <div className="space-y-1.5 text-xs">
                {componenteSelecionado.preReq.length === 0 &&
                componenteSelecionado.coReq.length === 0 &&
                componenteSelecionado.chMin === 0 ? (
                  <p className="text-stone-400 italic">Sem pré-requisitos exigidos.</p>
                ) : (
                  <>
                    {componenteSelecionado.preReq.map((pre) => {
                      const compPre = store.componentes.find((c) => c.codigo === pre);
                      const statusPre = statusMapa.get(pre);
                      const ok = statusPre === 'APROVADA';
                      return (
                        <div
                          key={pre}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#e6e4e8] bg-white"
                        >
                          <div className="flex items-center gap-2">
                            {ok ? (
                              <Unlock className="w-3.5 h-3.5 text-emerald-700" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span className="text-stone-800">
                              <strong>Pré-requisito:</strong> {compPre?.nome || pre} ({pre})
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              ok
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {ok ? 'Cumprido' : 'Pendente'}
                          </span>
                        </div>
                      );
                    })}
                    {componenteSelecionado.coReq.map((co) => {
                      const compCo = store.componentes.find((c) => c.codigo === co);
                      return (
                        <div
                          key={co}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-stone-400" />
                            <span>
                              <strong>Co-requisito:</strong> {compCo?.nome || co} ({co})
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400">
                            (Mesmo semestre ou antes)
                          </span>
                        </div>
                      );
                    })}
                    {componenteSelecionado.chMin > 0 && (
                      <div className="p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-600">
                        <strong className="text-stone-900">Carga Horária Mínima:</strong> {componenteSelecionado.chMin} horas integralizadas antes.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Disciplinas que esta destrava */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-stone-400 block">Disciplinas que esta destrava</span>
              {(() => {
                const destravadas = buscarDependentesDiretos(
                  componenteSelecionado.codigo,
                  store.componentes
                );
                if (destravadas.length === 0) {
                  return (
                    <p className="text-xs text-stone-400 italic">
                      Não é pré-requisito direto de outras disciplinas da grade.
                    </p>
                  );
                }
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {destravadas.map((d) => (
                      <div
                        key={d.codigo}
                        className="p-2.5 rounded-xl bg-[#f6f5f7] border border-[#e6e4e8] flex items-center gap-2"
                      >
                        <ArrowRight className="w-3 h-3 text-emerald-700 shrink-0" />
                        <div>
                          <p className="font-semibold text-stone-900">
                            {d.nome}
                          </p>
                          <p className="text-[10px] text-stone-400 font-mono">
                            {d.codigo} • {d.periodo}º Período
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Adicionar/Editar Tentativa */}
      <Modal
        aberto={modalTentativaAberto}
        aoFechar={() => setModalTentativaAberto(false)}
        titulo={tentativaEmEdicao ? 'Editar Registro de Histórico' : 'Registrar Nova Tentativa'}
        subtitulo={componenteSelecionado ? `${componenteSelecionado.codigo} • ${componenteSelecionado.nome}` : ''}
      >
        <form onSubmit={salvarTentativa} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-500 mb-1">
              Semestre Letivo (AAAA.S)
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 2026.2"
              value={formSemestre}
              onChange={(e) => setFormSemestre(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Situação no Histórico
            </label>
            <select
              value={formSituacao}
              onChange={(e) => setFormSituacao(e.target.value as Situacao)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-medium text-stone-800"
            >
              <option value="APR">APR - Aprovada (Média ≥ 7,0)</option>
              <option value="APRN">APRN - Aprovada na Final (Nota ≥ 3,0)</option>
              <option value="REP">REP - Reprovada por Média</option>
              <option value="REPN">REPN - Reprovada na Final</option>
              <option value="REPF">REPF - Reprovada por Falta</option>
              <option value="MATR">MATR - Cursando / Matriculada</option>
              <option value="TRANC">TRANC - Trancamento</option>
              <option value="CANC">CANC - Cancelamento</option>
              <option value="DISP">DISP - Dispensada</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-500 mb-1">
                Nota Final (0 a 10)
              </label>
              <input
                type="text"
                placeholder="Ex: 8,5 (ou vazio)"
                value={formNota}
                onChange={(e) => setFormNota(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
              />
            </div>
            <div>
              <label className="block text-stone-500 mb-1">
                Frequência (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formFreq}
                onChange={(e) => setFormFreq(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
              />
            </div>
          </div>
          <div className="pt-3 border-t border-[#e6e4e8] flex justify-end gap-2">
            <Button
              variant="soft"
              onClick={() => setModalTentativaAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="leaf"
            >
              Salvar Registro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
