import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Lock, Plus, ShieldCheck, X } from 'lucide-react';
import { Modal } from '../../fdr/ui/components/Modal';
import { VaultLockedError, uploadFile } from '../../records/client';
import { BaseRecord, daysUntil, newId, shortDate, todayLocal, useRecords } from '../../records/useRecords';
import { Button, EmptyState, Input, Label, Panel, Select, Tag, Textarea, cx } from '../ui';

export interface Documento extends BaseRecord {
  kind: 'documento';
  date: string; // issued on
  name: string;
  category: string;
  issuer?: string;
  expiresOn?: string;
  alertDays: number;
  fileName?: string;
  notes?: string;
}

const CATEGORIES = ['Acadêmico', 'Estágio e trabalho', 'Certificados', 'Contratos', 'Pessoal', 'Outros'];

/** Looks like a CPF, RG or passport number: those stay out of the vault's text fields. */
const ID_NUMBER = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b|\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dxX]\b|\b[A-Z]{2}\d{6}\b/;

async function vaultStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/vault', { cache: 'no-store' });
    return res.ok && (await res.json()).unlocked;
  } catch {
    return false;
  }
}

export const VaultView: React.FC = () => {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  useEffect(() => {
    vaultStatus().then(setUnlocked);
  }, []);
  const lock = useCallback(async () => {
    await fetch('/api/auth/vault/lock', { method: 'POST' }).catch(() => undefined);
    setUnlocked(false);
  }, []);

  if (unlocked === null) return <p className="text-sm text-stone-500">Verificando…</p>;
  if (!unlocked) return <VaultLock onUnlock={() => setUnlocked(true)} />;
  return <VaultContents onLocked={() => setUnlocked(false)} onLock={lock} />;
};

const VaultLock: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <div className="max-w-sm mx-auto mt-8">
      <Panel>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              const res = await fetch('/api/auth/vault', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
              });
              if (res.ok) onUnlock();
              else setError(res.status === 429 ? 'Muitas tentativas. Espere 5 minutos.' : 'Senha incorreta.');
            } catch {
              setError('Sem conexão com o servidor.');
            } finally {
              setBusy(false);
            }
          }}
          className="space-y-4 text-center"
        >
          <Lock className="w-6 h-6 mx-auto text-[#8b1538]" />
          <div>
            <h2 className="text-[15px] font-semibold text-[#1c1a1e]">Cofre de documentos</h2>
            <p className="text-[13px] text-stone-600 mt-1">Digite a senha do app de novo. O cofre fica aberto por 15 minutos.</p>
          </div>
          <Input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Senha" />
          {error && <p className="text-[13px] text-[#8b1538]">{error}</p>}
          <Button type="submit" variant="primary" disabled={!password || busy} className="w-full">
            Abrir cofre
          </Button>
        </form>
      </Panel>
    </div>
  );
};

