import React, { useMemo, useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../fdr/ui/components/Modal';
import { useBills } from '../../bills/api';
import { BaseRecord, moneyInput, newId, parseMoney, todayLocal, useRecords } from '../../records/useRecords';
import { BRL, Button, EmptyState, Input, Label, Panel, Select, Tag, Textarea, cx } from '../ui';

export interface Desejo extends BaseRecord {
  kind: 'desejo';
  date: string; // added on
  name: string;
  price?: number;
  targetPrice?: number;
  link?: string;
  priority: 'alta' | 'media' | 'baixa';
  status: 'quero' | 'comprado' | 'desisti';
  boughtOn?: string;
  notes?: string;
}

const PRIORITY_LABEL: Record<Desejo['priority'], string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
const PRIORITY_ORDER: Record<Desejo['priority'], number> = { alta: 0, media: 1, baixa: 2 };

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const WishlistSection: React.FC = () => {
  const { financialTransactions, addFinancialTransaction } = useApp();
  const { bills } = useBills();
  const { items, loading, error, save, remove } = useRecords<Desejo>('desejo');
  const [editing, setEditing] = useState<Desejo | null>(null);
  const today = todayLocal();
  const month = today.slice(0, 7);

  // What is left this month after the bills still open, and the average monthly surplus
  const money = useMemo(() => {
    const totals = (m: string) => {
      const txs = financialTransactions.filter((t) => t.date.startsWith(m));
      return txs.reduce((s, t) => s + (t.type === 'receita' ? t.amount : -t.amount), 0);
    };
    const openBills = bills
      .filter((b) => b.status !== 'paga' && b.date.startsWith(month))
      .reduce((s, b) => s + (b.amount || 0), 0);
    const free = totals(month) - openBills;
    const past = [1, 2, 3].map((i) => totals(shiftMonth(month, -i)));
    const withData = past.filter((v) => v !== 0);
    const avgSurplus = withData.length ? withData.reduce((s, v) => s + v, 0) / withData.length : 0;
    return { free, openBills, avgSurplus };
  }, [financialTransactions, bills, month]);

  const wanted = items
    .filter((d) => d.status === 'quero')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || (a.price || 0) - (b.price || 0));
  const done = items.filter((d) => d.status !== 'quero');
  const wantedTotal = wanted.reduce((s, d) => s + (d.targetPrice || d.price || 0), 0);

  const verdict = (d: Desejo) => {
    const price = d.targetPrice || d.price;
    if (!price) return null;
    if (price <= money.free) return { tone: 'success' as const, text: 'Cabe no saldo deste mês' };
    const missing = price - Math.max(0, money.free);
    if (money.avgSurplus > 0) {
      const months = Math.ceil(missing / money.avgSurplus);
      return { tone: 'neutral' as const, text: `Faltam ${BRL.format(missing)} · ~${months} ${months === 1 ? 'mês' : 'meses'} guardando` };
    }
    return { tone: 'warning' as const, text: `Faltam ${BRL.format(missing)}` };
  };

  return (
    <div>
      <Panel className="mb-5" bodyClassName="!p-0">
        <dl className="grid grid-cols-3 divide-x divide-[#e6e4e8]">
          {[
            { label: 'Livre este mês', value: money.free, hint: money.openBills ? `já descontando ${BRL.format(money.openBills)} em contas` : undefined },
            { label: 'Sobra média por mês', value: money.avgSurplus, hint: 'últimos 3 meses' },
            { label: 'Lista de desejos', value: wantedTotal, hint: `${wanted.length} ${wanted.length === 1 ? 'item' : 'itens'}` },
          ].map((s) => (
            <div key={s.label} className="px-4 sm:px-5 py-4 min-w-0">
              <dt className="text-xs sm:text-[13px] text-stone-500">{s.label}</dt>
              <dd className={cx('mt-1 text-base sm:text-xl font-semibold tabular-nums', s.value < 0 ? 'text-[#8b1538]' : 'text-[#1c1a1e]')}>
                {BRL.format(s.value)}
              </dd>
              {s.hint && <div className="text-xs text-stone-500 mt-0.5 truncate">{s.hint}</div>}
            </div>
          ))}
        </dl>
      </Panel>

      <div className="flex justify-end mb-5">
        <Button
          variant="primary"
          icon={Plus}
          onClick={() =>
            setEditing({ id: newId('desejo'), kind: 'desejo', date: today, name: '', priority: 'media', status: 'quero' })
          }
        >
          Novo desejo
        </Button>
      </div>

      {loading ? (
        <Panel>
          <p className="text-sm text-stone-500">Carregando…</p>
        </Panel>
      ) : error ? (
        <Panel>
          <p className="text-sm text-amber-800">{error}</p>
        </Panel>
      ) : (
        <div className="space-y-5">
          <Panel title="Quero comprar" meta={wanted.length || undefined} bodyClassName="!pt-0">
            {wanted.length === 0 ? (
              <EmptyState>Anote o que você quer comprar e o preço. O app diz quando cabe no mês.</EmptyState>
            ) : (
              <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
                {wanted.map((d) => {
                  const v = verdict(d);
                  return (
                    <li key={d.id} className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 py-3">
                      <button onClick={() => setEditing(d)} className="min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#1c1a1e] truncate">{d.name}</span>
                          {d.priority === 'alta' && <Tag tone="brand">prioridade</Tag>}
                        </div>
                        {v && <div className={cx('text-xs mt-0.5', v.tone === 'success' ? 'text-emerald-700' : v.tone === 'warning' ? 'text-amber-800' : 'text-stone-500')}>{v.text}</div>}
                      </button>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium tabular-nums">{d.price ? BRL.format(d.price) : '—'}</div>
                        {d.targetPrice && d.targetPrice !== d.price && (
                          <div className="text-xs text-stone-500 tabular-nums">alvo {BRL.format(d.targetPrice)}</div>
                        )}
                      </div>
                      {d.link && (
                        <a
                          href={d.link}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Abrir link"
                          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:text-[#1c1a1e] hover:bg-stone-100"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <Button
                        size="sm"
                        onClick={async () => {
                          const paid = d.targetPrice || d.price;
                          await save({ ...d, status: 'comprado', boughtOn: today });
                          if (paid)
                            addFinancialTransaction({
                              description: d.name,
                              amount: paid,
                              type: 'despesa',
                              category: 'Outros',
                              date: today,
                              paymentMethod: 'cartao',
                              notes: 'Lista de desejos',
                            });
                        }}
                      >
                        Comprei
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
          {done.length > 0 && (
            <Panel title="Comprados e desistências" meta={done.length} bodyClassName="!pt-0">
              <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
                {done.slice(0, 15).map((d) => (
                  <li key={d.id}>
                    <button onClick={() => setEditing(d)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left">
                      <span className="text-sm text-stone-500 truncate">{d.name}</span>
                      <span className="text-xs text-stone-500">{d.status === 'comprado' ? 'comprado' : 'desisti'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}

      {editing && (
        <WishModal
          key={editing.id}
          item={editing}
          isNew={!items.some((i) => i.id === editing.id)}
          onClose={() => setEditing(null)}
          onSave={async (d) => {
            await save(d);
            setEditing(null);
          }}
          onDelete={async () => {
            if (!window.confirm(`Excluir "${editing.name}"?`)) return;
            await remove(editing);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

const WishModal: React.FC<{
  item: Desejo;
  isNew: boolean;
  onClose: () => void;
  onSave: (d: Desejo) => Promise<void>;
  onDelete: () => Promise<void>;
}> = ({ item, isNew, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState(item);
  const [price, setPrice] = useState(moneyInput(item.price));
  const [target, setTarget] = useState(moneyInput(item.targetPrice));
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Desejo>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Modal aberto aoFechar={onClose} titulo={isNew ? 'Novo desejo' : 'Desejo'} larguraMaxima="max-w-md">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.name.trim()) return;
          setBusy(true);
          try {
            await onSave({ ...draft, name: draft.name.trim(), price: parseMoney(price), targetPrice: parseMoney(target) });
          } finally {
            setBusy(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="w-name">O que você quer</Label>
          <Input id="w-name" autoFocus value={draft.name} onChange={(e) => set({ name: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="w-price">Preço hoje (R$)</Label>
            <Input id="w-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <Label htmlFor="w-target">Pagaria até (R$)</Label>
            <Input id="w-target" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="Opcional" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="w-prio">Prioridade</Label>
            <Select id="w-prio" value={draft.priority} onChange={(e) => set({ priority: e.target.value as Desejo['priority'] })}>
              {Object.entries(PRIORITY_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="w-status">Situação</Label>
            <Select id="w-status" value={draft.status} onChange={(e) => set({ status: e.target.value as Desejo['status'] })}>
              <option value="quero">Quero comprar</option>
              <option value="comprado">Comprei</option>
              <option value="desisti">Desisti</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="w-link">Link</Label>
          <Input id="w-link" type="url" value={draft.link || ''} onChange={(e) => set({ link: e.target.value || undefined })} placeholder="https://" />
        </div>
        <div>
          <Label htmlFor="w-notes">Notas</Label>
          <Textarea id="w-notes" rows={2} value={draft.notes || ''} onChange={(e) => set({ notes: e.target.value || undefined })} />
        </div>
        <div className={cx('flex items-center gap-2 pt-1', isNew ? 'justify-end' : 'justify-between')}>
          {!isNew && (
            <Button variant="danger" onClick={onDelete}>
              Excluir
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!draft.name.trim() || busy}>
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
