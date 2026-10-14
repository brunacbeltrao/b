import React, { useState } from 'react';
import { useFdrStore } from '../../store/useStore';
import { Modal } from './Modal';
import { Button } from './Button';
import { Componente, Tentativa, OrigemTopico } from '../../domain/types';
import { calcularProgressoTopicos } from '../../domain/guia';
import {
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
  AlertCircle,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit3,
  Save,
} from 'lucide-react';

interface GuiaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  tentativa: Tentativa;
  componente: Componente;
}

export const GuiaModal: React.FC<GuiaModalProps> = ({
  aberto,
  aoFechar,
  tentativa,
  componente,
}) => {
  const store = useFdrStore();
  const guia = store.guias.find((g) => g.tentativaId === tentativa.id) || {
    tentativaId: tentativa.id,
    ementa: '',
    bibliografia: '',
    observacoes: '',
    aviso: '',
    perguntasProfessor: [],
  };
  const topicos = store.topicos
    .filter((t) => t.tentativaId === tentativa.id)
    .sort((a, b) => a.ordem - b.ordem);
  const progresso = calcularProgressoTopicos(topicos);
  const avaliacoesDaTentativa = store.avaliacoes.filter(
    (a) => a.tentativaId === tentativa.id
  );

  const [secaoAtiva, setSecaoAtiva] = useState<'topicos' | 'ementa' | 'perguntas'>('topicos');
  const [modalNovoTopico, setModalNovoTopico] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novosSubtopicos, setNovosSubtopicos] = useState('');
  const [novaOrigem, setNovaOrigem] = useState<OrigemTopico>('professor');

  const [editandoEmenta, setEditandoEmenta] = useState(false);
  const [formEmenta, setFormEmenta] = useState(guia.ementa);
  const [formBiblio, setFormBiblio] = useState(guia.bibliografia);
  const [formObs, setFormObs] = useState(guia.observacoes);
  const [formAviso, setFormAviso] = useState(guia.aviso);

  const salvarInfoGuia = () => {
    store.editarGuia(tentativa.id, {
      ementa: formEmenta,
      bibliografia: formBiblio,
      observacoes: formObs,
      aviso: formAviso,
    });
    setEditandoEmenta(false);
  };

  const handleCriarTopico = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;
    store.adicionarTopico(tentativa.id, {
      titulo: novoTitulo.trim(),
      subtopicos: novosSubtopicos.trim(),
      origem: novaOrigem,
    });
    setNovoTitulo('');
    setNovosSubtopicos('');
    setNovaOrigem('professor');
    setModalNovoTopico(false);
  };

  const moverTopico = (indice: number, direcao: 'cima' | 'baixo') => {
    const novoIndice = direcao === 'cima' ? indice - 1 : indice + 1;
    if (novoIndice < 0 || novoIndice >= topicos.length) return;
    const copia = [...topicos];
    const [removido] = copia.splice(indice, 1);
    copia.splice(novoIndice, 0, removido);
    const idsNaOrdem = copia.map((t) => t.id);
    store.reordenarTopicos(tentativa.id, idsNaOrdem);
  };

  const badgeOrigem = (origem: OrigemTopico) => {
    switch (origem) {
      case 'programa':
        return 'Programa Oficial';
      case 'professor':
        return 'Indicação Docente';
      case 'propria':
        return 'Anotação Própria';
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={`Guia de Estudos • ${componente.codigo}`}
      subtitulo={`${componente.nome} • ${progresso.concluidos}/${progresso.total} tópicos concluídos (${progresso.porcentagem}%)`}
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-[#faf8f5] rounded-xl border border-[#ece8e1] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Progresso dos Tópicos</span>
            <span className="font-mono text-stone-900 font-medium text-xs">
              {progresso.porcentagem}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#f2ede4] overflow-hidden">
            <div
              className="h-full bg-emerald-700 rounded-full transition-all duration-300"
              style={{ width: `${progresso.porcentagem}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[#ece8e1] pb-2">
          <div className="flex items-center gap-1">
            <Button
              variant="chip"
              active={secaoAtiva === 'topicos'}
              onClick={() => setSecaoAtiva('topicos')}
            >
              Tópicos ({topicos.length})
            </Button>
            <Button
              variant="chip"
              active={secaoAtiva === 'ementa'}
              onClick={() => setSecaoAtiva('ementa')}
            >
              Ementa & Bibliografia
            </Button>
            <Button
              variant="chip"
              active={secaoAtiva === 'perguntas'}
              onClick={() => setSecaoAtiva('perguntas')}
            >
              Checklist Docente
            </Button>
          </div>
          {secaoAtiva === 'topicos' && (
            <div className="flex items-center gap-1.5">
              <Button
                variant="leaf"
                size="sm"
                onClick={() => setModalNovoTopico(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Tópico</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (
                    confirm(
                      'Deseja redefinir os tópicos para o programa oficial? Títulos oficiais serão restaurados, seus tópicos concluídos serão preservados e tópicos do professor serão mantidos.'
                    )
                  ) {
                    store.redefinirGuiaParaModelo(tentativa.id, componente.codigo);
                  }
                }}
                title="Restaurar programa oficial"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-400" />
              </Button>
            </div>
          )}
        </div>

        {secaoAtiva === 'topicos' && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {guia.aviso && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-stone-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Aviso do Docente</span>
                  <p>{guia.aviso}</p>
                </div>
              </div>
            )}
            {topicos.length === 0 ? (
              <div className="text-center py-6 text-stone-400">
                Nenhum tópico cadastrado ainda.
              </div>
            ) : (
              topicos.map((topico, idx) => (
                <div
                  key={topico.id}
                  className={`p-3 rounded-xl border transition-all ${
                    topico.concluido
                      ? 'border-[#ece8e1] bg-[#faf8f5]/60'
                      : 'border-[#ece8e1] bg-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1">
                      <button
                        type="button"
                        onClick={() => store.marcarTopico(topico.id, !topico.concluido)}
                        className="mt-0.5 text-stone-400 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer"
                      >
                        {topico.concluido ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-stone-400">
                            #{topico.ordem}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-[#faf8f5] text-stone-600 border border-[#ece8e1]">
                            {badgeOrigem(topico.origem)}
                          </span>
                        </div>
                        <h5
                          className={`font-medium text-xs leading-snug ${
                            topico.concluido
                              ? 'line-through text-stone-400'
                              : 'text-stone-800'
                          }`}
                        >
                          {topico.titulo}
                        </h5>
                        {topico.subtopicos && (
                          <p className="text-[11px] text-stone-500 leading-relaxed">
                            {topico.subtopicos}
                          </p>
                        )}
                        <div className="pt-1.5 flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-stone-400">Cai em:</span>
                          {avaliacoesDaTentativa.map((av) => {
                            const associada = topico.avaliacaoIds?.includes(av.id);
                            return (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() =>
                                  store.associarTopicoAvaliacao(topico.id, av.id, !associada)
                                }
                                className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                                  associada
                                    ? 'bg-[#8b1538] text-white border-[#8b1538]'
                                    : 'bg-white text-stone-600 border-[#ece8e1] hover:text-stone-900'
                                }`}
                              >
                                {av.nome.split(' ')[0]} {av.nome.split(' ')[1] || ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === 0}
                        onClick={() => moverTopico(idx, 'cima')}
                        title="Para cima"
                      >
                        <ArrowUp className="w-3 h-3 text-stone-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={idx === topicos.length - 1}
                        onClick={() => moverTopico(idx, 'baixo')}
                        title="Para baixo"
                      >
                        <ArrowDown className="w-3 h-3 text-stone-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm('Deseja excluir este tópico?')) {
                            store.removerTopico(topico.id);
                          }
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3 text-stone-400 hover:text-rose-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {secaoAtiva === 'ementa' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              {editandoEmenta ? (
                <Button variant="leaf" size="sm" onClick={salvarInfoGuia}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Salvar</span>
                </Button>
              ) : (
                <Button variant="soft" size="sm" onClick={() => setEditandoEmenta(true)}>
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                  <span>Editar</span>
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Ementa do Programa</span>
                {editandoEmenta ? (
                  <textarea
                    rows={4}
                    value={formEmenta}
                    onChange={(e) => setFormEmenta(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-xs text-stone-800"
                  />
                ) : (
                  <p className="p-3 rounded-xl bg-[#faf8f5] border border-[#ece8e1] leading-relaxed text-stone-800 whitespace-pre-line">
                    {guia.ementa || 'Ementa não informada.'}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Bibliografia Recomendada</span>
                {editandoEmenta ? (
                  <textarea
                    rows={4}
                    value={formBiblio}
                    onChange={(e) => setFormBiblio(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white font-mono text-[11px] text-stone-800"
                  />
                ) : (
                  <p className="p-3 rounded-xl bg-[#faf8f5] border border-[#ece8e1] leading-relaxed text-stone-800 font-mono text-[11px] whitespace-pre-line">
                    {guia.bibliografia || 'Bibliografia não informada.'}
                  </p>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Avisos e Observações</span>
                {editandoEmenta ? (
                  <input
                    type="text"
                    value={formAviso}
                    onChange={(e) => setFormAviso(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white text-xs text-stone-800"
                  />
                ) : (
                  <p className="p-2.5 rounded-xl bg-[#faf8f5] border border-[#ece8e1] text-stone-500 italic">
                    {guia.aviso || 'Nenhum aviso registrado.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {secaoAtiva === 'perguntas' && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Perguntas Essenciais ao Docente</span>
            <div className="space-y-1.5">
              {(guia.perguntasProfessor || []).map((perg) => (
                <div
                  key={perg.id}
                  onClick={() => store.alternarPerguntaProfessor(tentativa.id, perg.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-start gap-2.5 ${
                    perg.respondida
                      ? 'bg-[#faf8f5] border-[#ece8e1] text-stone-400'
                      : 'bg-white border-[#ece8e1] text-stone-800 shadow-2xs'
                  }`}
                >
                  <button type="button" className="mt-0.5 text-stone-400">
                    {perg.respondida ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </button>
                  <span className={`flex-1 ${perg.respondida ? 'line-through opacity-70' : ''}`}>
                    {perg.pergunta}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        aberto={modalNovoTopico}
        aoFechar={() => setModalNovoTopico(false)}
        titulo="Adicionar Novo Tópico"
      >
        <form onSubmit={handleCriarTopico} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-500 mb-1">
              Título do Assunto
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Teoria Geral do Procedimento Comum"
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Subtópicos ou Detalhes
            </label>
            <textarea
              rows={2}
              placeholder="Ex: prazos, espécies, nulidades..."
              value={novosSubtopicos}
              onChange={(e) => setNovosSubtopicos(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Origem
            </label>
            <select
              value={novaOrigem}
              onChange={(e) => setNovaOrigem(e.target.value as OrigemTopico)}
              className="w-full p-2.5 rounded-xl border border-[#ece8e1] bg-white font-medium"
            >
              <option value="professor">Indicação do Professor</option>
              <option value="propria">Anotação Própria</option>
              <option value="programa">Programa Oficial</option>
            </select>
          </div>
          <div className="pt-3 border-t border-[#ece8e1] flex justify-end gap-2">
            <Button
              variant="soft"
              onClick={() => setModalNovoTopico(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="leaf"
            >
              Criar Tópico
            </Button>
          </div>
        </form>
      </Modal>
    </Modal>
  );
};