const VaultContents: React.FC<{ onLocked: () => void; onLock: () => void }> = ({ onLocked, onLock }) => {
  const { items, loading, error, save, remove } = useRecords<Documento>('documento');
  const [editing, setEditing] = useState<Documento | null>(null);
  const today = todayLocal();

  useEffect(() => {
    if (error && /cofre foi trancado/.test(error)) onLocked();
  }, [error, onLocked]);
  // Lock the screen when the 15 minutes are up
  useEffect(() => {
    const timer = setInterval(async () => {
      if (!(await vaultStatus())) onLocked();
    }, 60_000);
    return () => clearInterval(timer);
  }, [onLocked]);

  const expiring = items
    .filter((d) => d.expiresOn && daysUntil(d.expiresOn, today) <= d.alertDays)
    .sort((a, b) => a.expiresOn!.localeCompare(b.expiresOn!));
  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    docs: items.filter((d) => d.category === c).sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.docs.length);

  const guard = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (e) {
      if (e instanceof VaultLockedError) onLocked();
      else throw e;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="flex items-center gap-1.5 text-sm text-stone-600">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          Cofre aberto
        </p>
        <div className="flex gap-2">
          <Button icon={Lock} onClick={onLock}>
            Trancar
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setEditing({ id: newId('doc'), kind: 'documento', date: today, name: '', category: 'Acadêmico', alertDays: 30 })}
          >
            Novo documento
          </Button>
        </div>
      </div>

      {expiring.length > 0 && (
        <Panel title="Vencendo" meta={expiring.length} className="mb-5" bodyClassName="!pt-0">
          <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
            {expiring.map((d) => {
              const days = daysUntil(d.expiresOn!, today);
              return (
                <li key={d.id}>
                  <button onClick={() => setEditing(d)} className="w-full flex items-center justify-between gap-3 py-2.5 text-left">
                    <span className="text-sm font-medium text-[#1c1a1e] truncate">{d.name}</span>
                    <span className={cx('text-xs shrink-0', days < 0 ? 'text-[#8b1538] font-medium' : 'text-stone-500')}>
                      {days < 0 ? `venceu em ${shortDate(d.expiresOn!)}` : days === 0 ? 'vence hoje' : `vence em ${days} dias`}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      {loading ? (
        <Panel>
          <p className="text-sm text-stone-500">Carregando…</p>
        </Panel>
      ) : items.length === 0 ? (
        <Panel>
          <EmptyState>Guarde aqui histórico escolar, comprovante de matrícula, certificados, declarações e contratos de estágio.</EmptyState>
        </Panel>
      ) : (
        <div className="space-y-5">
          {byCategory.map((g) => (
            <Panel key={g.category} title={g.category} meta={g.docs.length} bodyClassName="!pt-0">
              <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
                {g.docs.map((d) => (
                  <li key={d.id} className="flex items-center gap-3 py-2.5">
                    <button onClick={() => setEditing(d)} className="min-w-0 flex-1 text-left">
                      <div className="text-sm font-medium text-[#1c1a1e] truncate">{d.name}</div>
                      <div className="text-xs text-stone-500 truncate mt-0.5">
                        {[d.issuer, d.date && `emitido ${shortDate(d.date)}`, d.expiresOn && `válido até ${shortDate(d.expiresOn)}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </button>
                    {d.fileId ? (
                      <a
                        href={`/api/files/${d.fileId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md border border-[#e6e4e8] text-[13px] text-stone-700 hover:border-stone-300"
                      >
                        <FileText className="w-4 h-4" />
                        Abrir
                      </a>
                    ) : (
                      <Tag>sem arquivo</Tag>
                    )}
                  </li>
                ))}
              </ul>
            </Panel>
          ))}
        </div>
      )}

      {editing && (
        <DocumentModal
          key={editing.id}
          item={editing}
          isNew={!items.some((i) => i.id === editing.id)}
          onClose={() => setEditing(null)}
          onLocked={onLocked}
          onSave={(d) =>
            guard(async () => {
              await save(d);
              setEditing(null);
            })
          }
          onDelete={() =>
            guard(async () => {
              if (!window.confirm(`Excluir "${editing.name}" e o arquivo?`)) return;
              await remove(editing);
              setEditing(null);
            })
          }
        />
      )}
    </div>
  );
};

const DocumentModal: React.FC<{
  item: Documento;
  isNew: boolean;
  onClose: () => void;
  onLocked: () => void;
  onSave: (d: Documento) => Promise<void>;
  onDelete: () => Promise<void>;
}> = ({ item, isNew, onClose, onLocked, onSave, onDelete }) => {
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<Documento>) => setDraft((d) => ({ ...d, ...patch }));
  const hasIdNumber = ID_NUMBER.test(`${draft.name} ${draft.notes || ''} ${draft.issuer || ''}`);

  return (
    <Modal aberto aoFechar={onClose} titulo={isNew ? 'Novo documento' : 'Documento'} larguraMaxima="max-w-md">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.name.trim() || hasIdNumber) return;
          setBusy(true);
          setError('');
          try {
            await onSave({ ...draft, name: draft.name.trim() });
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setBusy(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="doc-name">Documento</Label>
          <Input id="doc-name" autoFocus value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex.: Comprovante de matrícula 2026.2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="doc-cat">Categoria</Label>
            <Select id="doc-cat" value={draft.category} onChange={(e) => set({ category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="doc-issuer">Quem emitiu</Label>
            <Input id="doc-issuer" value={draft.issuer || ''} onChange={(e) => set({ issuer: e.target.value || undefined })} placeholder="Ex.: UFPE" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor="doc-date">Emitido em</Label>
            <Input id="doc-date" type="date" value={draft.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="doc-exp">Válido até</Label>
            <Input id="doc-exp" type="date" value={draft.expiresOn || ''} onChange={(e) => set({ expiresOn: e.target.value || undefined })} />
          </div>
          <div>
            <Label htmlFor="doc-alert">Avisar</Label>
            <Select id="doc-alert" value={draft.alertDays} onChange={(e) => set({ alertDays: Number(e.target.value) })}>
              {[7, 15, 30, 60, 90].map((d) => (
                <option key={d} value={d}>
                  {d} dias antes
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label>Arquivo</Label>
          {draft.fileId ? (
            <div className="flex items-center gap-2 text-sm">
              <a href={`/api/files/${draft.fileId}`} target="_blank" rel="noreferrer" className="text-[#8b1538] hover:underline truncate">
                {draft.fileName || 'Arquivo anexado'}
              </a>
              <button type="button" onClick={() => set({ fileId: undefined, fileName: undefined })} aria-label="Remover arquivo" className="p-1 rounded text-stone-400 hover:text-stone-700">
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
                  const uploaded = await uploadFile(file, { sensitive: true });
                  set({ fileId: uploaded.id, fileName: uploaded.name });
                } catch (err) {
                  if (err instanceof VaultLockedError) onLocked();
                  setError((err as Error).message);
                } finally {
                  setUploading(false);
                }
              }}
              className="block w-full text-sm text-stone-600 file:mr-3 file:h-8 file:px-3 file:rounded-md file:border file:border-[#e6e4e8] file:bg-white file:text-sm file:text-[#1c1a1e]"
            />
          )}
          <p className="text-xs text-stone-500 mt-1">PDF ou foto, até 3 MB. Só abre com o cofre destrancado.</p>
        </div>
        <div>
          <Label htmlFor="doc-notes">Notas</Label>
          <Textarea id="doc-notes" rows={2} value={draft.notes || ''} onChange={(e) => set({ notes: e.target.value || undefined })} placeholder="Onde pedir de novo, para que serve" />
        </div>
        {hasIdNumber && (
          <p className="text-[13px] text-[#8b1538]">
            Parece um número de CPF, RG ou passaporte. Por segurança, não escreva esses números aqui; o arquivo já basta.
          </p>
        )}
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
            <Button type="submit" variant="primary" disabled={!draft.name.trim() || busy || uploading || hasIdNumber}>
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
