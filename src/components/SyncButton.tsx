import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Cloud, CloudCheck, CloudOff, CloudAlert, RefreshCw } from 'lucide-react';
import { Modal } from '../fdr/ui/components/Modal';
import { logout } from '../auth/session';
import { GOOGLE_CONNECT_URL, disconnectGoogle, useGoogleStatus } from '../google/api';
import {
  SyncStatus,
  getLastSyncedAt,
  getSyncStatus,
  isSyncConfigured,
  pushNow,
  reconcile,
  subscribeSyncStatus,
} from '../sync/cloudSync';

const STATUS_LABEL: Record<SyncStatus, string> = {
  off: 'Sem nuvem',
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
        titulo="Conta e conexões"
        larguraMaxima="max-w-md"
      >
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#f6f5f7] border border-[#e6e4e8]">
            <span className={`flex items-center gap-2 font-medium ${tone}`}>
              <Icon className="w-4 h-4" />
              {STATUS_LABEL[status]}
            </span>
            <span className="text-xs text-stone-500">Última vez: {formatTime(getLastSyncedAt())}</span>
          </div>
          <p className="text-[13px] text-stone-600 leading-relaxed">
            {configured
              ? 'Cada alteração vai para a nuvem segundos depois. Em outro aparelho, entre com a mesma senha.'
              : 'Sem conexão com o servidor agora. As alterações ficam neste aparelho e sobem quando a internet voltar.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSyncNow}
              disabled={busy || !configured}
              className="flex-1 flex items-center justify-center gap-2 h-9 rounded-md bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-sm font-medium disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
              Sincronizar agora
            </button>
            <button
              onClick={() => {
                if (window.confirm('Sair deste aparelho? Seus dados continuam salvos na nuvem.')) logout();
              }}
              className="h-9 px-3 rounded-md border border-[#e6e4e8] text-stone-700 hover:border-stone-300 text-sm"
            >
              Sair
            </button>
          </div>
          <GoogleConnection />
        </div>
      </Modal>,
        document.body,
      )}
    </>
  );
};

const GoogleConnection: React.FC = () => {
  const { status, refresh } = useGoogleStatus();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="pt-4 border-t border-[#e6e4e8]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-[#1c1a1e]">Google</div>
          <div className="text-xs text-stone-500 truncate">
            {!status
              ? 'Verificando…'
              : !status.configured
                ? 'Ainda não configurado no servidor'
                : status.connected
                  ? `Conectado: ${status.email || 'conta Google'}`
                  : 'Agenda e faturas do Gmail'}
          </div>
        </div>
        {!status?.configured ? null : status.connected ? (
          <button
            disabled={busy}
            onClick={async () => {
              if (!window.confirm('Desconectar o Google? A agenda e a leitura de faturas param até você conectar de novo.')) return;
              setBusy(true);
              try {
                await disconnectGoogle();
              } finally {
                await refresh();
                setBusy(false);
              }
            }}
            className="h-8 px-2.5 rounded-md border border-[#e6e4e8] text-[13px] text-stone-700 hover:border-stone-300 disabled:opacity-50"
          >
            Desconectar
          </button>
        ) : (
          <a
            href={GOOGLE_CONNECT_URL}
            className="h-8 px-2.5 inline-flex items-center rounded-md bg-[#8b1538] hover:bg-[#6f0f2c] text-white text-[13px] font-medium"
          >
            Conectar Google
          </a>
        )}
      </div>
    </div>
  );
};
