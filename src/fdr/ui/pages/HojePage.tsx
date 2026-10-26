import React, { useState } from 'react';
import { useFdrStore } from '../../store/useStore';
import {
  selectAulasDoDia,
  selectStatusFaltasPorDisciplina,
  selectProximosEventos,
  selectDisciplinasMatriculadas,
} from '../../store/selectors';
import { exportarIcsParaDownload } from '../../domain/calendar';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Plus,
  BookOpen,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

interface HojePageProps {
  aoMudarAba: (aba: string) => void;
}

const DIAS_SEMANA_NOMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const HojePage: React.FC<HojePageProps> = ({ aoMudarAba }) => {
  const store = useFdrStore();
  const hoje = new Date();
  const diaSemanaHoje = hoje.getDay();
  const dataHojeStr = hoje.toISOString().split('T')[0];
  const [diaSelecionado, setDiaSelecionado] = useState<number>(
    diaSemanaHoje >= 1 && diaSemanaHoje <= 5 ? diaSemanaHoje : 1
  );

  const aulas = selectAulasDoDia(store, diaSelecionado, dataHojeStr);
  const statusFaltasGeral = selectStatusFaltasPorDisciplina(store);
  const proximosEventos = selectProximosEventos(store);
  const matriculadas = selectDisciplinasMatriculadas(store);

  const idsTentativasMatriculadas = new Set(matriculadas.map((m) => m.tentativa.id));
  const topicosPendentes = store.topicos
    .filter((t) => idsTentativasMatriculadas.has(t.tentativaId) && !t.concluido)
    .slice(0, 4);

  const faltasEmRisco = statusFaltasGeral.filter((sf) => sf.emRisco);

  const [modalLembreteAberto, setModalLembreteAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaData, setNovaData] = useState(dataHojeStr);
  const [novoHorario, setNovoHorario] = useState('18:40');
  const [novoTipo, setNovoTipo] = useState<'prova' | 'trabalho' | 'matricula' | 'trancamento' | 'academico'>('prova');
  const [novaDisciplina, setNovaDisciplina] = useState('PG520');
  const [novaDescricao, setNovaDescricao] = useState('');

  const salvarNovoLembrete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim()) return;
    store.adicionarLembreteCalendario({
      titulo: novoTitulo.trim(),
      data: novaData,
      horario: novoHorario,
      tipo: novoTipo,
      disciplinaCodigo: novaDisciplina,
      descricao: novaDescricao.trim() || undefined,
    });
    setNovoTitulo('');
    setNovaDescricao('');
    setModalLembreteAberto(false);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Top Banner Editorial */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#e6e4e8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-stone-400">Dia a dia • FDR UFPE</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              5º Período Noturno
            </span>
          </div>
          <h2 className="font-serif-title text-2xl font-semibold text-stone-900 mt-1">
            Hoje na Faculdade
          </h2>
          <p className="text-xs text-stone-500">
            {DIAS_SEMANA_NOMES[hoje.getDay()]},{' '}
            {hoje.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportarIcsParaDownload(store.lembretesCalendario || [])}
            title="Baixar arquivo .ics para sincronizar com Google Agenda ou Apple Calendar"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-emerald-700" />
            <span>Sincronizar Agenda (.ics)</span>
          </Button>
          <Button
            variant="leaf"
            size="sm"
            onClick={() => setModalLembreteAberto(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Novo Lembrete</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Faltas em Risco */}
      {faltasEmRisco.length > 0 && (
        <div className="p-4 border border-amber-300 bg-amber-50/70 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900">
                Alerta de Frequência: {faltasEmRisco.map((f) => f.codigo).join(', ')}
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                Você atingiu 50% ou mais do limite de 25% de faltas em{' '}
                {faltasEmRisco.map((f) => `${f.nome} (${f.faltasAtuaisHoras}h de ${f.maxFaltasHoras}h permitidas)`).join(', ')}.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => aoMudarAba('semestre')}
            className="text-xs shrink-0 self-end sm:self-center"
          >
            Ver Semestre 2026.2
          </Button>
        </div>
      )}

      {/* Seletor de Dias da Semana (Segunda a Sexta) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-stone-400">
            Aulas da semana & Registro de presença
          </span>
          <span className="text-xs text-stone-500 font-medium">
            {diaSelecionado === diaSemanaHoje ? 'Visualizando hoje' : 'Alternando dia'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {[
            { dia: 1, rotulo: 'Seg', desc: 'Processo / Const' },
            { dia: 2, rotulo: 'Ter', desc: 'Civil / Processo' },
            { dia: 3, rotulo: 'Qua', desc: 'Const / Civil' },
            { dia: 4, rotulo: 'Qui', desc: 'Processo / Civil' },
            { dia: 5, rotulo: 'Sex', desc: 'Constitucional' },
          ].map((item) => {
            const ehHoje = diaSemanaHoje === item.dia;
            const selecionado = diaSelecionado === item.dia;
            return (
              <button
                key={item.dia}
                onClick={() => setDiaSelecionado(item.dia)}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  selecionado
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-semibold shadow-2xs'
                    : 'border-[#e6e4e8] bg-white hover:bg-stone-50 text-stone-600'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm font-medium">{item.rotulo}</span>
                  {ehHoje && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  )}
                </div>
                <span className="block text-[10px] opacity-75 truncate mt-0.5">
                  {item.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Aulas do dia selecionado + Falta em um toque */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Aulas em {DIAS_SEMANA_NOMES[diaSelecionado]}</span>
            </h3>
            <span className="text-xs text-stone-400">
              Toque para marcar presença ou falta
            </span>
          </div>

          {aulas.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-sm bg-white rounded-2xl border border-[#e6e4e8]">
              Nenhuma aula cadastrada para este dia da semana.
            </div>
          ) : (
            <div className="space-y-3">
              {aulas.map((aula) => {
                const sf = aula.statusFalta;
                const estaPresente = aula.presencaRegistrada === true;
                const estaAusente = aula.presencaRegistrada === false;
                return (
                  <div
                    key={aula.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#f6f5f7] text-stone-800 border border-[#e6e4e8]">
                          {aula.codigo}
                        </span>
                        <span className="text-xs font-mono text-stone-500">
                          {aula.horarioInicio} - {aula.horarioFim}
                        </span>
                        {aula.sala && (
                          <span className="text-[11px] text-stone-400 truncate">
                            • {aula.sala}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-semibold text-stone-900 leading-snug">
                        {aula.nome}
                      </h4>
                      {/* Medidor de Limite de 25% */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <span>Faltas: {sf.faltasAtuaisHoras}h / {sf.maxFaltasHoras}h</span>
                            <span className="text-stone-400">({sf.aulasFaltadas} aulas de {sf.maxAulasFaltadas} permitidas)</span>
                          </span>
                          <span
                            className={`font-mono text-[11px] font-medium ${
                              sf.reprovadaPorFalta
                                ? 'text-rose-600'
                                : sf.emRisco
                                ? 'text-amber-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {sf.porcentagemDoLimite}% do teto de 25%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#e6e4e8] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              sf.reprovadaPorFalta
                                ? 'bg-rose-600'
                                : sf.emRisco
                                ? 'bg-amber-500'
                                : 'bg-emerald-700'
                            }`}
                            style={{ width: `${Math.min(100, sf.porcentagemDoLimite)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {/* Botões de Presença e Falta */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e6e4e8]">
                      <button
                        onClick={() =>
                          store.registrarPresencaOuFalta(
                            aula.tentativaId,
                            dataHojeStr,
                            true,
                            2
                          )
                        }
                        className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          estaPresente
                            ? 'bg-emerald-700 text-white shadow-2xs font-semibold'
                            : 'bg-[#f6f5f7] text-stone-600 hover:bg-emerald-50 hover:text-emerald-800 border border-[#e6e4e8]'
                        }`}
                        title="Marcar presença na aula de hoje"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Presente</span>
                      </button>
                      <button
                        onClick={() =>
                          store.registrarPresencaOuFalta(
                            aula.tentativaId,
                            dataHojeStr,
                            false,
                            2
                          )
                        }
                        className={`flex-1 sm:flex-none px-3.5 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          estaAusente
                            ? 'bg-rose-700 text-white shadow-2xs font-semibold'
                            : 'bg-[#f6f5f7] text-stone-600 hover:bg-rose-50 hover:text-rose-700 border border-[#e6e4e8]'
                        }`}
                        title="Registrar falta (computa 2h de falta na matéria)"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Falta</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tópicos a Estudar Hoje */}
          <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-800">
                  Tópicos sugeridos para estudar hoje
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => aoMudarAba('estudos')}
                className="text-xs"
              >
                <span>Fila de estudo</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
            {topicosPendentes.length === 0 ? (
              <p className="text-xs text-stone-400 py-2">
                Todos os tópicos do semestre atual já foram concluídos! Parabéns.
              </p>
            ) : (
              <div className="space-y-2">
                {topicosPendentes.map((topico) => {
                  const tent = store.tentativas.find((t) => t.id === topico.tentativaId);
                  return (
                    <div
                      key={topico.id}
                      className="p-3 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] flex items-start justify-between gap-3 hover:border-emerald-700/40 transition-all"
                    >
                      <div className="flex items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={topico.concluido}
                          onChange={(e) => store.marcarTopico(topico.id, e.target.checked)}
                          className="mt-1 w-4 h-4 rounded text-emerald-700 accent-emerald-700 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2 font-mono text-[11px] text-stone-400">
                            <span>{tent?.codigo || 'FDR'}</span>
                            <span>• Tema {topico.ordem}</span>
                          </div>
                          <p className="text-xs font-semibold text-stone-800 mt-0.5">
                            {topico.titulo}
                          </p>
                          {topico.subtopicos && (
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {topico.subtopicos}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => store.marcarTopico(topico.id, true)}
                        title="Concluir tema"
                      >
                        <CheckCircle2 className="w-4 h-4 text-stone-400 hover:text-emerald-700" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Coluna Lateral: Calendário de Próximas Provas */}
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-stone-800">
                  Próximas Provas & Prazos
                </h3>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                2026.2
              </span>
            </div>
            <div className="space-y-2.5">
              {proximosEventos.slice(0, 5).map((evt) => {
                const ehUrgente = evt.diasRestantes >= 0 && evt.diasRestantes <= 5;
                const passou = evt.diasRestantes < 0;
                return (
                  <div
                    key={evt.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      ehUrgente
                        ? 'border-amber-300 bg-amber-50/50'
                        : 'border-[#e6e4e8] bg-[#f6f5f7]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          evt.tipo === 'prova'
                            ? 'bg-rose-100 text-rose-800'
                            : evt.tipo === 'trabalho'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {evt.tipo.toUpperCase()} {evt.disciplinaCodigo ? `• ${evt.disciplinaCodigo}` : ''}
                      </span>
                      <span
                        className={`font-mono font-medium ${
                          passou
                            ? 'text-stone-400'
                            : ehUrgente
                            ? 'text-amber-700 font-semibold'
                            : 'text-emerald-800'
                        }`}
                      >
                        {passou
                          ? 'Concluído'
                          : evt.diasRestantes === 0
                          ? 'HOJE!'
                          : evt.diasRestantes === 1
                          ? 'Amanhã'
                          : `Em ${evt.diasRestantes} dias`}
                      </span>
                    </div>
                    <h4 className="font-semibold text-stone-900 text-xs">
                      {evt.titulo}
                    </h4>
                    {evt.descricao && (
                      <p className="text-stone-500 mt-1 line-clamp-2 text-[11px]">
                        {evt.descricao}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-stone-400 font-mono text-[10px] mt-2 pt-2 border-t border-[#e6e4e8]">
                      <span>{evt.data.split('-').reverse().join('/')}</span>
                      {evt.horario && <span>às {evt.horario}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => exportarIcsParaDownload(store.lembretesCalendario || [])}
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>Sincronizar Calendário (.ics)</span>
            </Button>
          </div>

          {/* Card: Atalho para Estudos & Leituras */}
          <div className="p-5 bg-[#f6f5f7] rounded-2xl border border-[#e6e4e8] space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-stone-800">
                Para Estudar Melhor
              </h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Acesse o Caderno de Erros com fotos de provas escaneadas, a Fila de Leituras com fichamento e os favoritos doutrinários.
            </p>
            <Button
              variant="leaf"
              size="sm"
              className="w-full text-xs"
              onClick={() => aoMudarAba('estudos')}
            >
              Abrir Caderno & Leituras
            </Button>
          </div>
        </div>
      </div>

      {/* Modal: Adicionar Lembrete */}
      <Modal
        aberto={modalLembreteAberto}
        aoFechar={() => setModalLembreteAberto(false)}
        titulo="Novo Lembrete ou Prazo Acadêmico"
        subtitulo="Adicione provas, entregas de trabalhos ou datas de matrícula"
      >
        <form onSubmit={salvarNovoLembrete} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Título do Evento *
            </label>
            <input
              type="text"
              required
              value={novoTitulo}
              onChange={(e) => setNovoTitulo(e.target.value)}
              placeholder="Ex: 1ª Avaliação - Processo Civil 2"
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-600 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={novaData}
                onChange={(e) => setNovaData(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
              />
            </div>
            <div>
              <label className="block font-medium text-stone-600 mb-1">
                Horário
              </label>
              <input
                type="time"
                value={novoHorario}
                onChange={(e) => setNovoHorario(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-600 mb-1">
                Tipo
              </label>
              <select
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
              >
                <option value="prova">Prova</option>
                <option value="trabalho">Trabalho / Fichamento</option>
                <option value="matricula">Matrícula</option>
                <option value="trancamento">Trancamento</option>
                <option value="academico">Acadêmico / Geral</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-stone-600 mb-1">
                Disciplina
              </label>
              <select
                value={novaDisciplina}
                onChange={(e) => setNovaDisciplina(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
              >
                {matriculadas.map((m) => (
                  <option key={m.componente.codigo} value={m.componente.codigo}>
                    {m.componente.codigo} - {m.componente.nome}
                  </option>
                ))}
                <option value="">Geral (UFPE / FDR)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Descrição ou Conteúdo Programático
            </label>
            <textarea
              value={novaDescricao}
              onChange={(e) => setNovaDescricao(e.target.value)}
              placeholder="Ex: Petição inicial, contestação e reconvenção (arts. 319 a 343 do CPC)."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#e6e4e8]">
            <Button
              variant="outline"
              type="button"
              onClick={() => setModalLembreteAberto(false)}
            >
              Cancelar
            </Button>
            <Button variant="leaf" type="submit">
              Salvar Lembrete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
