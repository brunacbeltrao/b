import React from 'react';
import { useFdrStore } from '../../store/useStore';
import {
  selectIndices,
  selectProgressoPorCategoria,
  selectDisciplinasMatriculadas,
  selectEvolucaoIndices,
  selectAlertas,
} from '../../store/selectors';
import { preverFormatura } from '../../domain/planner';
import { MetricCard } from '../components/MetricCard';
import { ProgressBar } from '../components/ProgressBar';
import { IndicesChart } from '../components/IndicesChart';
import { Button } from '../components/Button';
import {
  ArrowRight,
  GraduationCap,
  Calendar,
} from 'lucide-react';

interface InicioPageProps {
  aoMudarAba: (aba: string) => void;
}

export const InicioPage: React.FC<InicioPageProps> = ({ aoMudarAba }) => {
  const store = useFdrStore();
  const indices = selectIndices(store);
  const progresso = selectProgressoPorCategoria(store);
  const matriculadas = selectDisciplinasMatriculadas(store);
  const evolucao = selectEvolucaoIndices(store);
  const alertas = selectAlertas(store);
  const previsao = preverFormatura(
    store.planoSemestres,
    store.perfil.prazoMinimo,
    store.perfil.prazoMaximo
  );

  return (
    <div className="space-y-8 pb-6">
      {/* Header Editorial */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-sm text-stone-600 max-w-2xl">
              5º período letivo ({store.perfil.periodoAtual}) • {progresso.total.atual}h integralizadas de {store.perfil.chExigida.total}h ({progresso.total.porcentagem}% do curso).
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-[#e6e4e8] shadow-2xs flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <div>
                <span className="text-xs text-stone-400 block font-semibold">
                  Formatura Estimada
                </span>
                <span className="font-mono font-bold text-stone-900">
                  {previsao.semestreConclusao || 'A definir'}
                </span>
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#e6e4e8] shadow-2xs flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <div>
                <span className="text-xs text-stone-400 block font-semibold">
                  Prazo Regulamentar
                </span>
                <span className="font-semibold text-stone-900">
                  {store.perfil.prazoMinimo} a {store.perfil.prazoMaximo}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destaque Diário & Métodos de Estudo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => aoMudarAba('hoje')}
          className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs text-left hover:border-stone-300 transition-all group cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-emerald-800 block">Ação Diária</span>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
              Tela Hoje: Aulas, Faltas em 1 toque & Calendário
            </h4>
            <p className="text-xs text-stone-500">
              Veja a escala de hoje, registre presença/falta sem complicação e exporte o calendário (.ics).
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0" />
        </button>
        <button
          onClick={() => aoMudarAba('estudos')}
          className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs text-left hover:border-stone-300 transition-all group cursor-pointer flex items-center justify-between gap-3"
        >
          <div className="space-y-1">
            <span className="text-xs font-medium text-emerald-800 block">Para Estudar Melhor</span>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
              Caderno de Erros, Fila de Leituras & Meta Semanal
            </h4>
            <p className="text-xs text-stone-500">
              Anexe fotos de provas, confira o que revisar, consulte fichamentos e jurisprudência favorita.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all shrink-0" />
        </button>
      </div>

      {/* Grid de Índices Oficiais */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-400 block">Rendimento Acadêmico</span>
            <h3 className="text-sm font-bold text-stone-900">
              Índices Oficiais do SIGAA
            </h3>
          </div>
          <Button
            variant="link"
            onClick={() => aoMudarAba('simulador')}
            className="text-xs"
          >
            <span>Simular notas</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
          </Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <MetricCard
            sigla="CR"
            rotulo="Rendimento"
            valor={indices.cr != null ? indices.cr.toFixed(2).replace('.', ',') : '-'}
            subtitulo={`Exato: ${indices.cr != null ? indices.cr.toFixed(4) : '-'}`}
            explicacao="Coeficiente de Rendimento: média ponderada pela carga horária de todas as disciplinas com nota (aprovações e reprovações)."
            formula="CR = Σ(Nota × CH) / Σ(CH com nota) = 10.236 / 1.320"
            destaque
          />
          <MetricCard
            sigla="MC"
            rotulo="Conclusão"
            valor={indices.mc != null ? indices.mc.toFixed(2).replace('.', ',') : '-'}
            subtitulo={`${indices.chAprovada}h aprovadas`}
            explicacao="Média de Conclusão: média ponderada apenas das disciplinas com êxito (APR e APRN)."
            formula="MC = Σ(Nota × CH) / Σ(CH aprovada) = 9.936 / 1.200"
            destaque
          />
          <MetricCard
            sigla="MCN"
            rotulo="Normalizada"
            valor={indices.mcn != null ? Math.round(indices.mcn).toString() : '-'}
            subtitulo={`μ=${store.perfil.parametrosIndices.mu} σ=${store.perfil.parametrosIndices.sigma}`}
            explicacao="Média de Conclusão Normalizada em relação aos concluintes dos últimos 5 anos de Direito UFPE."
            formula="MCN = 500 + 100 × (MC - μ) / σ"
          />
          <MetricCard
            sigla="IECH"
            rotulo="Eficiência Geral"
            valor={indices.iech != null ? indices.iech.toFixed(4).replace('.', ',') : '-'}
            subtitulo="90,9% aproveitamento"
            explicacao="Índice de Eficiência em Carga Horária: razão entre a CH aprovada e a CH em que houve matrícula efetiva."
            formula="IECH = CH aprovada / CH efetiva = 1.200 / 1.320"
          />
          <MetricCard
            sigla="IECHP"
            rotulo="Eficiência 2026.1"
            valor={indices.iechp != null ? indices.iechp.toFixed(4).replace('.', ',') : '-'}
            subtitulo="Período anterior"
            explicacao="IECH específico do período de referência (2026.1): 270h aprovadas de 390h matriculadas."
            formula="IECHP = 270 / 390 = 0,6923"
          />
          <MetricCard
            sigla="IEPL"
            rotulo="Prog. Linear"
            valor={indices.iepl != null ? indices.iepl.toFixed(4).replace('.', ',') : '-'}
            subtitulo="Esperado: 1.260h"
            explicacao="Índice de Eficiência de Progressão Linear relativo à duração padrão do curso de Direito."
            formula="IEPL = 1.200 / 1.260 = 0,9524"
          />
        </div>
      </section>

      {/* Alertas */}
      {alertas.length > 0 && (
        <section className="space-y-2">
          <span className="text-xs font-medium text-stone-400 block">Pontos de Atenção</span>
          <div className="bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs divide-y divide-[#e6e4e8]">
            {alertas.map((a) => (
              <div
                key={a.id}
                className="px-4 py-3 flex items-start gap-3 text-xs"
              >
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    a.tipo === 'erro'
                      ? 'bg-rose-600'
                      : a.tipo === 'aviso'
                      ? 'bg-amber-500'
                      : 'bg-emerald-600'
                  }`}
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-stone-900">
                    {a.titulo}
                  </h4>
                  <p className="text-stone-500 mt-0.5 leading-relaxed">
                    {a.descricao}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Duas Colunas: Progresso por Categoria & Disciplinas em Curso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e6e4e8]">
            <div>
              <span className="text-xs font-medium text-stone-400 block">Carga Horária</span>
              <h3 className="font-bold text-stone-900 text-sm">
                Integralização Curricular
              </h3>
            </div>
            <span className="text-sm font-mono font-bold text-stone-900">
              {progresso.total.porcentagem}%
            </span>
          </div>
          <div className="space-y-3.5 pt-1">
            <ProgressBar
              titulo="Disciplinas Obrigatórias"
              subtitulo="65 componentes da grade"
              atual={progresso.obrigatorias.atual}
              total={progresso.obrigatorias.total}
              porcentagem={progresso.obrigatorias.porcentagem}
              corBarra="bg-[#8b1538]"
            />
            <ProgressBar
              titulo="Eletivas do Perfil"
              subtitulo="Catálogo da FDR"
              atual={progresso.eletivasPerfil.atual}
              total={progresso.eletivasPerfil.total}
              porcentagem={progresso.eletivasPerfil.porcentagem}
              corBarra="bg-[#8b1538]"
            />
            <ProgressBar
              titulo="Eletivas Livres"
              subtitulo="UFPE Geral"
              atual={progresso.eletivasLivres.atual}
              total={progresso.eletivasLivres.total}
              porcentagem={progresso.eletivasLivres.porcentagem}
              corBarra="bg-[#625d66]"
            />
            <ProgressBar
              titulo="Atividades Complementares"
              subtitulo="Pesquisa, extensão, monitoria e eventos"
              atual={progresso.complementares.atual}
              total={progresso.complementares.total}
              porcentagem={progresso.complementares.porcentagem}
              corBarra="bg-amber-600"
            />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#e6e4e8]">
              <div>
                <span className="text-xs font-medium text-stone-400 block">Semestre {store.perfil.periodoAtual}</span>
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                  <span>Disciplinas em Curso</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => aoMudarAba('semestre')}
                className="text-xs text-stone-500 hover:text-stone-900"
              >
                <span>Abrir semestre</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 inline" />
              </Button>
            </div>
            <div className="mt-3 divide-y divide-[#e6e4e8]">
              {matriculadas.map(({ tentativa, componente }) => {
                const topicos = store.topicos.filter((t) => t.tentativaId === tentativa.id);
                const concluidos = topicos.filter((t) => t.concluido).length;
                const pct = topicos.length > 0 ? Math.round((concluidos / topicos.length) * 100) : 0;
                return (
                  <div
                    key={tentativa.id}
                    onClick={() => aoMudarAba('semestre')}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50 px-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-stone-900">
                          {componente.codigo}
                        </span>
                        <h4 className="text-xs font-medium text-stone-800">
                          {componente.nome}
                        </h4>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {componente.ch}h • {concluidos}/{topicos.length} tópicos concluídos ({pct}%)
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-[#f6f5f7] text-stone-600 border border-[#e6e4e8]">
                      MATR
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-3 border-t border-[#e6e4e8] flex items-center justify-between text-xs text-stone-400">
            <span>Acompanhe provas, faltas e guias de estudo</span>
            <Button
              variant="link"
              onClick={() => aoMudarAba('semestre')}
            >
              Semestre 2026.2 →
            </Button>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolução CR e MC */}
      <section className="p-5 sm:p-6 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3">
        <div className="pb-3 border-b border-[#e6e4e8]">
          <span className="text-xs font-medium text-stone-400 block">Histórico</span>
          <h3 className="font-bold text-stone-900 text-sm">
            Evolução Semestral do CR e da MC
          </h3>
        </div>
        <IndicesChart pontos={evolucao} />
      </section>
    </div>
  );
};
