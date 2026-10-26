import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  subtitulo?: string;
  larguraMaxima?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  aberto,
  aoFechar,
  titulo,
  subtitulo,
  larguraMaxima = 'max-w-lg',
  children,
}) => {
  useEffect(() => {
    const escListener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar();
    };
    if (aberto) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', escListener);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', escListener);
    };
  }, [aberto, aoFechar]);

  if (!aberto) return null;

  // Portal so sticky/blurred ancestors can't trap or clip the dialog
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-stone-900/40"
        onClick={aoFechar}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white text-stone-900 rounded-xl shadow-2xl w-full ${larguraMaxima} my-auto max-h-[92dvh] flex flex-col z-10 overflow-hidden`}
      >
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-stone-900 leading-tight">
              {titulo}
            </h3>
            {subtitulo && (
              <p className="mt-0.5 text-xs text-stone-500">
                {subtitulo}
              </p>
            )}
          </div>
          <button
            onClick={aoFechar}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-5 pt-1 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};
