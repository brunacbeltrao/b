import React, { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { todayISO } from '../../utils/dateUtils';
import { FinancialTransaction } from '../../types';
import { Modal } from '../../fdr/ui/components/Modal';
import { BRL, Button, EmptyState, Input, Label, PageActions, Panel, Segmented, Select, cx } from '../ui';

const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Assinaturas & IA',
  'Projetos & Estudos',
  'Transporte',
  'Livros & Estudos',
  'Saúde & Farmácia',
  'Lazer & Restaurante',
  'Transferência',
  'Outros',
];
const INCOME_CATEGORIES = ['Remuneração', 'Apoio Familiar', 'Outros'];

const PAYMENT_LABEL: Record<string, string> = {
  pix: 'Pix',
  ted: 'TED',
  transferencia: 'Transferência',
  cartao: 'Cartão',
  dinheiro: 'Dinheiro',
};

type Filter = 'todos' | 'receita' | 'despesa';

function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1).replace(' de ', ' ');
}

function dayLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const label = new Date(y, m - 1, d)
    .toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace('-feira', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export const FinanceView: React.FC = () => {
  const { financialTransactions, addFinancialTransaction, deleteFinancialTransaction } = useApp();

  const months = useMemo(() => {
    const keys = new Set(financialTransactions.map((t) => t.date.slice(0, 7)));
    keys.add(todayISO().slice(0, 7));
    return [...keys].sort().reverse();
  }, [financialTransactions]);

  // Open on the latest month that has entries
  const [month, setMonth] = useState<string>(() => {
    const withData = [...new Set(financialTransactions.map((t) => t.date.slice(0, 7)))].sort().reverse();
    return withData[0] || todayISO().slice(0, 7);
  });
  const [filter, setFilter] = useState<Filter>('todos');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const monthTx = financialTransactions.filter((t) => t.date.startsWith(month));
  const income = monthTx.filter((t) => t.type === 'receita').reduce((s, t) => s + t.amount, 0);
  const spent = monthTx.filter((t) => t.type === 'despesa').reduce((s, t) => s + t.amount, 0);
  const balance = income - spent;

  const byCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    monthTx.filter((t) => t.type === 'despesa').forEach((t) => (totals[t.category] = (totals[t.category] || 0) + t.amount));
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [monthTx]);

  const visible = monthTx
    .filter((t) => filter === 'todos' || t.type === filter)
    .filter((t) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [t.description, t.category, t.notes, t.paymentMethod].some((v) => v && v.toLowerCase().includes(q));
    })
    .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));

  const groups: [string, FinancialTransaction[]][] = [];
  visible.forEach((t) => {
    const last = groups[groups.length - 1];
    if (last && last[0] === t.date) last[1].push(t);
    else groups.push([t.date, [t]]);
  });

  return (
    <div>
      <PageActions
        aside={
          <Select value={month} onChange={(e) => setMonth(e.target.value)} className="w-auto" aria-label="Mês">
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </Select>
        }
      >
        <Button id="btn-new-financial-tx" variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
          Novo lançamento
        </Button>
      </PageActions>

      <Panel className="mb-5" bodyClassName="!p-0">
        <dl className="grid grid-cols-3 divide-x divide-[#e6e4e8]">
          {[
            { label: 'Entradas', value: income, tone: 'text-[#1c1a1e]' },
            { label: 'Saídas', value: spent, tone: 'text-[#1c1a1e]' },
            { label: 'Saldo do mês', value: balance, tone: balance < 0 ? 'text-[#8b1538]' : 'text-emerald-700' },
          ].map((s) => (
            <div key={s.label} className="px-4 sm:px-5 py-4">
              <dt className="text-xs sm:text-[13px] text-stone-500">{s.label}</dt>
              <dd className={cx('mt-1 text-base sm:text-xl font-semibold tabular-nums', s.tone)}>{BRL.format(s.value)}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <Panel
          title="Lançamentos"
          meta={visible.length || undefined}
          actions={
            <Segmented<Filter>
              value={filter}
              onChange={setFilter}
              options={[
                { value: 'todos', label: 'Todos' },
                { value: 'receita', label: 'Entradas' },
                { value: 'despesa', label: 'Saídas' },
              ]}
            />
          }
        >
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar lançamento"
              className="pl-9"
            />
          </div>

          {visible.length === 0 ? (
            <EmptyState>Nenhum lançamento neste mês.</EmptyState>
          ) : (
            <div className="space-y-4">
              {groups.map(([date, items]) => (
                <div key={date}>
                  <div className="text-xs font-medium text-stone-500 pb-1">{dayLabel(date)}</div>
                  <ul className="divide-y divide-[#e6e4e8] border-y border-[#e6e4e8]">
                    {items.map((t) => (
                      <li key={t.id} className="group flex items-center gap-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-[#1c1a1e] truncate">{t.description}</div>
                          <div className="text-xs text-stone-500 truncate">
                            {[t.category, t.paymentMethod && (PAYMENT_LABEL[t.paymentMethod] || t.paymentMethod), t.time]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                        </div>
                        <span
                          className={cx(
                            'text-sm font-medium tabular-nums shrink-0',
                            t.type === 'receita' ? 'text-emerald-700' : 'text-[#1c1a1e]',
                          )}
                        >
                          {t.type === 'receita' ? '+' : '−'}
                          {BRL.format(t.amount)}
                        </span>
                        <button
                          onClick={() => {
                            if (window.confirm(`Excluir "${t.description}"?`)) deleteFinancialTransaction(t.id);
                          }}
                          aria-label={`Excluir ${t.description}`}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Para onde foi" meta={spent ? BRL.format(spent) : undefined}>
          {byCategory.length === 0 ? (
            <EmptyState>Sem saídas neste mês.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {byCategory.map(([cat, total]) => {
                const pct = spent ? (total / spent) * 100 : 0;
                return (
                  <li key={cat}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="text-[#1c1a1e] truncate">{cat}</span>
                      <span className="tabular-nums text-stone-600 shrink-0">
                        {BRL.format(total)} <span className="text-stone-400">· {Math.round(pct)}%</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div className="h-full rounded-full bg-[#8b1538]" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <NewTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(tx) => {
          addFinancialTransaction(tx);
          setMonth(tx.date.slice(0, 7));
          setModalOpen(false);
        }}
      />
    </div>
  );
};

const NewTransactionModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (tx: Omit<FinancialTransaction, 'id'>) => void;
}> = ({ open, onClose, onSave }) => {
  const [type, setType] = useState<'despesa' | 'receita'>('despesa');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState('');
  const [method, setMethod] = useState('pix');
  const [notes, setNotes] = useState('');

  const value = Number(amount.replace(/\./g, '').replace(',', '.'));
  const valid = description.trim() && value > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      description: description.trim(),
      amount: value,
      type,
      category,
      date,
      time: time || undefined,
      paymentMethod: method,
      notes: notes.trim() || undefined,
    });
    setDescription('');
    setAmount('');
    setNotes('');
  };

  return (
    <Modal aberto={open} aoFechar={onClose} titulo="Novo lançamento" larguraMaxima="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <Segmented<'despesa' | 'receita'>
          value={type}
          onChange={(t) => {
            setType(t);
            setCategory(t === 'despesa' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
          }}
          options={[
            { value: 'despesa', label: 'Saída' },
            { value: 'receita', label: 'Entrada' },
          ]}
          className="w-full [&>button]:flex-1"
        />
        <div>
          <Label htmlFor="tx-desc">Descrição</Label>
          <Input id="tx-desc" value={description} onChange={(e) => setDescription(e.target.value)} autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tx-amount">Valor (R$)</Label>
            <Input
              id="tx-amount"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="tabular-nums"
            />
          </div>
          <div>
            <Label htmlFor="tx-date">Data</Label>
            <Input id="tx-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="tx-cat">Categoria</Label>
            <Select id="tx-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
              {(type === 'despesa' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="tx-method">Forma</Label>
            <Select id="tx-method" value={method} onChange={(e) => setMethod(e.target.value)}>
              {Object.entries(PAYMENT_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-[110px_1fr] gap-3">
          <div>
            <Label htmlFor="tx-time">Hora</Label>
            <Input id="tx-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tx-notes">Observação</Label>
            <Input id="tx-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!valid}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
