import React, { useState, useEffect } from 'react';
import { useFdrStore } from '../../store/useStore';
import { estaUsandoFallback } from '../../store/storage';
import { executarTestesDeDominio, TestResult } from '../../domain/tests';
import { Button } from '../components/Button';
import {
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Play,
  Save,
} from 'lucide-react';

export const ConfigPage: React.FC = () => {
  const store = useFdrStore();
  const usandoFallback = estaUsandoFallback();
  const [testes, setTestes] = useState<TestResult[]>([]);
  const [testando, setTestando] = useState(false);

  useEffect(() => {
    setTestes(executarTestesDeDominio());
  }, []);

  const rodarTestesNovamente = () => {
    setTestando(true);
    setTimeout(() => {
      setTestes(executarTestesDeDominio());
      setTestando(false);
    }, 200);
  };

  const [paramMu, setParamMu] = useState(store.perfil.parametrosIndices.mu.toString());
  const [paramSigma, setParamSigma] = useState(store.perfil.parametrosIndices.sigma.toString());
  const [paramChm, setParamChm] = useState(store.perfil.parametrosIndices.chm.toString());
  const [paramPm, setParamPm] = useState((store.perfil.parametrosIndices.pm ?? 10).toString());
  const [paramP, setParamP] = useState((store.perfil.parametrosIndices.p ?? 4).toString());
  const [paramChEsp, setParamChEsp] = useState((store.perfil.parametrosIndices.chEsperada ?? 1260).toString());
  const [paramPercentual, setParamPercentual] = useState((store.perfil.parametrosIndices.percentualManual ?? 15).toString());
  const [salvoParamFeedback, setSalvoParamFeedback] = useState(false);
  const [nomeEstudante, setNomeEstudante] = useState(store.perfil.nome || '');
  const [matriculaEstudante, setMatriculaEstudante] = useState(store.perfil.matricula || '');
  const [msgImportacao, setMsgImportacao] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const salvarParametros = (e: React.FormEvent) => {
    e.preventDefault();
    store.atualizarParametrosIndices({
      mu: parseFloat(paramMu.replace(',', '.')) || 8.8054,
      sigma: parseFloat(paramSigma.replace(',', '.')) || 0.3574,
      chm: parseInt(paramChm, 10) || 3900,
      pm: parseInt(paramPm, 10) || 10,
      p: parseInt(paramP, 10) || 4,
      chEsperada: parseInt(paramChEsp, 10) || 1260,
      percentualManual: paramPercentual ? parseFloat(paramPercentual) : null,
    });
    store.atualizarPerfil({
      nome: nomeEstudante.trim() || undefined,
      matricula: matriculaEstudante.trim() || undefined,
    });
    setSalvoParamFeedback(true);
    setTimeout(() => setSalvoParamFeedback(false), 2000);
  };

  const handleExportarJson = () => {
    const estado = {
      schemaVersion: store.schemaVersion,
      perfil: store.perfil,
      componentes: store.componentes,
      tentativas: store.tentativas,
      avaliacoes: store.avaliacoes,
      faltas: store.faltas,
      planoSemestres: store.planoSemestres,
      cenarios: store.cenarios,
      complementares: store.complementares,
      estagios: store.estagios,
      tcc: store.tcc,
      enade: store.enade,
      eletivasCursadas: store.eletivasCursadas,
      guias: store.guias,
      topicos: store.topicos,
      programas: store.programas,
    };
    const dataStr = new Date().toISOString().split('T')[0];
    const blob = new Blob([JSON.stringify(estado, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grad-direito-${dataStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportarJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const conteudo = event.target?.result as string;
      if (!conteudo) return;
      if (
        confirm(
          'Deseja realmente importar este arquivo JSON? Os dados atuais da graduação serão substituídos pelo histórico contido no arquivo.'
        )
      ) {
        const resultado = store.importarEstadoJson(conteudo);
        if (resultado.sucesso) {
          setMsgImportacao({ tipo: 'ok', texto: resultado.mensagem });
        } else {
          setMsgImportacao({ tipo: 'erro', texto: resultado.mensagem });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestaurarPadrao = () => {
    if (
      confirm(
        'Tem certeza de que deseja restaurar todos os dados iniciais do curso (conforme Seção 11 e 12 do PRD)? Quaisquer alterações não exportadas serão perdidas.'
      )
    ) {
      store.restaurarDadosIniciais();
      setMsgImportacao({
        tipo: 'ok',
        texto: 'Dados restaurados para o histórico padrão inicial da estudante (2024.2 a 2026.2)!',
      });
      setTestes(executarTestesDeDominio());
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="space-y-2 pb-4 border-b border-[#e6e4e8]">
        <span className="text-xs font-medium text-stone-400 block">Parâmetros e Dados</span>
        <h2 className="font-serif-title text-2xl md:text-3xl font-bold text-stone-900 mt-1">
          Ajustes e Calibração
        </h2>
        <p className="text-xs text-stone-500">
          Calibre os parâmetros estatísticos do curso, realize backup em JSON ou verifique as fórmulas com o PRD.
        </p>
        {usandoFallback && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-stone-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Armazenamento em memória ativa. Faça o download do arquivo JSON para preservar seus dados permanentemente.
            </span>
          </div>
        )}
      </div>

      {/* Backup e Restauração */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3">
          <span className="text-xs font-medium text-stone-400 block">Backup dos Dados</span>
          <h3 className="font-bold text-sm text-stone-900">
            Exportar arquivo JSON
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Gera o arquivo com todo o histórico, notas, faltas, plano de semestres e guias. Salve como cópia de segurança.
          </p>
          <Button
            variant="leaf"
            size="sm"
            onClick={handleExportarJson}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Baixar Arquivo JSON</span>
          </Button>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3">
          <span className="text-xs font-medium text-stone-400 block">Restauração</span>
          <h3 className="font-bold text-sm text-stone-900">
            Importar arquivo JSON
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Carregue um arquivo JSON gerado anteriormente. Os dados serão validados pelo esquema Zod.
          </p>
          <div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#e6e4e8] bg-white hover:bg-stone-50 text-stone-800 cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Selecionar Arquivo JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportarJson}
                className="hidden"
              />
            </label>
          </div>
          {msgImportacao && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                msgImportacao.tipo === 'ok'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {msgImportacao.tipo === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{msgImportacao.texto}</span>
            </div>
          )}
        </div>
      </div>

      {/* Formulário de Parâmetros */}
      <form
        onSubmit={salvarParametros}
        className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#e6e4e8]">
          <div>
            <span className="text-xs font-medium text-stone-400 block">Parâmetros do SIGAA</span>
            <h3 className="font-bold text-sm text-stone-900">
              Calibração de Índices de Rendimento
            </h3>
          </div>
          {salvoParamFeedback && (
            <span className="text-xs text-emerald-800 font-semibold">
              Alterações salvas
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-stone-500 mb-1">
              μ (Média das MCs concluintes 5 anos)
            </label>
            <input
              type="text"
              value={paramMu}
              onChange={(e) => setParamMu(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
            />
            <span className="text-[11px] text-stone-400">Padrão FDR: 8.8054</span>
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              σ (Desvio padrão das MCs)
            </label>
            <input
              type="text"
              value={paramSigma}
              onChange={(e) => setParamSigma(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
            />
            <span className="text-[11px] text-stone-400">Padrão FDR: 0.3574</span>
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Carga Esperada para IEPL
            </label>
            <input
              type="text"
              value={paramChEsp}
              onChange={(e) => setParamChEsp(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
            />
            <span className="text-[11px] text-stone-400">1.260h produz IEPL = 0,9524</span>
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Nome da Estudante
            </label>
            <input
              type="text"
              placeholder="Bruna Beltrão"
              value={nomeEstudante}
              onChange={(e) => setNomeEstudante(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Matrícula SIGAA
            </label>
            <input
              type="text"
              placeholder="Ex: 2024200..."
              value={matriculaEstudante}
              onChange={(e) => setMatriculaEstudante(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
            />
          </div>
          <div>
            <label className="block text-stone-500 mb-1">
              Percentual no Curso (SIGAA %)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={paramPercentual}
              onChange={(e) => setParamPercentual(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white font-mono text-stone-800"
            />
            <span className="text-[11px] text-stone-400">Ex: 15% melhores MCs</span>
          </div>
        </div>
        <div className="pt-3 border-t border-[#e6e4e8] flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestaurarPadrao}
            className="text-xs text-rose-600 hover:bg-rose-50"
          >
            Restaurar Dados Iniciais
          </Button>
          <Button
            type="submit"
            variant="leaf"
            size="sm"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            <span>Salvar Parâmetros</span>
          </Button>
        </div>
      </form>

      {/* Suíte de Testes de Domínio */}
      <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e6e4e8]">
          <div>
            <span className="text-xs font-medium text-stone-400 block">Qualidade & Regras de Negócio</span>
            <h3 className="font-bold text-sm text-stone-900">
              Verificação dos Critérios de Aceite (PRD)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              17 provas de cálculo puras: MC 8,28; CR 7,7545; IECH 0,9091; IECHP 0,6923; MCN ~353; simulações e travas curriculares.
            </p>
          </div>
          <Button
            variant="soft"
            size="sm"
            onClick={rodarTestesNovamente}
            disabled={testando}
          >
            <Play className="w-3 h-3 text-emerald-700 mr-1" />
            <span>{testando ? 'Testando...' : 'Reexecutar'}</span>
          </Button>
        </div>
        <div className="divide-y divide-[#e6e4e8]">
          {testes.map((t, idx) => (
            <div
              key={idx}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                {t.passou ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold text-stone-900">{t.nome}</h4>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-stone-500 font-mono">
                    <span>Esperado: {t.esperado}</span>
                    <span>•</span>
                    <span>Obtido: {t.obtido}</span>
                  </div>
                  {t.detalhes && (
                    <p className="text-[10px] text-stone-400 italic">
                      {t.detalhes}
                    </p>
                  )}
                </div>
              </div>
              <span
                className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  t.passou
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-rose-50 text-rose-800'
                }`}
              >
                {t.passou ? 'PASSOU' : 'FALHOU'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
