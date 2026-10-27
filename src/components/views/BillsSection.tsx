import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Mail, Paperclip, Plus, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { todayISO } from '../../utils/dateUtils';
import { Modal } from '../../fdr/ui/components/Modal';
import { BillBucket, Conta, bucketOf, newId, nextMonth, useBills } from '../../bills/api';
import { uploadFile } from '../../records/client';
import { GOOGLE_CONNECT_URL, scanGmail, useGoogleStatus } from '../../google/api';
import { BRL, Button, EmptyState, Input, Label, Panel, Select, Tag, Textarea, cx } from '../ui';

const BUCKETS: { id: BillBucket; label: string }[] = [
  { id: 'atrasada', label: 'Atrasadas' },
  { id: 'semana', label: 'Próximos 7 dias' },
  { id: 'depois', label: 'Mais adiante' },
  { id: 'sem-data', label: 'Sem vencimento' },
  { id: 'paga', label: 'Pagas' },
];

const METHOD_LABEL: Record<NonNullable<Conta['method']>, string> = {
  boleto: 'Boleto',
  pix: 'Pix',
  cartao: 'Cartão',
  debito: 'Débito automático',
  outro: 'Outro',
};

const CATEGORIES = ['Moradia', 'Contas da casa', 'Cartão de crédito', 'Assinaturas & IA', 'Faculdade', 'Saúde & Farmácia', 'Impostos', 'Outros'];

function dueLabel(iso: string, today: string) {
  if (!iso) return 'Sem data';
  if (iso === today) return 'Vence hoje';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const [ty, tm, td] = today.split('-').map(Number);
  const diff = Math.round((date.getTime() - new Date(ty, tm - 1, td).getTime()) / 86400000);
  if (diff === 1) return 'Vence amanhã';
  if (diff < 0) return `Venceu há ${-diff} ${diff === -1 ? 'dia' : 'dias'}`;
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace(/\.| de/g, '');
}

