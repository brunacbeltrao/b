import { todayISO } from '../../utils/dateUtils';
import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  Filter,
  TrendingUp,
  Tag,
  CreditCard,
  PieChart,
  Landmark,
  HeartHandshake,
  Sparkles,
  Clock,
  Receipt,
  ShieldCheck,
  Bot,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FinancialTransaction, TransactionCategory } from '../../types';

export const FinanceView: React.FC = () => {
  const { financialTransactions, addFinancialTransaction, deleteFinancialTransaction } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTabFilter, setActiveTabFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [txDescription, setTxDescription] = useState('');
  const [txAmount, setTxAmount] = useState<number | ''>('');
  const [txType, setTxType] = useState<'receita' | 'despesa'>('despesa');
  const [txCategory, setTxCategory] = useState<string>('Alimentação');
  const [txDate, setTxDate] = useState(todayISO);
  const [txTime, setTxTime] = useState('12:00');
  const [txPaymentMethod, setTxPaymentMethod] = useState<'pix' | 'cartao' | 'dinheiro' | 'ted' | 'transferencia'>('pix');
  const [txNotes, setTxNotes] = useState('');

  // Calculations
  const totalReceitas = financialTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDespesas = financialTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const saldoDisponivel = totalReceitas - totalDespesas;

  // BTG Statement Transactions (02/09 a 05/09/2026 - Salário R$ 1.100)
  const btgTransactions = financialTransactions.filter(t => t.id.startsWith('ft-btg'));
  const btgReceitas = btgTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);
  const btgDespesas = btgTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);
  const btgSaldo = btgReceitas - btgDespesas; // Exato R$ 0,03

  // Filtered transactions
  const filtered = financialTransactions.filter(t => {
    if (activeTabFilter === 'btg') {
      if (!t.id.startsWith('ft-btg')) return false;
    } else if (activeTabFilter === 'receita') {
      if (t.type !== 'receita') return false;
    } else if (activeTabFilter === 'despesa') {
      if (t.type !== 'despesa') return false;
    } else if (activeTabFilter !== 'todos') {
      if (t.category.toLowerCase() !== activeTabFilter.toLowerCase()) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txDescription.trim() || !txAmount || Number(txAmount) <= 0) return;
    addFinancialTransaction({
      description: txDescription.trim(),
      amount: Number(txAmount),
      type: txType,
      category: txCategory,
      date: txDate,
      time: txTime || undefined,
      paymentMethod: txPaymentMethod,
      notes: txNotes.trim() || undefined,
    });
    setIsAddModalOpen(false);
    setTxDescription('');
    setTxAmount('');
    setTxNotes('');
  };

  // Category summary
  const categoryTotals: Record<string, number> = {};
  financialTransactions
    .filter(t => t.type === 'despesa')
    .forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

  return (
    <div className="space-y-6">
      {/* Header com identidade sofisticada de gestão financeira */}
      <div className="rounded-2xl bg-gradient-to-r from-[#faf8f5] via-[#f7f2ea] to-[#f4ebe1] p-6 border border-[#ece8e1] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8c6b32] uppercase tracking-wide">
              <span>Controle Financeiro Pessoal</span>
              <span aria-hidden="true">·</span>
              <span>Autonomia</span>
              <span aria-hidden="true">·</span>
              <span>Estágio & Apoio Familiar</span>
            </div>
            <h1 className="font-serif-title text-2xl md:text-3xl font-normal text-[#212021] tracking-tight">
              Gestão Financeira
            </h1>
            <p className="text-sm text-stone-600 font-sans-ui leading-relaxed">
              Gestão autônoma de receitas e apoio financeiro familiar (R$ 150/semana), conciliação com extrato BTG e controle detalhado de despesas, ferramentas e assinaturas.
            </p>
          </div>

          <button
            id="btn-new-financial-tx"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#212021] hover:bg-stone-800 text-white font-semibold text-xs transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-[#a9cf44]" />
            <span>Novo Lançamento</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* CONCILIAÇÃO BANCÁRIA OFICIAL: EXTRATO BTG PACTUAL (SALÁRIO R$ 1.100,00) */}
      {/* ========================================================================= */}
      <section
        id="card-extrato-btg"
        className="rounded-2xl bg-gradient-to-br from-[#16202c] via-[#1c2836] to-[#0f1722] text-white p-6 border border-slate-700/60 shadow-md space-y-5 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400/20 to-blue-500/20 border border-amber-400/30 flex items-center justify-center font-bold text-amber-300">
              <Receipt className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-title text-lg md:text-xl font-bold text-white tracking-wide">
                  Extrato de Conta Corrente • BTG Pactual
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Conciliado
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Titular: <span className="font-semibold text-white">Bruna Cristina Beltrão Girão De Menezes</span> • Agência 20 • Conta 1474925-3
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl self-start md:self-auto">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Período:</span>
            <span className="font-semibold text-slate-200">02/09/2026 a 05/09/2026</span>
          </div>
        </div>

        {/* Métricas do Extrato */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Entrada de Salário (02/09)
            </div>
            <div className="text-2xl font-serif-title font-bold text-emerald-400 mt-1">
              + R$ 1.100,00
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Crédito em Conta Corrente • Salário Anterior (Histórico Auditado)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total de Débitos / Pix
            </div>
            <div className="text-2xl font-serif-title font-bold text-rose-400 mt-1">
              - R$ 1.099,97
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              15 lançamentos debitados entre 03/09 e 04/09
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Saldo em Conta BTG
            </div>
            <div className="text-2xl font-serif-title font-bold text-amber-300 mt-1">
              R$ 0,03
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Saldo exato auditado no fechamento de 05/09/2026
            </div>
          </div>
        </div>

        {/* Destaque Claude Pro & Distribuição dos R$ 1.100 */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          {/* Card Destaque: Assinatura Claude Pro (R$ 120,00) */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-amber-400/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Assinatura Claude Pro (Anthropic AI)</span>
              </div>
              <span className="font-serif-title text-base font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg">
                R$ 120,00
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-sans-ui">
              Lançamento identificado no extrato em <strong>03/09 às 23:28</strong> (Pix enviado para conta pessoal da Bruna). Destinado especificamente à assinatura mensal do <strong>Claude Pro</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5 bg-black/20 p-2 rounded-lg border border-white/5">
                <span className="text-amber-400 font-bold">•</span>
                <span>FDR & LDS: Pesquisa doutrinária e jurisprudencial em DPC e Societário</span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/20 p-2 rounded-lg border border-white/5">
                <span className="text-amber-400 font-bold">•</span>
                <span>Escrita Jurídica: Produção de peças, artigos e resumos analíticos</span>
              </div>
            </div>
          </div>

          {/* Decomposição do Salário de R$ 1.100 */}
          <div className="lg:col-span-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2.5 text-xs">
            <div className="font-bold text-slate-200 flex items-center justify-between">
              <span>Para onde foram os R$ 1.100,00:</span>
              <span className="text-[11px] text-slate-400">Total: R$ 1.099,97</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-300">
                <span>Repasses Institucionais / Projetos (2 Pix: R$ 250 + R$ 258,18)</span>
                <span className="font-semibold text-white">R$ 508,18 (46,2%)</span>
              </div>
              <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full rounded-full" style={{ width: '46.2%' }} />
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Cold Foca (Pix em 04/09)</span>
                <span className="font-semibold text-white">R$ 300,00 (27,3%)</span>
              </div>
              <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full" style={{ width: '27.3%' }} />
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Assinatura Claude Pro (IA Anthropic)</span>
                <span className="font-semibold text-amber-300">R$ 120,00 (10,9%)</span>
              </div>
              <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: '10.9%' }} />
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Alimentação diária (Dona Salsa, Granel, Snackbox, Zamp, Entre Amigos)</span>
                <span className="font-semibold text-white">R$ 124,34 (11,3%)</span>
              </div>
              <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: '11.3%' }} />
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Mobilidade (2 corridas Uber) + Transferência</span>
                <span className="font-semibold text-white">R$ 47,45 (4,3%)</span>
              </div>
              <div className="w-full bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full rounded-full" style={{ width: '4.3%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Fontes de Renda Fixa & Balanço do Mês */}
      <section
        id="card-fontes-renda"
        className="rounded-2xl bg-white p-6 border border-[#ece8e1] shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f2ece2] pb-3">
          <div>
            <h2 className="font-serif-title text-xl font-bold text-[#212021] flex items-center gap-2">
              <Landmark className="w-5 h-5 text-[#8b1538]" />
              Minhas Fontes de Renda Fixa
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Recebimentos periódicos programados para o ciclo mensal da Bruna.
            </p>
          </div>

          <div className="text-xs font-semibold text-stone-500 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200">
            Renda Estimada: <span className="text-[#212021] font-bold">~R$ 1.700,00 / mês</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Estágio / Remuneração */}
          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#eee4d5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
                💼
              </div>
              <div>
                <div className="text-sm font-bold text-[#212021]">Remuneração & Bolsas</div>
                <div className="text-xs text-stone-500">Histórico de estágio encerrado • Aberto a novos projetos</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-serif-title font-bold text-stone-700">
                R$ 1.100,00
              </div>
              <div className="text-[10px] text-stone-500 font-bold uppercase">Recebido no Mês</div>
            </div>
          </div>

          {/* Apoio do Pai */}
          <div className="p-4 rounded-xl bg-[#faf8f5] border border-[#eee4d5] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                👨‍👧
              </div>
              <div>
                <div className="text-sm font-bold text-[#212021]">Apoio Semanal (Pai)</div>
                <div className="text-xs text-stone-500">R$ 150,00 a cada semana (~4x/mês)</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-serif-title font-bold text-[#212021]">
                R$ 150,00
              </div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase">Por Semana (~R$ 600)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards de Métricas: Entradas, Saídas e Saldo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Entradas */}
        <div className="p-5 rounded-2xl bg-white border border-[#ece8e1] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Receitas</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-title font-bold text-emerald-800">
            R$ {totalReceitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-400">
            Receitas realizadas + Apoio semanal familiar
          </div>
        </div>

        {/* Despesas */}
        <div className="p-5 rounded-2xl bg-white border border-[#ece8e1] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Despesas</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-serif-title font-bold text-rose-800">
            R$ {totalDespesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-400">
            Gastos debitados e lançados
          </div>
        </div>

        {/* Saldo Líquido Global */}
        <div className="p-5 rounded-2xl bg-white border border-[#ece8e1] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Saldo Geral Pessoal</span>
            <div className="p-1.5 rounded-lg bg-stone-100 text-stone-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-serif-title font-bold ${
            saldoDisponivel >= 0 ? 'text-[#212021]' : 'text-rose-700'
          }`}>
            R$ {saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-400">
            Conta BTG: R$ 0,03 + Reserva de Apoio
          </div>
        </div>
      </div>

      {/* Categorias de Gastos & Histórico de Transações */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Transações (8 cols) */}
        <section
          id="card-transacoes"
          className="lg:col-span-8 rounded-2xl bg-white p-6 border border-[#ece8e1] shadow-xs space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f2ece2] pb-3">
            <div>
              <h3 className="font-serif-title text-lg font-bold text-[#212021]">
                Extrato & Lançamentos
              </h3>
              <p className="text-xs text-stone-400">
                Histórico de movimentações conciliado.
              </p>
            </div>

            {/* Filter chips */}
            <div className="flex items-center flex-wrap gap-1 bg-stone-100 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTabFilter('todos')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeTabFilter === 'todos'
                    ? 'bg-white text-[#212021] shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setActiveTabFilter('btg')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  activeTabFilter === 'btg'
                    ? 'bg-slate-900 text-amber-300 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Extrato BTG (R$ 1.100)
              </button>
              <button
                onClick={() => setActiveTabFilter('despesa')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeTabFilter === 'despesa'
                    ? 'bg-white text-rose-700 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Saídas
              </button>
              <button
                onClick={() => setActiveTabFilter('receita')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  activeTabFilter === 'receita'
                    ? 'bg-white text-emerald-700 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Entradas
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div>
            <input
              type="text"
              placeholder="Buscar por descrição, categoria, Claude, Uber, Snackbox..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>

          {/* Transactions list */}
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-400">
                Nenhum lançamento encontrado para os filtros selecionados.
              </div>
            ) : (
              filtered.map(tx => {
                const isBtg = tx.id.startsWith('ft-btg');
                const isClaude = tx.description.toLowerCase().includes('claude');

                return (
                  <div
                    key={tx.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      isClaude
                        ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50/70'
                        : isBtg
                        ? 'border-stone-200/90 bg-[#faf8f5]/60 hover:bg-white'
                        : 'border-stone-200/70 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isClaude
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : tx.type === 'receita'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isClaude ? (
                          <Bot className="w-4 h-4 text-amber-700" />
                        ) : tx.type === 'receita' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#212021] truncate">
                            {tx.description}
                          </span>
                          {isBtg && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                              BTG
                            </span>
                          )}
                          {isClaude && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 border border-amber-300 shrink-0">
                              Assinatura IA
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="font-semibold text-stone-600">{tx.category}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                          {tx.time && (
                            <>
                              <span>•</span>
                              <span className="text-stone-500 font-mono text-[10px]">{tx.time}</span>
                            </>
                          )}
                          {tx.paymentMethod && (
                            <>
                              <span>•</span>
                              <span className="uppercase text-[9px] font-mono font-bold text-stone-500">
                                {tx.paymentMethod}
                              </span>
                            </>
                          )}
                        </div>
                        {tx.notes && (
                          <div className="text-[11px] text-stone-500 mt-1 italic line-clamp-1">
                            {tx.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`font-serif-title font-bold text-sm ${
                          tx.type === 'receita' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {tx.type === 'receita' ? '+' : '-'} R${' '}
                        {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={() => deleteFinancialTransaction(tx.id)}
                        className="p-1 text-stone-300 hover:text-rose-600 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Despesas por Categoria (4 cols) */}
        <section
          id="card-despesas-categoria"
          className="lg:col-span-4 rounded-2xl bg-white p-6 border border-[#ece8e1] shadow-xs space-y-4"
        >
          <div className="border-b border-[#f2ece2] pb-3">
            <h3 className="font-serif-title text-lg font-bold text-[#212021] flex items-center gap-2">
              <PieChart className="w-4 h-4 text-stone-500" />
              Gastos por Categoria
            </h3>
            <p className="text-xs text-stone-400">
              Distribuição das suas despesas
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([cat, total]) => {
              const percent = totalDespesas > 0 ? Math.round((total / totalDespesas) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">{cat}</span>
                    <span className="text-[#212021]">
                      R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#8b1538] h-full rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-100 text-xs text-stone-500 space-y-2">
            <div className="font-bold text-[#212021] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Visão Executiva de Orçamento:</span>
            </div>
            <p className="leading-relaxed">
              O saldo inicial de <strong>R$ 1.100,00</strong> cobriu despesas institucionais (R$ 508,18), a assinatura do <strong>Claude Pro (R$ 120,00)</strong> para apoio de alto nível aos estudos dogmáticos e à LDS, e despesas correntes do início do mês.
            </p>
          </div>
        </section>
      </div>

      {/* Modal: Novo Lançamento */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-stone-200 shadow-xl space-y-4">
            <h3 className="font-serif-title text-xl font-bold text-[#212021]">
              Novo Lançamento Financeiro
            </h3>
            <form onSubmit={handleCreateTransaction} className="space-y-3">
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('despesa');
                    setTxCategory('Alimentação');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    txType === 'despesa'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Despesa (Saída)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('receita');
                    setTxCategory('Estágio');
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    txType === 'receita'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Receita (Entrada)
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Almoço após aula, Claude Pro, Uber, Livro..."
                  value={txDescription}
                  onChange={e => setTxDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="45.00"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    {txType === 'receita' ? (
                      <>
                        <option value="Remuneração">Remuneração / Bolsa</option>
                        <option value="Apoio Familiar">Apoio Semanal Pai</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Alimentação">Alimentação</option>
                        <option value="Assinaturas & IA">Assinaturas & IA (Claude Pro, etc.)</option>
                        <option value="Projetos & Estudos">Projetos & Estudos</option>
                        <option value="Transporte">Transporte (Uber / Ônibus)</option>
                        <option value="Livros & Estudos">Livros & Estudos (FDR)</option>
                        <option value="Saúde & Farmácia">Saúde & Farmácia</option>
                        <option value="Lazer & Restaurante">Lazer & Restaurante</option>
                        <option value="Transferência">Transferência</option>
                        <option value="Outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Método
                  </label>
                  <select
                    value={txPaymentMethod}
                    onChange={e => setTxPaymentMethod(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    <option value="pix">PIX</option>
                    <option value="ted">TED / Transferência</option>
                    <option value="cartao">Cartão</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Horário & Observações (Opcional)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="time"
                    value={txTime}
                    onChange={e => setTxTime(e.target.value)}
                    className="px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                  <input
                    type="text"
                    placeholder="Ex: Ref. comprovante..."
                    value={txNotes}
                    onChange={e => setTxNotes(e.target.value)}
                    className="col-span-2 px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#212021] text-white hover:bg-stone-800"
                >
                  Registrar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
