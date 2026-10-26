import React, { useState } from 'react';
import { useFdrStore } from '../../store/useStore';
import { selectDisciplinasMatriculadas, selectProgressoSemestreAtual } from '../../store/selectors';
import {
  calcularMediaParcial,
  calcularNotaNecessaria,
  calcularRegraFinal,
  calcularStatusFaltas,
} from '../../domain/approval';
import { calcularProgressoTopicos } from '../../domain/guia';
import { Componente, Tentativa, Avaliacao } from '../../domain/types';
import { GuiaModal } from '../components/GuiaModal';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import {
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ChevronRight,
} from 'lucide-react';

export const SemestrePage: React.FC = () => {
  const store = useFdrStore();
  const matriculadas = selectDisciplinasMatriculadas(store);
  const progressoGeralSemestre = selectProgressoSemestreAtual(store);

  const [guiaAbertoPara, setGuiaAbertoPara] = useState<{
    tentativa: Tentativa;
    componente: Componente;
  } | null>(null);

  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [tentativaParaAvaliacao, setTentativaParaAvaliacao] = useState<string>('');
  const [avaliacaoEmEdicao, setAvaliacaoEmEdicao] = useState<Avaliacao | null>(null);
  const [formNomeAv, setFormNomeAv] = useState('');
  const [formDataAv, setFormDataAv] = useState('');
  const [formPesoAv, setFormPesoAv] = useState('1');
  const [formNotaAv, setFormNotaAv] = useState('');

  const [modalFaltaAberto, setModalFaltaAberto] = useState(false);
  const [tentativaParaFalta, setTentativaParaFalta] = useState<string>('');
  const [formQtdFalta, setFormQtdFalta] = useState('2');
  const [formDataFalta, setFormDataFalta] = useState(
    new Date().toISOString().split('T')[0]
  );

  const proximasAvaliacoes = store.avaliacoes
    .filter((a) => {
      return matriculadas.some((m) => m.tentativa.id === a.tentativaId);
    })
    .sort((a, b) => {
      if (!a.data) return 1;
      if (!b.data) return -1;
      return a.data.localeCompare(b.data);
    });

  const abrirModalNovaAvaliacao = (tentativaId: string) => {
    setTentativaParaAvaliacao(tentativaId);
    setAvaliacaoEmEdicao(null);
    setFormNomeAv('');
    setFormDataAv('');
    setFormPesoAv('1');
    setFormNotaAv('');
    setModalAvaliacaoAberto(true);
  };

  const abrirModalEditarAvaliacao = (av: Avaliacao) => {
    setTentativaParaAvaliacao(av.tentativaId);
    setAvaliacaoEmEdicao(av);
    setFormNomeAv(av.nome);
    setFormDataAv(av.data || '');
    setFormPesoAv(av.peso.toString());
    setFormNotaAv(av.nota != null ? av.nota.toString() : '');
    setModalAvaliacaoAberto(true);
  };

  const salvarAvaliacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNomeAv.trim() || !tentativaParaAvaliacao) return;
    const pesoNum = parseFloat(formPesoAv) || 1;
    const notaNum = formNotaAv.trim() !== '' ? parseFloat(formNotaAv.replace(',', '.')) : null;
    if (avaliacaoEmEdicao) {
      store.editarAvaliacao(avaliacaoEmEdicao.id, {
        nome: formNomeAv.trim(),
        data: formDataAv || null,
        peso: pesoNum,
        nota: notaNum,
      });
    } else {
      store.adicionarAvaliacao({
        tentativaId: tentativaParaAvaliacao,
        nome: formNomeAv.trim(),
        data: formDataAv || null,
        peso: pesoNum,
        nota: notaNum,
      });
    }
    setModalAvaliacaoAberto(false);
  };

  const salvarFalta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tentativaParaFalta) return;
    store.adicionarFalta({
      tentativaId: tentativaParaFalta,
      data: formDataFalta,
      quantidade: parseInt(formQtdFalta, 10) || 2,
    });
    setModalFaltaAberto(false);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header Geral do Semestre */}
      <div className="space-y-4 pb-4 border-b border-[#e6e4e8]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              <span className="text-xs font-medium text-stone-400">Período Letivo em Curso</span>
            </div>
            <h2 className="font-serif-title text-2xl md:text-3xl font-bold text-stone-900 mt-1">
              Semestre {store.perfil.periodoAtual}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              5º período • {matriculadas.length} disciplinas matriculadas (180h).
            </p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#e6e4e8] shadow-2xs flex items-center gap-3">
            <div>
              <span className="text-xs text-stone-400 block font-semibold">
                Conteúdo Geral dos Guias
              </span>
              <span className="font-mono text-xs text-stone-900 font-bold">
                {progressoGeralSemestre.concluidos} / {progressoGeralSemestre.total} tópicos
              </span>
            </div>
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#f6f5f7] text-stone-800 border border-[#e6e4e8]">
              {progressoGeralSemestre.porcentagem}%
            </span>
          </div>
        </div>
      </div>

      {/* Próximas Avaliações Marcadas */}
      {proximasAvaliacoes.length > 0 && (
        <div className="p-4 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3">
          <span className="text-xs font-medium text-stone-400 block flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>Próximas Avaliações do Semestre</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {proximasAvaliacoes.map((av) => {
              const disc = matriculadas.find((m) => m.tentativa.id === av.tentativaId);
              const dataFormatada = av.data
                ? new Date(av.data + 'T00:00:00').toLocaleDateString('pt-BR')
                : 'Data a definir';
              return (
                <div
                  key={av.id}
                  className="p-3 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-mono text-[10px] text-stone-400">
                      {disc?.componente.codigo}
                    </span>
                    <h4 className="font-semibold text-stone-900 leading-tight text-xs">
                      {av.nome}
                    </h4>
                    <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      <span>{dataFormatada} • Peso {av.peso}</span>
                    </p>
                  </div>
                  {av.nota != null ? (
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-white text-stone-900 border border-[#e6e4e8]">
                      {av.nota.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-[10px] px-1.5 py-0.5 rounded text-stone-400 bg-white border border-[#e6e4e8]">
                      Pendente
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cartões Detalhados de Cada Disciplina */}
      <div className="space-y-6">
        {matriculadas.map(({ tentativa, componente }) => {
          const avaliacoes = store.avaliacoes.filter((a) => a.tentativaId === tentativa.id);
          const faltas = store.faltas.filter((f) => f.tentativaId === tentativa.id);
          const totalHorasFaltas = faltas.reduce((acc, f) => acc + f.quantidade, 0);
          const statusFaltas = calcularStatusFaltas(componente.ch, totalHorasFaltas);
          const mediaParcial = calcularMediaParcial(avaliacoes);
          const notaNecessaria = calcularNotaNecessaria(avaliacoes, 7.0);
          const regraFinal = calcularRegraFinal(mediaParcial.media);
          const topicos = store.topicos.filter((t) => t.tentativaId === tentativa.id);
          const progTopicos = calcularProgressoTopicos(topicos);

          return (
            <div
              key={tentativa.id}
              className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4"
            >
              {/* Header da Disciplina */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e6e4e8]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-stone-400">
                      {componente.codigo}
                    </span>
                    <h3 className="text-base font-bold text-stone-900">
                      {componente.nome}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {componente.ch} horas
                  </p>
                </div>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => setGuiaAbertoPara({ tentativa, componente })}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700 mr-1" />
                  <span>Guia de Estudos ({progTopicos.concluidos}/{progTopicos.total})</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              {/* Grid: Média Parcial, O que falta & Faltas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] space-y-1">
                  <span className="text-xs font-medium text-stone-400 block">Média Parcial</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-light font-mono text-stone-900">
                      {mediaParcial.media != null ? mediaParcial.media.toFixed(1) : '-'}
                    </span>
                    <span className="text-xs text-stone-400">
                      ({mediaParcial.pesoConcluido}/{mediaParcial.pesoTotal} peso)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    Aprovação direta por média: ≥ 7,0
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] space-y-1">
                  <span className="text-xs font-medium text-stone-400 block">Meta Restante</span>
                  <div className="flex items-baseline gap-2">
                    {notaNecessaria.garantida ? (
                      <span className="text-sm font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprovada por Média</span>
                      </span>
                    ) : notaNecessaria.necessaria != null ? (
                      <>
                        <span className="text-2xl font-light font-mono text-stone-900">
                          {notaNecessaria.necessaria.toFixed(1)}
                        </span>
                        <span className="text-xs text-stone-400">
                          nas provas restantes
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-stone-400">
                        {regraFinal.explicacao}
                      </span>
                    )}
                  </div>
                  {regraFinal.vaiParaFinal && (
                    <p className="text-[11px] text-amber-600">
                      Prova final: nota mínima {regraFinal.notaNecessariaFinal?.toFixed(1) || 3.0}.
                    </p>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-stone-400">Faltas (Máx 25%)</span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setTentativaParaFalta(tentativa.id);
                        setModalFaltaAberto(true);
                      }}
                    >
                      + Falta
                    </Button>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-light font-mono text-stone-900">
                      {statusFaltas.totalFaltas}h
                    </span>
                    <span className="text-xs text-stone-400">
                      de {statusFaltas.limiteFaltas}h ({statusFaltas.porcentagemFrequencia.toFixed(0)}% freq)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {statusFaltas.reprovadaPorFalta
                      ? 'Limite ultrapassado (REPF).'
                      : statusFaltas.emRisco
                      ? 'Mais de 75% do limite atingido.'
                      : 'Frequência regular.'}
                  </p>
                </div>
              </div>

              {/* Avaliações Cadastradas */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-400">
                    Avaliações Registradas ({avaliacoes.length})
                  </span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => abrirModalNovaAvaliacao(tentativa.id)}
                  >
                    + Adicionar Avaliação
                  </Button>
                </div>
                <div className="divide-y divide-[#e6e4e8] border border-[#e6e4e8] rounded-xl bg-[#f6f5f7] overflow-hidden">
                  {avaliacoes.length === 0 ? (
                    <p className="text-xs text-stone-400 italic p-3 text-center">
                      Nenhuma avaliação cadastrada ainda.
                    </p>
                  ) : (
                    avaliacoes.map((av) => (
                      <div
                        key={av.id}
                        className="p-3 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-stone-900">
                            {av.nome}
                          </span>
                          <span className="text-stone-400">
                            Peso {av.peso}
                          </span>
                          {av.data && (
                            <span className="text-stone-400 font-mono">
                              {new Date(av.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono">
                            {av.nota != null ? (
                              <span className="px-2 py-0.5 rounded-md bg-white text-stone-900 border border-[#e6e4e8] font-semibold">
                                Nota {av.nota.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-stone-400 italic">Pendente</span>
                            )}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => abrirModalEditarAvaliacao(av)}
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-stone-400" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (confirm('Deseja excluir esta avaliação?')) {
                                  store.removerAvaliacao(av.id);
                                }
                              }}
                              title="Excluir"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {guiaAbertoPara && (
        <GuiaModal
          aberto={true}
          aoFechar={() => setGuiaAbertoPara(null)}
          tentativa={guiaAbertoPara.tentativa}
          componente={guiaAbertoPara.componente}
        />
      )}

      {/* Modal Criar/Editar Avaliação */}
      <Modal
        aberto={modalAvaliacaoAberto}
        aoFechar={() => setModalAvaliacaoAberto(false)}
        titulo={avaliacaoEmEdicao ? 'Editar Avaliação' : 'Nova Avaliação'}
      >
        <form onSubmit={salvarAvaliacao} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-500 mb-1">
              Nome da Avaliação
            </label>
            <input
              type="text"
              required
              placeholder="Ex: 1ª Prova Teórica, Seminário..."
              value={formNomeAv}
              onChange={(e) => setFormNomeAv(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-500 mb-1">
                Data Prevista
              </label>
              <input
                type="date"
                value={formDataAv}
                onChange={(e) => setFormDataAv(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-500 mb-1">
                Peso
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formPesoAv}
                onChange={(e) => setFormPesoAv(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800 font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Nota Obtida (0 a 10)
            </label>
            <input
              type="text"
              placeholder="Ex: 8,5 (deixe vazio se pendente)"
              value={formNotaAv}
              onChange={(e) => setFormNotaAv(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800 font-mono"
            />
          </div>
          <div className="pt-3 border-t border-[#e6e4e8] flex justify-end gap-2">
            <Button
              variant="soft"
              onClick={() => setModalAvaliacaoAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="leaf"
            >
              Salvar Avaliação
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Falta */}
      <Modal
        aberto={modalFaltaAberto}
        aoFechar={() => setModalFaltaAberto(false)}
        titulo="Registrar Falta"
      >
        <form onSubmit={salvarFalta} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-500 mb-1">
              Data da Falta
            </label>
            <input
              type="date"
              required
              value={formDataFalta}
              onChange={(e) => setFormDataFalta(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800 font-mono"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Horas-Aula Faltadas
            </label>
            <input
              type="number"
              min="1"
              value={formQtdFalta}
              onChange={(e) => setFormQtdFalta(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800 font-mono"
            />
          </div>
          <div className="pt-3 border-t border-[#e6e4e8] flex justify-end gap-2">
            <Button
              variant="soft"
              onClick={() => setModalFaltaAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="leaf"
            >
              Confirmar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