export const BillsSection: React.FC = () => {
  const { addFinancialTransaction } = useApp();
  const { bills, loading, error, save, remove, reload } = useBills();
  const { status: google } = useGoogleStatus();
  const [editing, setEditing] = useState<Conta | null>(null);
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState('');
  const today = todayISO();

  const open = bills.filter((b) => b.status !== 'paga');
  const dueSoon = open.filter((b) => ['atrasada', 'semana'].includes(bucketOf(b, today)));
  const dueSoonTotal = dueSoon.reduce((s, b) => s + (b.amount || 0), 0);

  const grouped = BUCKETS.map((bucket) => ({
    ...bucket,
    items: bills
      .filter((b) => bucketOf(b, today) === bucket.id)
      .sort((a, b) => (bucket.id === 'paga' ? (b.paidAt || '').localeCompare(a.paidAt || '') : a.date.localeCompare(b.date)))
      .slice(0, bucket.id === 'paga' ? 10 : undefined),
  })).filter((g) => g.items.length);

  const markPaid = async (bill: Conta) => {
    await save({ ...bill, status: 'paga', paidAt: today, needsReview: false });
    if (bill.amount) {
      addFinancialTransaction({
        description: bill.name,
        amount: bill.amount,
        type: 'despesa',
        category: bill.category || 'Outros',
        date: today,
        paymentMethod: bill.method === 'cartao' ? 'cartao' : 'pix',
        notes: bill.issuer ? `Conta · ${bill.issuer}` : 'Conta paga',
      });
    }
    if (bill.recurrence === 'mensal' && bill.date) {
      await save({
        ...bill,
        id: newId('conta'),
        date: nextMonth(bill.date),
        status: 'aberta',
        paidAt: undefined,
        barcode: undefined,
        fileId: undefined,
        fileName: undefined,
        gmailLink: undefined,
        source: 'manual',
        needsReview: false,
      });
    }
    setNotice(bill.amount ? 'Conta paga e lançada nas saídas de hoje.' : 'Conta marcada como paga.');
  };

  const runScan = async () => {
    setScanning(true);
    setNotice('');
    try {
      const { scanned, added } = await scanGmail();
      await reload();
      setNotice(
        added
          ? `${added} ${added === 1 ? 'conta nova encontrada' : 'contas novas encontradas'} no Gmail. Confira os valores.`
          : `Nenhuma conta nova nos ${scanned} e-mails mais recentes.`,
      );
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-stone-600">
          {dueSoon.length
            ? `${dueSoon.length} ${dueSoon.length === 1 ? 'conta vence' : 'contas vencem'} até a semana que vem${
                dueSoonTotal ? ` · ${BRL.format(dueSoonTotal)}` : ''
              }`
            : open.length
              ? 'Nada vencendo nos próximos 7 dias.'
              : ''}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {google?.configured && !google.connected && (
            <a
              href={GOOGLE_CONNECT_URL}
              className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-white border border-[#e6e4e8] hover:border-stone-300 text-sm font-medium text-[#1c1a1e]"
            >
              <Mail className="w-4 h-4" />
              Conectar Gmail
            </a>
          )}
          {google?.connected && (
            <Button icon={scanning ? RefreshCw : Mail} onClick={runScan} disabled={scanning}>
              {scanning ? 'Lendo o Gmail…' : 'Buscar no Gmail'}
            </Button>
          )}
          <Button
            variant="primary"
            icon={Plus}
            onClick={() =>
              setEditing({ id: newId('conta'), kind: 'conta', date: '', name: '', status: 'aberta', source: 'manual' })
            }
          >
            Nova conta
          </Button>
        </div>
      </div>

      {notice && (
        <p className="mb-4 text-[13px] text-stone-700" role="status">
          {notice}
        </p>
      )}

      {loading ? (
        <Panel>
          <p className="text-sm text-stone-500">Carregando contas…</p>
        </Panel>
      ) : error ? (
        <Panel>
          <p className="text-sm text-amber-800">{error}</p>
        </Panel>
      ) : grouped.length === 0 ? (
        <Panel>
          <EmptyState>
            Nenhuma conta cadastrada.{' '}
            {google?.connected
              ? 'Use “Buscar no Gmail” para trazer boletos e faturas.'
              : 'Conecte o Google em Conta e conexões para trazer boletos do Gmail.'}
          </EmptyState>
        </Panel>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <Panel key={group.id} title={group.label} meta={group.items.length} bodyClassName="!pt-0">
              <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
                {group.items.map((bill) => (
                  <BillRow
                    key={bill.id}
                    bill={bill}
                    today={today}
                    onEdit={() => setEditing(bill)}
                    onPay={() => markPaid(bill)}
                  />
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}

      {editing && (
        <BillModal
          key={editing.id}
          bill={editing}
          onClose={() => setEditing(null)}
          onSave={async (bill) => {
            await save(bill);
            setEditing(null);
          }}
          onDelete={
            bills.some((b) => b.id === editing.id)
              ? async () => {
                  if (!window.confirm(`Excluir "${editing.name}"?`)) return;
                  await remove(editing);
                  setEditing(null);
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

const BillRow: React.FC<{ bill: Conta; today: string; onEdit: () => void; onPay: () => void }> = ({
  bill,
  today,
  onEdit,
  onPay,
}) => {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const paid = bill.status === 'paga';
  const late = !paid && bill.date && bill.date < today;

  const copy = async () => {
    if (!bill.barcode) return;
    try {
      await navigator.clipboard.writeText(bill.barcode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie o código:', bill.barcode);
    }
  };

  return (
    <li className="flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2 py-3">
      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className={cx('text-sm truncate', paid ? 'text-stone-500' : 'text-[#1c1a1e] font-medium')}>{bill.name}</span>
          {bill.needsReview && <Tag tone="warning">Conferir</Tag>}
          {bill.recurrence === 'mensal' && <span className="text-xs text-stone-500 shrink-0">mensal</span>}
        </div>
        <div className="text-xs text-stone-500 truncate mt-0.5">
          <span className={cx(late && 'text-[#8b1538] font-medium')}>
            {paid ? `Paga em ${bill.paidAt?.split('-').reverse().slice(0, 2).join('/')}` : dueLabel(bill.date, today)}
          </span>
          {[bill.issuer, bill.method && METHOD_LABEL[bill.method]].filter(Boolean).map((v) => ` · ${v}`)}
        </div>
      </button>

      <span className={cx('text-sm tabular-nums shrink-0', paid ? 'text-stone-500' : 'text-[#1c1a1e] font-medium')}>
        {bill.amount ? BRL.format(bill.amount) : '—'}
      </span>

      <div className="flex items-center gap-1 shrink-0">
        {bill.barcode && !paid && (
          <Button size="sm" variant="ghost" icon={copied ? Check : Copy} onClick={copy} title="Copiar código de barras">
            <span className="sr-only sm:not-sr-only">{copied ? 'Copiado' : 'Código'}</span>
          </Button>
        )}
        {bill.fileId && (
          <a
            href={`/api/files/${bill.fileId}`}
            target="_blank"
            rel="noreferrer"
            title={bill.fileName || 'Anexo'}
            aria-label="Abrir anexo"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:text-[#1c1a1e] hover:bg-stone-100"
          >
            <Paperclip className="w-4 h-4" />
          </a>
        )}
        {bill.gmailLink && (
          <a
            href={bill.gmailLink}
            target="_blank"
            rel="noreferrer"
            title="Abrir e-mail"
            aria-label="Abrir e-mail no Gmail"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:text-[#1c1a1e] hover:bg-stone-100"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        {!paid && (
          <Button
            size="sm"
            icon={Check}
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onPay();
              } finally {
                setBusy(false);
              }
            }}
          >
            Paguei
          </Button>
        )}
      </div>
    </li>
  );
};

const BillModal: React.FC<{
  bill: Conta;
  onClose: () => void;
  onSave: (bill: Conta) => Promise<void>;
  onDelete?: () => Promise<void>;
}> = ({ bill, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState<Conta>(bill);
  const [amount, setAmount] = useState(bill.amount ? String(bill.amount).replace('.', ',') : '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<Conta>) => setDraft((d) => ({ ...d, ...patch }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const value = Number(amount.replace(/\./g, '').replace(',', '.'));
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...draft,
        name: draft.name.trim(),
        amount: value > 0 ? value : undefined,
        barcode: draft.barcode?.replace(/\D/g, '') || undefined,
        needsReview: false,
      });
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  };

  return (
    <Modal aberto aoFechar={onClose} titulo={onDelete ? 'Conta' : 'Nova conta'} larguraMaxima="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        {bill.needsReview && (
          <p className="text-[13px] text-amber-800">Encontrada no Gmail. Confira valor e vencimento antes de salvar.</p>
        )}
        <div>
          <Label htmlFor="bill-name">Conta</Label>
          <Input id="bill-name" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex.: Fatura do cartão" autoFocus />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="bill-amount">Valor (R$)</Label>
            <Input id="bill-amount" inputMode="decimal" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} className="tabular-nums" />
          </div>
          <div>
            <Label htmlFor="bill-date">Vencimento</Label>
            <Input id="bill-date" type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="bill-method">Forma</Label>
            <Select id="bill-method" value={draft.method || ''} onChange={(e) => set({ method: (e.target.value || undefined) as Conta['method'] })}>
              <option value="">—</option>
              {Object.entries(METHOD_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="bill-cat">Categoria</Label>
            <Select id="bill-cat" value={draft.category || ''} onChange={(e) => set({ category: e.target.value || undefined })}>
              <option value="">—</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="bill-issuer">Quem cobra</Label>
          <Input id="bill-issuer" value={draft.issuer || ''} onChange={(e) => set({ issuer: e.target.value || undefined })} placeholder="Opcional" />
        </div>
        <div>
          <Label htmlFor="bill-barcode">Código de barras ou Pix copia e cola</Label>
          <Input id="bill-barcode" value={draft.barcode || ''} onChange={(e) => set({ barcode: e.target.value || undefined })} className="font-mono text-[13px]" />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={draft.recurrence === 'mensal'}
            onChange={(e) => set({ recurrence: e.target.checked ? 'mensal' : undefined })}
            className="accent-[#8b1538]"
          />
          Repete todo mês (cria a próxima quando você pagar)
        </label>
        <div>
          <Label>Boleto ou fatura</Label>
          {draft.fileId ? (
            <div className="flex items-center gap-2 text-sm">
              <a href={`/api/files/${draft.fileId}`} target="_blank" rel="noreferrer" className="text-[#8b1538] hover:underline truncate">
                {draft.fileName || 'Arquivo anexado'}
              </a>
              <button type="button" onClick={() => set({ fileId: undefined, fileName: undefined })} aria-label="Remover anexo" className="p-1 rounded text-stone-400 hover:text-stone-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <input
              type="file"
              accept="application/pdf,image/*"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                setError('');
                try {
                  const uploaded = await uploadFile(file);
                  set({ fileId: uploaded.id, fileName: uploaded.name });
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setUploading(false);
                }
              }}
              className="block w-full text-sm text-stone-600 file:mr-3 file:h-8 file:px-3 file:rounded-md file:border file:border-[#e6e4e8] file:bg-white file:text-sm file:text-[#1c1a1e]"
            />
          )}
        </div>
        <div>
          <Label htmlFor="bill-notes">Notas</Label>
          <Textarea id="bill-notes" rows={2} value={draft.notes || ''} onChange={(e) => set({ notes: e.target.value || undefined })} />
        </div>
        {error && <p className="text-[13px] text-amber-800">{error}</p>}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div>
            {onDelete && (
              <Button variant="danger" onClick={onDelete}>
                Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {draft.status === 'paga' && (
              <Button variant="ghost" onClick={() => set({ status: 'aberta', paidAt: undefined })}>
                Reabrir
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!draft.name.trim() || saving || uploading}>
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
