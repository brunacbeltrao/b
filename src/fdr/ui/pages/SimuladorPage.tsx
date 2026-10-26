import React, { useState } from 'react';
import { useFdrStore } from '../../store/useStore';
import { selectIndices, selectDisciplinasMatriculadas } from '../../store/selectors';
import {
  simularCenario,
  calcularMediaNecessariaAlvo,
  ItemSimulado,
} from '../../domain/simulator';
import { Button } from '../components/Button';
import {
  Save,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const SimuladorPage: React.FC = () => {
  const store = useFdrStore();
  const indicesAtuais = selectIndices(store);
  const matriculadas = selectDisciplinasMatriculadas(store);
  const [abaAtiva, setAbaAtiva] = useState<'cenarios' | 'inverso'>('cenarios');

  const [notasSimuladas, setNotasSimuladas] = useState<Record<string, number>>({
    PG520: 9.5,
    PG525: 9.5,
    PR433: 9.5,
  });
  const [situacoesSimuladas, setSituacoesSimuladas] = useState<Record<string, 'APR' | 'REP'>>({
    PG520: 'APR',
    PG525: 'APR',
    PR433: 'APR',
  });
  const [nomeCenarioParaSalvar, setNomeCenarioParaSalvar] = useState('');
  const [feedbackSalvo, setFeedbackSalvo] = useState(false);

  const [crAlvo, setCrAlvo] = useState<number>(9.0);
  const [chRestante, setChRestante] = useState<number>(2700);
  const [excluirComplementares, setExcluirComplementares] = useState<boolean>(false);

  const itensSimulados: ItemSimulado[] = Object.entries(notasSimuladas).map(
    ([codigo, nota]) => ({
      codigo,
      nota: typeof nota === 'number' ? nota : Number(nota),
      situacao: situacoesSimuladas[codigo] ?? 'APR',
    })
  );

  const resultadoSimulacao = simularCenario(
    store.tentativas,
    store.componentes,
    store.perfil.parametrosIndices,
    itensSimulados,
    '2026.2'
  );

  const aplicarMesmaNota = (nota: number, situacao: 'APR' | 'REP' = 'APR') => {
    const novasNotas: Record<string, number> = {};
    const novasSituacoes: Record<string, 'APR' | 'REP'> = {};
    matriculadas.forEach(({ componente }) => {
      novasNotas[componente.codigo] = nota;
      novasSituacoes[componente.codigo] = situacao;
    });
    setNotasSimuladas(novasNotas);
    setSituacoesSimuladas(novasSituacoes);
  };

  const handleSalvarCenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCenarioParaSalvar.trim()) return;
    store.salvarCenario(nomeCenarioParaSalvar.trim(), notasSimuladas);
    setNomeCenarioParaSalvar('');
    setFeedbackSalvo(true);
    setTimeout(() => setFeedbackSalvo(false), 2500);
  };

  const chFuturaComNota = excluirComplementares ? chRestante - 240 : chRestante;
  const resultadoInverso = calcularMediaNecessariaAlvo(
    crAlvo,
    indicesAtuais.pontosComNota,
    indicesAtuais.chComNota,
    chFuturaComNota
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Header com Abas */}
      <div className="space-y-4 pb-4 border-b border-[#e6e4e8]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-stone-400 block">Simulações de Desempenho</span>
            <h2 className="font-serif-title text-2xl font-semibold text-stone-900 mt-1">
              Simulador de Notas e Metas
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Simule o impacto de notas no CR, MC e MCN sem alterar o histórico real.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-[#e6e4e8]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAbaAtiva('cenarios')}
              className={abaAtiva === 'cenarios' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-500'}
            >
              Simular Semestre
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAbaAtiva('inverso')}
              className={abaAtiva === 'inverso' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-500'}
            >
              Cálculo Inverso (CR-Alvo)
            </Button>
          </div>
        </div>
      </div>

      {abaAtiva === 'cenarios' && (
        <div className="space-y-6">
          {/* Cartões de Comparação: Atual vs Simulado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs font-medium text-stone-400">CR (Rendimento)</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  {resultadoSimulacao.deltaCr >= 0 ? '+' : ''}
                  {resultadoSimulacao.deltaCr.toFixed(4).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs text-stone-400">Atual: </span>
                  <span className="text-sm font-mono text-stone-500">
                    {indicesAtuais.cr?.toFixed(4).replace('.', ',')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-400">Simulado: </span>
                  <span className="text-2xl font-light font-mono text-stone-900">
                    {resultadoSimulacao.simulado.cr?.toFixed(4).replace('.', ',')}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 pt-1 border-t border-[#e6e4e8]">
                {resultadoSimulacao.simulado.chComNota}h computadas com nota.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs font-medium text-stone-400">MC (Conclusão)</span>
                <span className="font-mono text-emerald-700 font-semibold">
                  {resultadoSimulacao.deltaMc >= 0 ? '+' : ''}
                  {resultadoSimulacao.deltaMc.toFixed(4).replace('.', ',')}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs text-stone-400">Atual: </span>
                  <span className="text-sm font-mono text-stone-500">
                    {indicesAtuais.mc?.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-400">Simulado: </span>
                  <span className="text-2xl font-light font-mono text-emerald-800 font-semibold">
                    {resultadoSimulacao.simulado.mc?.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 pt-1 border-t border-[#e6e4e8]">
                {resultadoSimulacao.simulado.chAprovada}h aprovadas com êxito.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-xs font-medium text-stone-400">MCN Normalizada</span>
                <span className="font-mono text-stone-500">
                  {resultadoSimulacao.deltaMcn >= 0 ? '+' : ''}
                  {Math.round(resultadoSimulacao.deltaMcn)} pts
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs text-stone-400">Atual: </span>
                  <span className="text-sm font-mono text-stone-500">
                    {indicesAtuais.mcn != null ? Math.round(indicesAtuais.mcn) : '-'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-400">Simulado: </span>
                  <span className="text-2xl font-light font-mono text-stone-900">
                    {resultadoSimulacao.simulado.mcn != null
                      ? Math.round(resultadoSimulacao.simulado.mcn)
                      : '-'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 pt-1 border-t border-[#e6e4e8]">
                Padronizada na média dos concluintes.
              </p>
            </div>
          </div>

          {/* Atalhos Rápidos */}
          <div className="p-4 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-xs font-medium text-stone-400">Atalhos rápidos:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="soft"
                size="sm"
                onClick={() => aplicarMesmaNota(10.0, 'APR')}
              >
                10,0 em todas (CR: 8,024 • MC: 8,504)
              </Button>
              <Button
                variant="soft"
                size="sm"
                onClick={() => aplicarMesmaNota(9.5, 'APR')}
              >
                9,5 em todas (CR: 7,964 • MC: 8,44)
              </Button>
              <Button
                variant="soft"
                size="sm"
                onClick={() => aplicarMesmaNota(8.0, 'APR')}
              >
                8,0 em todas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => aplicarMesmaNota(3.0, 'REP')}
                className="text-rose-600 hover:bg-rose-50"
              >
                Simular Reprovação (3,0)
              </Button>
            </div>
          </div>

          {/* Tabela de Disciplinas Matriculadas em 2026.2 */}
          <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4">
            <div className="pb-2 border-b border-[#e6e4e8]">
              <span className="text-xs font-medium text-stone-400 block">Disciplinas em Avaliação</span>
              <h3 className="font-bold text-sm text-stone-900">
                Semestre 2026.2 ({matriculadas.reduce((s, m) => s + m.componente.ch, 0)}h)
              </h3>
            </div>
            <div className="divide-y divide-[#e6e4e8]">
              {matriculadas.map(({ componente }) => {
                const notaAtual = notasSimuladas[componente.codigo] ?? 7.0;
                const situacaoAtual = situacoesSimuladas[componente.codigo] ?? 'APR';
                return (
                  <div
                    key={componente.codigo}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-stone-400 font-semibold">
                          {componente.codigo}
                        </span>
                        <h4 className="font-semibold text-sm text-stone-900">
                          {componente.nome}
                        </h4>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">
                        {componente.ch} horas
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={situacaoAtual}
                        onChange={(e) =>
                          setSituacoesSimuladas({
                            ...situacoesSimuladas,
                            [componente.codigo]: e.target.value as 'APR' | 'REP',
                          })
                        }
                        className="h-8 px-2.5 text-xs rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
                      >
                        <option value="APR">Aprovação</option>
                        <option value="REP">Reprovação</option>
                      </select>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.1"
                          value={notaAtual}
                          onChange={(e) =>
                            setNotasSimuladas({
                              ...notasSimuladas,
                              [componente.codigo]: parseFloat(e.target.value),
                            })
                          }
                          className="w-24 accent-emerald-700 cursor-pointer"
                        />
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={notaAtual}
                          onChange={(e) =>
                            setNotasSimuladas({
                              ...notasSimuladas,
                              [componente.codigo]: Math.min(
                                10,
                                Math.max(0, parseFloat(e.target.value) || 0)
                              ),
                            })
                          }
                          className="w-16 h-8 px-2 text-center font-mono text-xs rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Salvar Cenário */}
            <form onSubmit={handleSalvarCenario} className="pt-3 border-t border-[#e6e4e8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nome do cenário para salvar..."
                  value={nomeCenarioParaSalvar}
                  onChange={(e) => setNomeCenarioParaSalvar(e.target.value)}
                  className="p-2 rounded-xl border border-[#e6e4e8] bg-white max-w-sm text-xs text-stone-800"
                />
                <Button
                  type="submit"
                  variant="leaf"
                  disabled={!nomeCenarioParaSalvar.trim()}
                >
                  <Save className="w-3.5 h-3.5 mr-1" />
                  <span>Salvar</span>
                </Button>
              </div>
              {feedbackSalvo && (
                <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cenário gravado</span>
                </span>
              )}
            </form>
          </div>

          {/* Cenários Salvos */}
          {store.cenarios.length > 0 && (
            <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3">
              <span className="text-xs font-medium text-stone-400 block">Cenários Gravados</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {store.cenarios.map((cenario) => (
                  <div
                    key={cenario.id}
                    className="p-3 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] flex flex-col justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-semibold text-xs text-stone-900">
                        {cenario.nome}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-mono mt-1">
                        {Object.entries(cenario.notas)
                          .map(([cod, nota]) => `${cod}: ${nota.toFixed(1)}`)
                          .join(' • ')}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-[#e6e4e8] flex items-center justify-between text-xs">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          setNotasSimuladas({ ...cenario.notas });
                        }}
                      >
                        Carregar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => store.removerCenario(cenario.id)}
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {abaAtiva === 'inverso' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4">
            <div>
              <span className="text-xs font-medium text-stone-400 block">Planejamento Reverso</span>
              <h3 className="font-bold text-sm text-stone-900">
                Qual média necessária para atingir sua meta de conclusão?
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Cálculo exato da média necessária em todas as horas restantes com nota.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
              <div>
                <label className="block text-stone-500 mb-1">
                  CR-Alvo Desejado
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.05"
                  value={crAlvo}
                  onChange={(e) => setCrAlvo(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
                />
                <span className="text-[11px] text-stone-400">Ex: 8,50 ou 9,00</span>
              </div>
              <div>
                <label className="block text-stone-500 mb-1">
                  Horas Restantes Totais
                </label>
                <input
                  type="number"
                  min="60"
                  step="30"
                  value={chRestante}
                  onChange={(e) => setChRestante(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
                />
                <span className="text-[11px] text-stone-400">Padrão: 2.700h</span>
              </div>
              <div>
                <label className="block text-stone-500 mb-1">
                  Atividades sem Nota
                </label>
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excluirComplementares}
                    onChange={(e) => setExcluirComplementares(e.target.checked)}
                    className="accent-emerald-700 rounded"
                  />
                  <span className="text-xs text-stone-700">
                    Excluir 240h complementares ({chFuturaComNota}h com nota)
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-stone-400 block">
                  Resultado para CR-Alvo {crAlvo.toFixed(2)}
                </span>
                <div className="flex items-baseline gap-3 mt-1">
                  <span
                    className={`text-3xl font-light font-mono ${
                      resultadoInverso.possivel
                        ? 'text-emerald-800 font-bold'
                        : 'text-rose-600 font-bold'
                    }`}
                  >
                    {resultadoInverso.media.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-stone-500">
                    de média necessária nas {chFuturaComNota}h restantes
                  </span>
                </div>
              </div>
              <div className="text-right sm:border-l sm:pl-6 border-[#e6e4e8]">
                <span className="text-xs text-stone-400 block">Teto com nota 10 em tudo:</span>
                <p className="text-xl font-light font-mono text-stone-900">
                  CR {resultadoInverso.teto.toFixed(3).replace('.', ',')}
                </p>
              </div>
            </div>
            <div className="text-xs leading-relaxed text-stone-600 pt-3 border-t border-[#e6e4e8]">
              {resultadoInverso.possivel ? (
                <p>
                  Meta viável: mantendo média ponderada de{' '}
                  <strong className="text-stone-900">{resultadoInverso.media.toFixed(2)}</strong> nas disciplinas futuras, seu CR final alcançará{' '}
                  <strong className="text-stone-900">{crAlvo.toFixed(2)}</strong>.
                </p>
              ) : (
                <p className="text-rose-600">
                  Meta matematicamente inalcançável: mesmo tirando nota 10,0 em todas as disciplinas restantes, o CR teto é{' '}
                  <strong>{resultadoInverso.teto.toFixed(2)}</strong>.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
