import React, { useState } from 'react';
import { Bell, Plus, RotateCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../../fdr/ui/components/Modal';
import { BaseRecord, daysUntil, moneyInput, newId, parseMoney, shortDate, todayLocal, useRecords } from '../../records/useRecords';
import { BRL, Button, EmptyState, Input, Label, Panel, Select, Tag, Textarea, cx } from '../ui';

export interface Assinatura extends BaseRecord {
  kind: 'assinatura';
  date: string; // next renewal
  name: string;
  amount?: number;
  cycle: 'mensal' | 'anual';
  category: string;
  method?: string;
  alertDays: number;
  active: boolean;
  notes?: string;
}

const CATEGORIES = ['IA', 'Streaming', 'Aplicativos', 'Estudos', 'Anuidade', 'Academia', 'Outros'];

export const monthlyCost = (s: Assinatura) => (s.amount || 0) / (s.cycle === 'anual' ? 12 : 1);

function nextRenewal(iso: string, cycle: Assinatura['cycle']) {
  const [y, m, d] = iso.split('-').map(Number);
  const target = cycle === 'anual' ? new Date(y + 1, m - 1, 1) : new Date(y, m, 1);
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d, last));
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}

/** Subscriptions renewing within their alert window, for the Hoje page. */
export function renewalsDue(items: Assinatura[], today = todayLocal()) {
  return items.filter((s) => s.active && s.date && daysUntil(s.date, today) <= s.alertDays);
}

