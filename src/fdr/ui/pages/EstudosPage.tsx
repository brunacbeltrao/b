import React, { useState } from 'react';
import { useFdrStore } from '../../store/useStore';
import {
  selectDisciplinasMatriculadas,
  selectResumoSemanalEstudo,
} from '../../store/selectors';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Flame,
  CalendarCheck,
} from 'lucide-react';

export const EstudosPage: React.FC = () => {
  const store = useFdrStore();
  const matriculadas = selectDisciplinasMatriculadas(store);
  const resumoSemanal = selectResumoSemanalEstudo(store);

  const [secaoAtiva, setSecaoAtiva] = useState<
    'meta' | 'erros' | 'leituras' | 'favoritos'
  >('meta');

  // --- CADERNO DE ERROS ---
  const [modalErroAberto, setModalErroAberto] = useState(false);
  const [novoErroTentativaId, setNovoErroTentativaId] = useState(
    matriculadas[0]?.tentativa.id || ''
  );
  const [novoErroTopicoId, setNovoErroTopicoId] = useState('');
  const [novoErroTitulo, setNovoErroTitulo] = useState('');
  const [novoErroOQueErrou, setNovoErroOQueErrou] = useState('');
  const [novoErroOQueRevisar, setNovoErroOQueRevisar] = useState('');
  const [novoErroAnexoNome, setNovoErroAnexoNome] = useState('');
  const [novoErroAnexoUrl, setNovoErroAnexoUrl] = useState('');

  const [anexoVisualizando, setAnexoVisualizando] = useState<{
    nome: string;
    url: string;
  } | null>(null);

  const handleUploadAnexo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNovoErroAnexoNome(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNovoErroAnexoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const salvarNovoErro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoErroTitulo.trim()) return;
    store.adicionarItemCadernoErro({
      tentativaId: novoErroTentativaId,
      topicoId: novoErroTopicoId || undefined,
      tituloQuestao: novoErroTitulo.trim(),
      oQueErrou: novoErroOQueErrou.trim(),
      oQueRevisar: novoErroOQueRevisar.trim(),
      anexoNome: novoErroAnexoNome || undefined,
      anexoUrl: novoErroAnexoUrl || undefined,
      resolvido: false,
      dataRegistro: new Date().toISOString().split('T')[0],
    });
    setNovoErroTitulo('');
    setNovoErroOQueErrou('');
    setNovoErroOQueRevisar('');
    setNovoErroAnexoNome('');
    setNovoErroAnexoUrl('');
    setModalErroAberto(false);
  };

  const errosNaoResolvidos = (store.cadernoErros || []).filter((e) => !e.resolvido);

  // --- FILA DE LEITURA & FICHAMENTO ---
  const [modalLeituraAberto, setModalLeituraAberto] = useState(false);
  const [novaLeitTitulo, setNovaLeitTitulo] = useState('');
  const [novaLeitAutor, setNovaLeitAutor] = useState('');
  const [novaLeitCodDisc, setNovaLeitCodDisc] = useState('PG520');
  const [novaLeitTipo, setNovaLeitTipo] = useState<'obrigatoria' | 'complementar'>('obrigatoria');
  const [novaLeitTotalPaginas, setNovaLeitTotalPaginas] = useState('300');

  const [leituraFichamentoEditando, setLeituraFichamentoEditando] = useState<any | null>(null);
  const [textoFichamento, setTextoFichamento] = useState('');
  const [fichamentoCopiado, setFichamentoCopiado] = useState(false);

  const abrirFichamento = (leitura: any) => {
    setLeituraFichamentoEditando(leitura);
    setTextoFichamento(leitura.fichamento || '');
  };

  const salvarFichamento = () => {
    if (!leituraFichamentoEditando) return;
    store.atualizarFichamentoLeitura(leituraFichamentoEditando.id, textoFichamento);
    setLeituraFichamentoEditando(null);
  };

  const copiarFichamento = () => {
    navigator.clipboard.writeText(textoFichamento);
    setFichamentoCopiado(true);
    setTimeout(() => setFichamentoCopiado(false), 2000);
  };

  const salvarNovaLeitura = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaLeitTitulo.trim()) return;
    const tent = store.tentativas.find(
      (t) => t.codigo === novaLeitCodDisc && t.semestre === store.perfil.periodoAtual
    );
    store.adicionarLeitura({
      tentativaId: tent?.id || 't-2026.2-' + novaLeitCodDisc,
      codigoDisciplina: novaLeitCodDisc,
      titulo: novaLeitTitulo.trim(),
      autor: novaLeitAutor.trim() || 'Autor não informado',
      tipo: novaLeitTipo,
      status: 'fila',
      paginasLidas: 0,
      totalPaginas: parseInt(novaLeitTotalPaginas, 10) || 100,
      fichamento: '',
    });
    setNovaLeitTitulo('');
    setNovaLeitAutor('');
    setModalLeituraAberto(false);
  };

  // --- FAVORITOS POR TÓPICO ---
  const [modalFavAberto, setModalFavAberto] = useState(false);
  const [novoFavTitulo, setNovoFavTitulo] = useState('');
  const [novoFavTipo, setNovoFavTipo] = useState<'sumula' | 'julgado' | 'artigo' | 'lei'>('sumula');
  const [novoFavRef, setNovoFavRef] = useState('');
  const [novoFavUrl, setNovoFavUrl] = useState('');
  const [novoFavAnotacao, setNovoFavAnotacao] = useState('');
  const [novoFavTopicoId, setNovoFavTopicoId] = useState('');

  const salvarNovoFavorito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoFavTitulo.trim()) return;
    const topico = store.topicos.find((t) => t.id === novoFavTopicoId);
    store.adicionarFavoritoTopico({
      topicoId: novoFavTopicoId || store.topicos[0]?.id || 'geral',
      tentativaId: topico?.tentativaId || store.tentativas[0]?.id || '',
      titulo: novoFavTitulo.trim(),
      tipo: novoFavTipo,
      referencia: novoFavRef.trim() || undefined,
      url: novoFavUrl.trim() || undefined,
      anotacoes: novoFavAnotacao.trim() || undefined,
    });
    setNovoFavTitulo('');
    setNovoFavRef('');
    setNovoFavUrl('');
    setNovoFavAnotacao('');
    setModalFavAberto(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Editorial */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-600 max-w-2xl">
            Acompanhamento semanal, caderno de erros de provas, fila de leitura com fichamentos e súmulas salvas.
          </p>
        </div>
        {/* Abas Superiores */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-[#e6e4e8]">
          <button
            onClick={() => setSecaoAtiva('meta')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              secaoAtiva === 'meta'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Meta & Resumo
          </button>
          <button
            onClick={() => setSecaoAtiva('erros')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              secaoAtiva === 'erros'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>Caderno de Erros</span>
            {errosNaoResolvidos.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 text-[10px] flex items-center justify-center font-mono font-bold">
                {errosNaoResolvidos.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSecaoAtiva('leituras')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              secaoAtiva === 'leituras'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Fila de Leitura
          </button>
          <button
            onClick={() => setSecaoAtiva('favoritos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              secaoAtiva === 'favoritos'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            Jurisprudência & Artigos
          </button>
        </div>
      </div>

      {/* 1. ABA META SEMANAL */}
      {secaoAtiva === 'meta' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-medium text-stone-400 block">Meta da Semana</span>
                  <h3 className="text-xl font-bold text-stone-900">
                    {resumoSemanal.topicosConcluidosSemana} de {resumoSemanal.metaTopicos} temas estudados
                  </h3>
                  <p className="text-xs text-stone-500">
                    Ciclo semanal • Progresso calculado pelos tópicos marcados no app
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Ajustar meta:</span>
                {[3, 5, 7, 10].map((qtd) => (
                  <button
                    key={qtd}
                    onClick={() => store.atualizarMetaSemanal(qtd)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      store.metaSemanal?.metaTopicos === qtd
                        ? 'bg-[#8b1538] text-white font-medium'
                        : 'bg-[#f6f5f7] text-stone-600 hover:bg-stone-200/60 border border-[#e6e4e8]'
                    }`}
                  >
                    {qtd}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-stone-500">Ritmo de estudo</span>
                <span className="text-emerald-700 font-semibold">{resumoSemanal.porcentagemMeta}% concluído</span>
              </div>
              <div className="w-full h-3 bg-[#e6e4e8] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#8b1538] rounded-full transition-all duration-500"
                  style={{ width: `${resumoSemanal.porcentagemMeta}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#e6e4e8]">
                <CalendarCheck className="w-4 h-4 text-emerald-700" />
                <h4 className="text-base font-bold text-stone-900">
                  Resumo do Domingo (Planejamento Semanal)
                </h4>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Todo domingo você revisa os temas concluídos na semana anterior e já visualiza as provas e entregas dos próximos 7 dias para planejar os blocos de estudo.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#f6f5f7] border border-[#e6e4e8]">
                  <span className="text-[11px] text-stone-400 block font-mono">Temas finalizados</span>
                  <span className="text-2xl font-mono font-medium text-emerald-700">
                    {resumoSemanal.topicosConcluidosSemana}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#f6f5f7] border border-[#e6e4e8]">
                  <span className="text-[11px] text-stone-400 block font-mono">Erros a revisar</span>
                  <span className="text-2xl font-mono font-medium text-amber-600">
                    {resumoSemanal.errosPendentes}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#e6e4e8]">
                <h4 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Provas & Prazos da Semana</span>
                </h4>
                <span className="text-xs font-mono text-stone-400">
                  Próximos 7 dias
                </span>
              </div>
              {resumoSemanal.provasProximaSemana.length === 0 ? (
                <div className="p-6 text-center text-xs text-stone-400">
                  Nenhuma prova agendada para os próximos 7 dias. Ótimo momento para adiantar fichamentos e leituras!
                </div>
              ) : (
                <div className="space-y-2">
                  {resumoSemanal.provasProximaSemana.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-amber-300 bg-amber-50/50 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-[10px] text-amber-800 font-semibold block">
                          {p.tipo.toUpperCase()} {p.disciplinaCodigo ? `• ${p.disciplinaCodigo}` : ''}
                        </span>
                        <h5 className="font-semibold text-stone-900 text-xs">
                          {p.titulo}
                        </h5>
                      </div>
                      <span className="font-mono text-xs font-semibold text-amber-800">
                        {p.diasRestantes === 0 ? 'HOJE' : `Em ${p.diasRestantes}d`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ABA CADERNO DE ERROS */}
      {secaoAtiva === 'erros' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Caderno de Erros Pós-Prova
              </h3>
              <p className="text-xs text-stone-500">
                Cadastre as questões erradas, a tese que você marcou vs o gabarito oficial e anexe fotos ou PDFs escaneados da prova.
              </p>
            </div>
            <Button
              variant="leaf"
              size="sm"
              onClick={() => setModalErroAberto(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Registrar Erro de Prova</span>
            </Button>
          </div>

          {errosNaoResolvidos.length > 0 && (
            <div className="p-5 border border-emerald-200 bg-emerald-50/50 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-800" />
                <h4 className="text-sm font-bold text-stone-900">
                  O app sugere revisar com prioridade:
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {errosNaoResolvidos.map((item) => {
                  const tent = store.tentativas.find((t) => t.id === item.tentativaId);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-emerald-200 bg-white text-xs space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[11px] text-stone-400">
                        <span className="font-semibold text-emerald-800">{tent?.codigo || 'FDR'}</span>
                        <span>{item.dataRegistro}</span>
                      </div>
                      <p className="font-semibold text-stone-900 text-xs">
                        {item.tituloQuestao}
                      </p>
                      <p className="text-stone-600 leading-relaxed text-[11px]">
                        <strong className="text-stone-900 font-semibold">Revisão recomendada:</strong> {item.oQueRevisar}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {(store.cadernoErros || []).length === 0 ? (
              <div className="p-8 text-center text-stone-400 text-sm bg-white rounded-2xl border border-[#e6e4e8]">
                Nenhum erro registrado ainda. Quando fizer a 1ª avaliação de PG520, PG525 ou PR433, registre aqui para não errar novamente na OAB ou na prova final!
              </div>
            ) : (
              (store.cadernoErros || []).map((item) => {
                const tent = store.tentativas.find((t) => t.id === item.tentativaId);
                const topico = store.topicos.find((t) => t.id === item.topicoId);
                return (
                  <div
                    key={item.id}
                    className={`p-4 sm:p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3 transition-all ${
                      item.resolvido ? 'opacity-70 bg-[#f6f5f7]' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#f6f5f7] text-stone-800 border border-[#e6e4e8]">
                          {tent?.codigo || 'FDR'}
                        </span>
                        {topico && (
                          <span className="text-xs text-stone-500">
                            • Tópico: {topico.titulo}
                          </span>
                        )}
                        <span className="text-xs font-mono text-stone-400">
                          {item.dataRegistro}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => store.alternarResolvidoErro(item.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all cursor-pointer ${
                            item.resolvido
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{item.resolvido ? 'Revisado!' : 'Marcar como revisado'}</span>
                        </button>
                        <button
                          onClick={() => store.removerItemCadernoErro(item.id)}
                          className="p-1 rounded text-stone-400 hover:text-rose-600 transition-all cursor-pointer"
                          title="Excluir erro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-base font-semibold text-stone-900">
                      {item.tituloQuestao}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                        <span className="font-medium text-rose-800 text-xs block">
                          O que eu marquei / errei:
                        </span>
                        <p className="text-stone-800 leading-relaxed">
                          {item.oQueErrou}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                        <span className="font-medium text-emerald-800 text-xs block">
                          Gabarito & O que revisar:
                        </span>
                        <p className="text-stone-800 leading-relaxed">
                          {item.oQueRevisar}
                        </p>
                      </div>
                    </div>
                    {item.anexoUrl && (
                      <div className="pt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() =>
                            setAnexoVisualizando({
                              nome: item.anexoNome || 'Prova escaneada',
                              url: item.anexoUrl!,
                            })
                          }
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                          <span>Ver Prova Escaneada ({item.anexoNome || 'Anexo'})</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. ABA FILA DE LEITURA */}
      {secaoAtiva === 'leituras' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Fila de Leitura & Fichamentos
              </h3>
              <p className="text-xs text-stone-500">
                Bibliografia oficial das disciplinas transformada em fila de leitura com páginas lidas e fichas acadêmicas (ex: PG520).
              </p>
            </div>
            <Button
              variant="leaf"
              size="sm"
              onClick={() => setModalLeituraAberto(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Adicionar Obra à Fila</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(store.leituras || []).map((obra) => {
              const porcentagem = Math.min(
                100,
                Math.round((obra.paginasLidas / obra.totalPaginas) * 100)
              );
              return (
                <div key={obra.id} className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#f6f5f7] text-stone-800 border border-[#e6e4e8]">
                        {obra.codigoDisciplina}
                      </span>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-full capitalize font-medium ${
                          obra.status === 'concluido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : obra.status === 'lendo'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {obra.status}
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-stone-900 leading-snug">
                      {obra.titulo}
                    </h4>
                    <p className="text-xs text-stone-500 italic">
                      {obra.autor} • {obra.tipo === 'obrigatoria' ? 'Básica' : 'Complementar'}
                    </p>
                    <div className="pt-2 space-y-1">
                      <div className="flex justify-between text-xs font-mono text-stone-500">
                        <span>Páginas: {obra.paginasLidas} / {obra.totalPaginas}</span>
                        <span>{porcentagem}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#e6e4e8] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#8b1538] rounded-full transition-all duration-300"
                          style={{ width: `${porcentagem}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#e6e4e8] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-stone-400 font-mono">Pág:</span>
                      <input
                        type="number"
                        min={0}
                        max={obra.totalPaginas}
                        value={obra.paginasLidas}
                        onChange={(e) =>
                          store.atualizarProgressoLeitura(
                            obra.id,
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-16 px-1.5 py-0.5 rounded-lg border border-[#e6e4e8] text-xs font-mono bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={obra.fichamento ? 'outline' : 'ghost'}
                        size="sm"
                        className="text-xs"
                        onClick={() => abrirFichamento(obra)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                        <span>{obra.fichamento ? 'Ver Fichamento' : 'Fichar'}</span>
                      </Button>
                      <button
                        onClick={() => store.removerLeitura(obra.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ABA FAVORITOS */}
      {secaoAtiva === 'favoritos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-stone-900">
                Súmulas, Julgados & Artigos Favoritos
              </h3>
              <p className="text-xs text-stone-500">
                Links e referências jurisprudenciais (STF, STJ) e doutrinárias guardadas por tópico para consulta rápida.
              </p>
            </div>
            <Button
              variant="leaf"
              size="sm"
              onClick={() => setModalFavAberto(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Salvar Novo Julgado / Súmula</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(store.favoritosTopicos || []).map((fav) => {
              const topico = store.topicos.find((t) => t.id === fav.topicoId);
              return (
                <div key={fav.id} className="p-5 bg-white rounded-2xl border border-[#e6e4e8] shadow-2xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                        {fav.tipo}
                      </span>
                      {fav.referencia && (
                        <span className="text-xs font-mono text-stone-500">
                          {fav.referencia}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-stone-900">
                      {fav.titulo}
                    </h4>
                    {fav.anotacoes && (
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {fav.anotacoes}
                      </p>
                    )}
                    {topico && (
                      <p className="text-[11px] font-mono text-stone-400">
                        Vinculado a: {topico.titulo}
                      </p>
                    )}
                  </div>
                  <div className="pt-2 border-t border-[#e6e4e8] flex items-center justify-between">
                    {fav.url ? (
                      <a
                        href={fav.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-800 hover:underline flex items-center gap-1 font-mono font-medium"
                      >
                        <span>Acessar inteiro teor</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-stone-400 font-mono">Sem link externo</span>
                    )}
                    <button
                      onClick={() => store.removerFavoritoTopico(fav.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR ERRO */}
      <Modal
        aberto={modalErroAberto}
        aoFechar={() => setModalErroAberto(false)}
        titulo="Registrar Questão / Erro de Prova"
        subtitulo="Identifique a tese que errou para receber recomendações de estudo"
      >
        <form onSubmit={salvarNovoErro} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Disciplina *
            </label>
            <select
              value={novoErroTentativaId}
              onChange={(e) => setNovoErroTentativaId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            >
              {matriculadas.map((m) => (
                <option key={m.tentativa.id} value={m.tentativa.id}>
                  {m.componente.codigo} - {m.componente.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Título da Questão ou Enunciado Resumido *
            </label>
            <input
              type="text"
              required
              value={novoErroTitulo}
              onChange={(e) => setNovoErroTitulo(e.target.value)}
              placeholder="Ex: Questão 3 - Competência territorial e foro de eleição"
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              O que você marcou / errou no raciocínio?
            </label>
            <textarea
              required
              rows={2}
              value={novoErroOQueErrou}
              onChange={(e) => setNovoErroOQueErrou(e.target.value)}
              placeholder="Ex: Marquei que a incompetência relativa pode ser conhecida de ofício pelo juiz."
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Gabarito oficial & O que você precisa revisar:
            </label>
            <textarea
              required
              rows={3}
              value={novoErroOQueRevisar}
              onChange={(e) => setNovoErroOQueRevisar(e.target.value)}
              placeholder="Ex: Súmula 33 STJ: a incompetência relativa não pode ser declarada de ofício. Revisar arts. 64 e 65 do CPC."
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Anexar foto ou PDF escaneado da prova (Opcional)
            </label>
            <div className="flex items-center gap-3">
              <label className="px-3.5 py-2 rounded-xl border border-[#e6e4e8] bg-[#f6f5f7] text-xs font-medium flex items-center gap-2 cursor-pointer hover:bg-stone-100 transition-all">
                <Upload className="w-4 h-4 text-emerald-700" />
                <span>Escolher arquivo...</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleUploadAnexo}
                  className="hidden"
                />
              </label>
              {novoErroAnexoNome && (
                <span className="text-xs text-stone-500 font-mono truncate max-w-[200px]">
                  {novoErroAnexoNome}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#e6e4e8]">
            <Button
              variant="outline"
              type="button"
              onClick={() => setModalErroAberto(false)}
            >
              Cancelar
            </Button>
            <Button variant="leaf" type="submit">
              Salvar no Caderno de Erros
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: VISUALIZAR ANEXO DE PROVA */}
      <Modal
        aberto={anexoVisualizando !== null}
        aoFechar={() => setAnexoVisualizando(null)}
        titulo={anexoVisualizando?.nome || 'Prova Escaneada'}
        larguraMaxima="max-w-4xl"
      >
        <div className="p-2 space-y-4">
          {anexoVisualizando?.url.startsWith('data:image') ? (
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#e6e4e8]">
              <img
                src={anexoVisualizando.url}
                alt="Prova escaneada"
                className="w-full h-auto object-contain"
              />
            </div>
          ) : (
            <div className="h-[60vh] w-full rounded-xl border border-[#e6e4e8] overflow-hidden">
              <iframe
                src={anexoVisualizando?.url}
                title="Visualizador PDF"
                className="w-full h-full"
              />
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setAnexoVisualizando(null)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: FICHAMENTO */}
      <Modal
        aberto={leituraFichamentoEditando !== null}
        aoFechar={() => setLeituraFichamentoEditando(null)}
        titulo={`Fichamento: ${leituraFichamentoEditando?.titulo || ''}`}
        subtitulo={`Obra de ${leituraFichamentoEditando?.autor || ''} (${leituraFichamentoEditando?.codigoDisciplina || ''})`}
        larguraMaxima="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <p className="text-stone-500">
            Redija aqui suas anotações, fichas de leitura exigidas pelo professor (ex: PG520), teses do autor e trechos doutrinários.
          </p>
          <textarea
            rows={10}
            value={textoFichamento}
            onChange={(e) => setTextoFichamento(e.target.value)}
            placeholder="Ex: Cap. 3 - Do Contraditório Substancial: O autor defende que o contraditório não é mera garantia formal..."
            className="w-full p-3 rounded-xl border border-[#e6e4e8] bg-white text-stone-800 leading-relaxed font-sans text-xs"
          />
          <div className="flex items-center justify-between pt-2 border-t border-[#e6e4e8]">
            <Button
              variant="outline"
              size="sm"
              onClick={copiarFichamento}
            >
              {fichamentoCopiado ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copiar Fichamento</span>
                </>
              )}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setLeituraFichamentoEditando(null)}
              >
                Cancelar
              </Button>
              <Button variant="leaf" onClick={salvarFichamento}>
                Salvar Fichamento
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* MODAL: ADICIONAR OBRA */}
      <Modal
        aberto={modalLeituraAberto}
        aoFechar={() => setModalLeituraAberto(false)}
        titulo="Nova Obra na Fila de Leitura"
      >
        <form onSubmit={salvarNovaLeitura} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Título do Livro / Artigo *
            </label>
            <input
              type="text"
              required
              value={novaLeitTitulo}
              onChange={(e) => setNovaLeitTitulo(e.target.value)}
              placeholder="Ex: Curso de Processo Civil - Vol. 1"
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Autor(a)
            </label>
            <input
              type="text"
              value={novaLeitAutor}
              onChange={(e) => setNovaLeitAutor(e.target.value)}
              placeholder="Ex: Fredie Didier Jr."
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-600 mb-1">
                Disciplina
              </label>
              <select
                value={novaLeitCodDisc}
                onChange={(e) => setNovaLeitCodDisc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
              >
                {matriculadas.map((m) => (
                  <option key={m.componente.codigo} value={m.componente.codigo}>
                    {m.componente.codigo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-stone-600 mb-1">
                Total de Páginas
              </label>
              <input
                type="number"
                value={novaLeitTotalPaginas}
                onChange={(e) => setNovaLeitTotalPaginas(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#e6e4e8]">
            <Button
              variant="outline"
              type="button"
              onClick={() => setModalLeituraAberto(false)}
            >
              Cancelar
            </Button>
            <Button variant="leaf" type="submit">
              Adicionar à Fila
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: NOVO FAVORITO */}
      <Modal
        aberto={modalFavAberto}
        aoFechar={() => setModalFavAberto(false)}
        titulo="Novo Julgado, Súmula ou Artigo Favorito"
      >
        <form onSubmit={salvarNovoFavorito} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Título / Resumo *
            </label>
            <input
              type="text"
              required
              value={novoFavTitulo}
              onChange={(e) => setNovoFavTitulo(e.target.value)}
              placeholder="Ex: Súmula 235 STJ ou Tema 988 STJ"
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-stone-600 mb-1">
                Tipo
              </label>
              <select
                value={novoFavTipo}
                onChange={(e) => setNovoFavTipo(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
              >
                <option value="sumula">Súmula</option>
                <option value="julgado">Julgado / Precedente</option>
                <option value="artigo">Artigo Doutrinário</option>
                <option value="lei">Dispositivo Legal / Enunciado</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-stone-600 mb-1">
                Referência (Tribunal / Autor)
              </label>
              <input
                type="text"
                value={novoFavRef}
                onChange={(e) => setNovoFavRef(e.target.value)}
                placeholder="Ex: STJ - Corte Especial"
                className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
              />
            </div>
          </div>
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Link de Acesso (URL)
            </label>
            <input
              type="url"
              value={novoFavUrl}
              onChange={(e) => setNovoFavUrl(e.target.value)}
              placeholder="https://jurisprudencia.stf.jus.br/..."
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800 font-mono"
            />
          </div>
          <div>
            <label className="block font-medium text-stone-600 mb-1">
              Anotações Jurídicas / Síntese
            </label>
            <textarea
              rows={3}
              value={novoFavAnotacao}
              onChange={(e) => setNovoFavAnotacao(e.target.value)}
              placeholder="Ex: A conexão não determina a reunião dos processos, se um deles já foi julgado."
              className="w-full p-2.5 rounded-xl border border-[#e6e4e8] bg-white text-stone-800"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#e6e4e8]">
            <Button
              variant="outline"
              type="button"
              onClick={() => setModalFavAberto(false)}
            >
              Cancelar
            </Button>
            <Button variant="leaf" type="submit">
              Salvar Favorito
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
