import React, { useState } from 'react';
import { useFdrStore } from '../../store/useStore';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { TipoComplementar, StatusEtapaTcc, Complementar } from '../../domain/types';
import {
  Plus,
  Trash2,
  Edit2,
  FileText,
  User,
} from 'lucide-react';

export const GraduacaoPage: React.FC = () => {
  const store = useFdrStore();
  const [abaAtiva, setAbaAtiva] = useState<'complementares' | 'estagios' | 'tcc' | 'enade'>('complementares');

  const [modalCompAberto, setModalCompAberto] = useState(false);
  const [compEmEdicao, setCompEmEdicao] = useState<Complementar | null>(null);
  const [formTipoComp, setFormTipoComp] = useState<TipoComplementar>('monitoria');
  const [formDescComp, setFormDescComp] = useState('');
  const [formHorasComp, setFormHorasComp] = useState('30');
  const [formDataComp, setFormDataComp] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formComprovante, setFormComprovante] = useState('');

  const totalHorasComp = store.complementares.reduce((s, c) => s + c.horas, 0);
  const metaHorasComp = store.perfil.chExigida.complementares;
  const pctComp = Math.min(100, Math.round((totalHorasComp / metaHorasComp) * 100));

  const abrirModalNovaComp = () => {
    setCompEmEdicao(null);
    setFormTipoComp('monitoria');
    setFormDescComp('');
    setFormHorasComp('30');
    setFormDataComp(new Date().toISOString().split('T')[0]);
    setFormComprovante('');
    setModalCompAberto(true);
  };

  const abrirModalEditarComp = (c: Complementar) => {
    setCompEmEdicao(c);
    setFormTipoComp(c.tipo);
    setFormDescComp(c.descricao);
    setFormHorasComp(c.horas.toString());
    setFormDataComp(c.data);
    setFormComprovante(c.comprovante);
    setModalCompAberto(true);
  };

  const salvarComplementar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescComp.trim()) return;
    const horasNum = parseFloat(formHorasComp) || 10;
    if (compEmEdicao) {
      store.editarComplementar(compEmEdicao.id, {
        tipo: formTipoComp,
        descricao: formDescComp.trim(),
        horas: horasNum,
        data: formDataComp,
        comprovante: formComprovante.trim(),
      });
    } else {
      store.adicionarComplementar({
        tipo: formTipoComp,
        descricao: formDescComp.trim(),
        horas: horasNum,
        data: formDataComp,
        comprovante: formComprovante.trim(),
      });
    }
    setModalCompAberto(false);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header com Abas */}
      <div className="space-y-4 pb-4 border-b border-[#ece8e1]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Requisitos de Conclusão</span>
            <h2 className="font-serif-title text-2xl md:text-3xl font-bold text-stone-900 mt-1">
              Graduação e Atividades
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Atividades Complementares (240h), Estágios Supervisionados, TCC e ENADE.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant="chip"
              active={abaAtiva === 'complementares'}
              onClick={() => setAbaAtiva('complementares')}
            >
              Complementares ({totalHorasComp}h)
            </Button>
            <Button
              variant="chip"
              active={abaAtiva === 'estagios'}
              onClick={() => setAbaAtiva('estagios')}
            >
              Estágios
            </Button>
            <Button
              variant="chip"
              active={abaAtiva === 'tcc'}
              onClick={() => setAbaAtiva('tcc')}
            >
              TCC
            </Button>
            <Button
              variant="chip"
              active={abaAtiva === 'enade'}
              onClick={() => setAbaAtiva('enade')}
            >
              ENADE
            </Button>
          </div>
        </div>
      </div>

      {/* 1. ABA ATIVIDADES COMPLEMENTARES */}
      {abaAtiva === 'complementares' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Progresso Obrigatório</span>
                <h3 className="font-bold text-stone-900 text-sm">
                  240 Horas de Atividades Complementares
                </h3>
              </div>
              <Button
                variant="leaf"
                size="sm"
                onClick={abrirModalNovaComp}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Registrar Atividade</span>
              </Button>
            </div>
            <ProgressBar
              titulo="Horas Acumuladas"
              atual={totalHorasComp}
              total={metaHorasComp}
              porcentagem={pctComp}
              corBarra="bg-emerald-700"
            />
          </div>

          {/* Lista de Atividades */}
          <div className="p-5 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Histórico Registrado ({store.complementares.length})
            </span>
            {store.complementares.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">
                Nenhuma atividade cadastrada.
              </p>
            ) : (
              <div className="divide-y divide-[#ece8e1]">
                {store.complementares.map((c) => (
                  <div
                    key={c.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase bg-[#faf8f5] text-stone-600 border border-[#ece8e1]">
                          {c.tipo}
                        </span>
                        <h5 className="font-semibold text-stone-900">
                          {c.descricao}
                        </h5>
                      </div>
                      <p className="text-stone-400 flex items-center gap-2 text-[11px]">
                        <span>{new Date(c.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        {c.comprovante && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <FileText className="w-3 h-3" />
                              {c.comprovante}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <span className="font-mono font-semibold text-sm text-stone-900">
                        {c.horas}h
                      </span>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => abrirModalEditarComp(c)}
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-stone-400" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('Deseja excluir esta atividade?')) {
                              store.removerComplementar(c.id);
                            }
                          }}
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. ABA ESTÁGIOS SUPERVISIONADOS */}
      {abaAtiva === 'estagios' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {store.estagios.map((est) => {
            const comp = store.componentes.find((c) => c.codigo === est.codigo);
            const totalExigido = 120;
            const pct = Math.min(100, Math.round((est.horasCumpridas / totalExigido) * 100));
            return (
              <div
                key={est.codigo}
                className="p-5 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-stone-400">
                      {est.codigo}
                    </span>
                    <span className="text-xs font-mono text-stone-500">
                      {est.horasCumpridas} / 120h
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-stone-900 mt-1">
                    {comp?.nome || est.codigo}
                  </h3>
                  <p className="text-xs text-stone-400">
                    Obrigatório no {comp?.periodo}º período da grade.
                  </p>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-500 mb-1">Local / Unidade Concedente</label>
                    <input
                      type="text"
                      placeholder="Ex: TJPE, Defensoria Pública..."
                      value={est.local}
                      onChange={(e) => store.atualizarEstagio(est.codigo, { local: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Supervisor / Orientador</label>
                    <input
                      type="text"
                      placeholder="Ex: Juiz de Direito, Defensor..."
                      value={est.supervisor}
                      onChange={(e) => store.atualizarEstagio(est.codigo, { supervisor: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-stone-800"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-500 mb-1">Horas Cumpridas (0 a 120)</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      value={est.horasCumpridas}
                      onChange={(e) =>
                        store.atualizarEstagio(est.codigo, {
                          horasCumpridas: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-stone-800 font-mono"
                    />
                  </div>
                </div>
                <ProgressBar
                  titulo="Integralização do Estágio"
                  atual={est.horasCumpridas}
                  total={totalExigido}
                  porcentagem={pct}
                  corBarra="bg-emerald-700"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 3. ABA TRABALHO DE CONCLUSÃO DE CURSO - TCC */}
      {abaAtiva === 'tcc' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Diretrizes e Orientação</span>
            <h3 className="font-bold text-sm text-stone-900">
              Projeto e Monografia Final
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">
                  Professor(a) Orientador(a)
                </label>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Nome do(a) orientador(a)..."
                    value={store.tcc.orientador}
                    onChange={(e) => store.atualizarTcc({ orientador: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-stone-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-stone-500 mb-1">
                  Tema da Pesquisa / Título Provisório
                </label>
                <input
                  type="text"
                  placeholder="Ex: A eficácia dos direitos sociais..."
                  value={store.tcc.tema}
                  onChange={(e) => store.atualizarTcc({ tema: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-stone-800"
                />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
              Etapas Sequenciais do TCC (4 Semestres Consecutivos)
            </span>
            <div className="divide-y divide-[#ece8e1]">
              {store.tcc.etapas.map((etapa, idx) => {
                const comp = store.componentes.find((c) => c.codigo === etapa.codigo);
                return (
                  <div
                    key={etapa.codigo}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-stone-400">
                          #{idx + 1} {etapa.codigo}
                        </span>
                        <h5 className="font-bold text-stone-900">
                          {comp?.nome || etapa.codigo}
                        </h5>
                      </div>
                      <p className="text-stone-400 mt-0.5">
                        {comp?.periodo}º período • {comp?.ch}h{' '}
                        {comp?.chMin ? `(Exige ${comp.chMin}h integralizadas)` : ''}
                      </p>
                    </div>
                    <select
                      value={etapa.status}
                      onChange={(e) =>
                        store.atualizarTccEtapa(etapa.codigo, {
                          status: e.target.value as StatusEtapaTcc,
                        })
                      }
                      className="h-8 px-2.5 text-xs rounded-xl border border-[#ece8e1] bg-white text-stone-800 font-medium"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. ABA ENADE */}
      {abaAtiva === 'enade' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900">
                ENADE Ingressante
              </h3>
              <input
                type="checkbox"
                checked={store.enade.ingressante}
                onChange={(e) => store.atualizarEnade({ ingressante: e.target.checked })}
                className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-stone-500">
              Participação ou dispensa no ano de ingresso (2024).
            </p>
            <div className="text-xs space-y-1 pt-1">
              <label className="block text-stone-500">Data da Realização / Dispensa</label>
              <input
                type="date"
                value={store.enade.ingressanteEm || ''}
                onChange={(e) => store.atualizarEnade({ ingressanteEm: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#ece8e1] bg-white font-mono text-stone-800"
              />
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#ece8e1] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900">
                ENADE Concluinte
              </h3>
              <input
                type="checkbox"
                checked={store.enade.concluinte}
                onChange={(e) => store.atualizarEnade({ concluinte: e.target.checked })}
                className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
              />
            </div>
            <p className="text-xs text-stone-500">
              Exame obrigatório para colação de grau no último ano (previsão 2029).
            </p>
            <div className="text-xs space-y-1 pt-1">
              <label className="block text-stone-500">Data Prevista</label>
              <input
                type="date"
                value={store.enade.concluinteEm || ''}
                onChange={(e) => store.atualizarEnade({ concluinteEm: e.target.value })}
                className="w-full p-2 rounded-xl border border-[#ece8e1] bg-white font-mono text-stone-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar/Editar Atividade */}
      <Modal
        aberto={modalCompAberto}
        aoFechar={() => setModalCompAberto(false)}
        titulo={compEmEdicao ? 'Editar Atividade' : 'Nova Atividade Complementar'}
      >
        <form onSubmit={salvarComplementar} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-500 mb-1">
              Tipo de Atividade
            </label>
            <select
              value={formTipoComp}
              onChange={(e) => setFormTipoComp(e.target.value as TipoComplementar)}
              className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white font-medium text-stone-800"
            >
              <option value="monitoria">Monitoria Acadêmica</option>
              <option value="extensao">Projeto de Extensão</option>
              <option value="pesquisa">Pesquisa / Iniciação Científica (PIBIC)</option>
              <option value="evento">Congresso, Simpósio ou Semana Jurídica</option>
              <option value="outro">Outro / Curso</option>
            </select>
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Descrição
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Monitoria em TGP, Congresso de Direito..."
              value={formDescComp}
              onChange={(e) => setFormDescComp(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-stone-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-500 mb-1">
                Horas Concedidas
              </label>
              <input
                type="number"
                min="1"
                step="5"
                value={formHorasComp}
                onChange={(e) => setFormHorasComp(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white font-mono text-stone-800"
              />
            </div>
            <div>
              <label className="block text-stone-500 mb-1">
                Data
              </label>
              <input
                type="date"
                value={formDataComp}
                onChange={(e) => setFormDataComp(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white font-mono text-stone-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Comprovante (Nome do Arquivo)
            </label>
            <input
              type="text"
              placeholder="Ex: certificado_congresso_2025.pdf"
              value={formComprovante}
              onChange={(e) => setFormComprovante(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white font-mono text-stone-800"
            />
          </div>
          <div className="pt-3 border-t border-[#ece8e1] flex justify-end gap-2">
            <Button
              variant="soft"
              onClick={() => setModalCompAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="leaf"
            >
              Salvar Atividade
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