export const SubscriptionsSection: React.FC = () => {
  const { addFinancialTransaction } = useApp();
  const { items, loading, error, save, remove } = useRecords<Assinatura>('assinatura');
  const [editing, setEditing] = useState<Assinatura | null>(null);
  const [notice, setNotice] = useState('');
  const today = todayLocal();

  const active = items.filter((s) => s.active).sort((a, b) => (a.date || '9').localeCompare(b.date || '9'));
  const cancelled = items.filter((s) => !s.active);
  const perMonth = active.reduce((sum, s) => sum + monthlyCost(s), 0);
  const smallOnes = active.filter((s) => monthlyCost(s) <= 60);
  const smallPerYear = smallOnes.reduce((sum, s) => sum + monthlyCost(s) * 12, 0);

  const renew = async (s: Assinatura) => {
    await save({ ...s, date: nextRenewal(s.date || today, s.cycle) });
    if (s.amount) {
      addFinancialTransaction({
        description: s.name,
        amount: s.amount,
        type: 'despesa',
        category: 'Assinaturas & IA',
        date: today,
        paymentMethod: s.method === 'pix' ? 'pix' : 'cartao',
        notes: `Assinatura ${s.cycle}`,
      });
    }
    setNotice(`${s.name}: cobrança lançada e próxima renovação marcada.`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-stone-600">
          {active.length > 0 &&
            `${active.length} ${active.length === 1 ? 'ativa' : 'ativas'} · ${BRL.format(perMonth)} por mês · ${BRL.format(perMonth * 12)} por ano`}
        </p>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() =>
            setEditing({
              id: newId('ass'),
              kind: 'assinatura',
              date: today,
              name: '',
              cycle: 'mensal',
              category: 'IA',
              alertDays: 3,
              active: true,
            })
          }
        >
          Nova assinatura
        </Button>
      </div>

      {notice && (
        <p className="mb-4 text-[13px] text-stone-700" role="status">
          {notice}
        </p>
      )}

      {smallOnes.length >= 3 && (
        <p className="mb-5 text-[13px] text-stone-700">
          As {smallOnes.length} assinaturas pequenas (até R$ 60 por mês) somam{' '}
          <span className="font-medium text-[#1c1a1e]">{BRL.format(smallPerYear)} por ano</span>.
        </p>
      )}

      {loading ? (
        <Panel>
          <p className="text-sm text-stone-500">Carregando…</p>
        </Panel>
      ) : error ? (
        <Panel>
          <p className="text-sm text-amber-800">{error}</p>
        </Panel>
      ) : items.length === 0 ? (
        <Panel>
          <EmptyState>Cadastre o que você paga todo mês ou todo ano: IA, streaming, aplicativos, anuidades.</EmptyState>
        </Panel>
      ) : (
        <div className="space-y-5">
          <Panel title="Ativas" meta={active.length} bodyClassName="!pt-0">
            <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
              {active.map((s) => {
                const days = s.date ? daysUntil(s.date, today) : null;
                const soon = days !== null && days <= s.alertDays;
                return (
                  <li key={s.id} className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 py-3">
                    <button onClick={() => setEditing(s)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#1c1a1e] truncate">{s.name}</span>
                        {soon && (
                          <Tag tone="brand">
                            <Bell className="w-3 h-3 mr-1" />
                            {days! < 0 ? 'venceu' : days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `em ${days} dias`}
                          </Tag>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 truncate mt-0.5">
                        {[s.category, s.cycle === 'anual' ? 'anual' : 'mensal', s.date && `renova ${shortDate(s.date)}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </button>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium tabular-nums text-[#1c1a1e]">
                        {s.amount ? BRL.format(s.amount) : '—'}
                      </div>
                      {s.cycle === 'anual' && s.amount ? (
                        <div className="text-xs text-stone-500 tabular-nums">{BRL.format(monthlyCost(s))}/mês</div>
                      ) : s.amount ? (
                        <div className="text-xs text-stone-500 tabular-nums">{BRL.format(s.amount * 12)}/ano</div>
                      ) : null}
                    </div>
                    <Button size="sm" icon={RotateCw} onClick={() => renew(s)} title="Marcar como cobrada e ir para a próxima renovação">
                      Cobrou
                    </Button>
                  </li>
                );
              })}
            </ul>
          </Panel>
          {cancelled.length > 0 && (
            <Panel title="Canceladas" meta={cancelled.length} bodyClassName="!pt-0">
              <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
                {cancelled.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => setEditing(s)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left">
                      <span className="text-sm text-stone-500 truncate">{s.name}</span>
                      <span className="text-xs text-stone-500 tabular-nums">
                        economia de {BRL.format(monthlyCost(s) * 12)}/ano
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}

      {editing && (
        <SubscriptionModal
          key={editing.id}
          item={editing}
          isNew={!items.some((i) => i.id === editing.id)}
          onClose={() => setEditing(null)}
          onSave={async (s) => {
            await save(s);
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

const SubscriptionModal: React.FC<{
  item: Assinatura;
  isNew: boolean;
  onClose: () => void;
  onSave: (s: Assinatura) => Promise<void>;
  onDelete: () => Promise<void>;
}> = ({ item, isNew, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState(item);
  const [amount, setAmount] = useState(moneyInput(item.amount));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<Assinatura>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Modal aberto aoFechar={onClose} titulo={isNew ? 'Nova assinatura' : 'Assinatura'} larguraMaxima="max-w-md">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.name.trim()) return;
          setBusy(true);
          setError('');
          try {
            await onSave({ ...draft, name: draft.name.trim(), amount: parseMoney(amount) });
          } catch (err) {
            setError((err as Error).message);
            setBusy(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="sub-name">Nome</Label>
          <Input id="sub-name" autoFocus value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex.: ChatGPT Plus" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sub-amount">Valor (R$)</Label>
            <Input id="sub-amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </div>
          <div>
            <Label htmlFor="sub-cycle">Cobrança</Label>
            <Select id="sub-cycle" value={draft.cycle} onChange={(e) => set({ cycle: e.target.value as Assinatura['cycle'] })}>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sub-date">Próxima renovação</Label>
            <Input id="sub-date" type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="sub-alert">Avisar antes</Label>
            <Select id="sub-alert" value={draft.alertDays} onChange={(e) => set({ alertDays: Number(e.target.value) })}>
              {[1, 3, 7, 15, 30].map((d) => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'dia' : 'dias'}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sub-cat">Categoria</Label>
            <Select id="sub-cat" value={draft.category} onChange={(e) => set({ category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sub-method">Forma</Label>
            <Select id="sub-method" value={draft.method || 'cartao'} onChange={(e) => set({ method: e.target.value })}>
              <option value="cartao">Cartão</option>
              <option value="pix">Pix</option>
              <option value="debito">Débito automático</option>
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="sub-notes">Notas</Label>
          <Textarea id="sub-notes" rows={2} value={draft.notes || ''} onChange={(e) => set({ notes: e.target.value || undefined })} />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={!draft.active} onChange={(e) => set({ active: !e.target.checked })} className="accent-[#8b1538]" />
          Cancelei esta assinatura
        </label>
        {error && <p className="text-[13px] text-amber-800">{error}</p>}
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
