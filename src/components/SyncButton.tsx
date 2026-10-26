import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Cloud, CloudCheck, CloudOff, CloudAlert, RefreshCw } from 'lucide-react';
import { Modal } from '../fdr/ui/components/Modal';
import {
  SyncStatus,
  connect,
  disconnect,
  getLastSyncedAt,
  getSyncStatus,
  isSyncConfigured,
  pushNow,
  reconcile,
  subscribeSyncStatus,
} from '../sync/cloudSync';

const STATUS_LABEL: Record<SyncStatus, string> = {
  off: 'Nuvem desligada',
  syncing: 'Sincronizando…',
  synced: 'Salvo na nuvem',
  offline: 'Sem conexão',
  unauthorized: 'Senha incorreta',
  unavailable: 'Nuvem indisponível',
};

function formatTime(ts: number | null): string {
  if (!ts) return 'nunca';
  return new Date(ts).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const SyncButton: React.FC = () => {
  const [status, setStatus] = useState<SyncStatus>(getSyncStatus());
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => subscribeSyncStatus(setStatus), []);

  const configured = isSyncConfigured();
  const Icon =
    status === 'synced' ? CloudCheck : status === 'off' ? CloudOff : status === 'syncing' ? Cloud : CloudAlert;
  const tone =
    status === 'synced'
      ? 'text-emerald-700'
      : status === 'off' || status === 'syncing'
        ? 'text-stone-500'
        : 'text-amber-700';

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setBusy(true);
    setError('');
    const result = await connect(password);
    setBusy(false);
    if (result === 'unauthorized') setError('Senha incorreta. Confira e tente de novo.');
    else if (result === 'unavailable') setError('A nuvem ainda não está configurada no servidor.');
    else if (result === 'offline') setError('Não foi possível falar com o servidor. Verifique a internet.');
    else {
      setPassword('');
      setOpen(false);
    }
  };

  const handleSyncNow = async () => {
    setBusy(true);
    const replaced = await reconcile();
    if (!replaced) await pushNow();
    setBusy(false);
    if (replaced) window.location.reload();
  };

  return (
    <>
      <button
        id="btn-cloud-sync"
        onClick={() => setOpen(true)}
        title={STATUS_LABEL[status]}
        aria-label={STATUS_LABEL[status]}
        className={`flex items-center gap-1.5 h-9 px-2.5 rounded-md bg-white border border-[#e6e4e8] text-sm hover:border-stone-300 transition-colors ${tone}`}
      >
        <Icon className={`w-4 h-4 ${status === 'syncing' ? 'animate-pulse' : ''}`} />
        <span className="hidden md:inline whitespace-nowrap">{STATUS_LABEL[status]}</span>
      </button>

      {/* Portal: the sticky top bar's backdrop blur would otherwise trap the fixed modal */}
      {createPortal(
      <Modal
        aberto={open}
        aoFechar={() => setOpen(false)}
        titulo="Sincronização na nuvem"
        subtitulo="Os mesmos dados no celular e no computador"
        larguraMaxima="max-w-md"
      >
        {configured ? (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#f6f5f7] border border-[#e6e4e8]">
              <span className={`flex items-center gap-2 font-semibold ${tone}`}>
                <Icon className="w-4 h-4" />
                {STATUS_LABEL[status]}
              </span>
              <span className="text-xs text-stone-500">Última vez: {formatTime(getLastSyncedAt())}</span>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Cada alteração é salva na nuvem automaticamente, segundos depois. Ao abrir o app em outro aparelho, ele
              carrega a versão mais recente.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleSyncNow}
                disabled={busy}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-xs font-semibold disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
                Sincronizar agora
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Desconectar este aparelho da nuvem? Os dados continuam salvos aqui e na nuvem.')) {
                    disconnect();
                  }
                }}
                className="px-3 py-2 rounded-xl border border-[#e6e4e8] text-stone-600 hover:bg-stone-50 text-xs font-semibold"
              >
                Desconectar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4 text-sm">
            <p className="text-xs text-stone-600 leading-relaxed">
              Digite a senha de sincronização para ligar este aparelho à nuvem. Se a nuvem já tiver dados, eles
              substituem os deste aparelho; se estiver vazia, os dados deste aparelho vão para lá.
            </p>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha de sincronização"
              className="w-full px-3 py-2 rounded-xl border border-[#e6e4e8] focus:outline-none focus:border-[#8b1538] text-sm"
            />
            {error && <p className="text-xs text-rose-700">{error}</p>}
            <button
              type="submit"
              disabled={busy || !password.trim()}
              className="w-full px-3 py-2 rounded-xl bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-xs font-semibold disabled:opacity-60"
            >
              {busy ? 'Conectando…' : 'Conectar'}
            </button>
          </form>
        )}
      </Modal>,
        document.body,
      )}
    </>
  );
};
