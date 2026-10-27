import React, { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useFdrStore } from '../../store/useStore';
import { selectDisciplinasMatriculadas } from '../../store/selectors';
import type { HorarioAula } from '../../domain/types';
import { Modal } from './Modal';

const DIAS = [
  { dia: 1, nome: 'Segunda' },
  { dia: 2, nome: 'Terça' },
  { dia: 3, nome: 'Quarta' },
  { dia: 4, nome: 'Quinta' },
  { dia: 5, nome: 'Sexta' },
  { dia: 6, nome: 'Sábado' },
  { dia: 0, nome: 'Domingo' },
];

const campo =
  'w-full h-9 px-3 rounded-md border border-[#e6e4e8] bg-white text-sm text-[#1c1a1e] focus:outline-none focus:border-[#8b1538]';
const rotulo = 'block text-[13px] font-medium text-stone-700 mb-1';

type Rascunho = Omit<HorarioAula, 'id'> & { id?: string };

/** Weekly timetable editor: add, change and remove the classes of the current semester. */
export const HorariosModal: React.FC<{ aberto: boolean; aoFechar: () => void }> = ({ aberto, aoFechar }) => {
  const store = useFdrStore();
  const disciplinas = selectDisciplinasMatriculadas(store);
  const horarios = store.horariosAulas || [];
  const [rascunho, setRascunho] = useState<Rascunho | null>(null);

  const nomeDe = (codigo: string) =>
    store.componentes.find((c) => c.codigo === codigo)?.nome || codigo;

  const novo = (dia = 1): Rascunho => {
    const primeira = disciplinas[0];
    return {
      tentativaId: primeira?.tentativa.id || '',
      codigo: primeira?.componente.codigo || '',
      diaSemana: dia,
      horarioInicio: '18:40',
      horarioFim: '20:20',
      sala: '',
    };
  };

  const salvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rascunho || !rascunho.codigo || !rascunho.horarioInicio || !rascunho.horarioFim) return;
    const { id, ...dados } = rascunho;
    const limpo = { ...dados, sala: dados.sala?.trim() || undefined };
    if (id) store.editarHorarioAula(id, limpo);
    else store.adicionarHorarioAula(limpo);
    setRascunho(null);
  };

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Horários das aulas" larguraMaxima="max-w-lg">
      {rascunho ? (
        <form onSubmit={salvar} className="space-y-4">
          <div>
            <label className={rotulo} htmlFor="h-disc">
              Disciplina
            </label>
            <select
              id="h-disc"
              className={campo}
              value={rascunho.tentativaId}
              onChange={(e) => {
                const d = disciplinas.find((x) => x.tentativa.id === e.target.value);
                if (d) setRascunho({ ...rascunho, tentativaId: d.tentativa.id, codigo: d.componente.codigo });
              }}
            >
              {disciplinas.map((d) => (
                <option key={d.tentativa.id} value={d.tentativa.id}>
                  {d.componente.nome}
                </option>
              ))}
            </select>
            {disciplinas.length === 0 && (
              <p className="mt-1 text-xs text-amber-800">
                Nenhuma disciplina matriculada neste semestre. Cadastre em Semestre primeiro.
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={rotulo} htmlFor="h-dia">
                Dia
              </label>
              <select
                id="h-dia"
                className={campo}
                value={rascunho.diaSemana}
                onChange={(e) => setRascunho({ ...rascunho, diaSemana: Number(e.target.value) })}
              >
                {DIAS.map((d) => (
                  <option key={d.dia} value={d.dia}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={rotulo} htmlFor="h-ini">
                Início
              </label>
              <input
                id="h-ini"
                type="time"
                className={campo}
                value={rascunho.horarioInicio}
                onChange={(e) => setRascunho({ ...rascunho, horarioInicio: e.target.value })}
              />
            </div>
            <div>
              <label className={rotulo} htmlFor="h-fim">
                Fim
              </label>
              <input
                id="h-fim"
                type="time"
                className={campo}
                value={rascunho.horarioFim}
                onChange={(e) => setRascunho({ ...rascunho, horarioFim: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={rotulo} htmlFor="h-sala">
              Sala
            </label>
            <input
              id="h-sala"
              className={campo}
              value={rascunho.sala || ''}
              placeholder="Opcional"
              onChange={(e) => setRascunho({ ...rascunho, sala: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <div>
              {rascunho.id && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Remover este horário?')) {
                      store.removerHorarioAula(rascunho.id!);
                      setRascunho(null);
                    }
                  }}
                  className="h-9 px-3 rounded-md border border-[#ead3da] text-sm text-[#8b1538] hover:bg-[#f7ecef]"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRascunho(null)}
                className="h-9 px-3 rounded-md text-sm text-stone-600 hover:bg-stone-100"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={!rascunho.codigo}
                className="h-9 px-3.5 rounded-md bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-sm font-medium disabled:opacity-50"
              >
                Salvar
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-[13px] text-stone-600">
            Toque numa aula para mudar o dia, o horário ou a sala. As faltas e a presença continuam ligadas à disciplina.
          </p>
          <ul className="divide-y divide-[#e6e4e8] border-y border-[#e6e4e8]">
            {DIAS.map(({ dia, nome }) => {
              const doDia = horarios
                .filter((h) => h.diaSemana === dia)
                .sort((a, b) => a.horarioInicio.localeCompare(b.horarioInicio));
              if (doDia.length === 0 && (dia === 0 || dia === 6)) return null;
              return (
                <li key={dia} className="py-2.5 sm:grid sm:grid-cols-[90px_1fr] sm:gap-3">
                  <div className="text-sm font-medium text-[#1c1a1e] pt-1.5">{nome}</div>
                  <div>
                    {doDia.length === 0 && <div className="text-[13px] text-stone-400 py-1.5">Sem aula</div>}
                    {doDia.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setRascunho({ ...h })}
                        className="group w-full flex items-center gap-3 py-1.5 text-left rounded-md hover:bg-stone-50 -mx-2 px-2"
                      >
                        <span className="w-24 shrink-0 text-[13px] text-stone-500 tabular-nums">
                          {h.horarioInicio}–{h.horarioFim}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-[#1c1a1e] truncate">{nomeDe(h.codigo)}</span>
                          {h.sala && <span className="block text-xs text-stone-500 truncate">{h.sala}</span>}
                        </span>
                        <Pencil className="w-3.5 h-3.5 text-stone-400 sm:opacity-0 sm:group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between gap-2">
            {horarios.length > 0 ? (
              <button
                onClick={() => {
                  if (window.confirm('Apagar todos os horários? Você pode cadastrar de novo depois.'))
                    horarios.forEach((h) => store.removerHorarioAula(h.id));
                }}
                className="h-9 px-3 rounded-md text-sm text-stone-500 hover:text-[#8b1538] hover:bg-stone-100 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                Apagar todos
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={() => setRascunho(novo())}
              className="h-9 px-3.5 rounded-md bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-sm font-medium inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Nova aula
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
