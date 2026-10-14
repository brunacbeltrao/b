import React, { useEffect } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={aoFechar}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative bg-white text-stone-900 rounded-2xl shadow-xl border border-[#ece8e1] w-full ${larguraMaxima} my-auto max-h-[92dvh] flex flex-col z-10 overflow-hidden`}
      >
        <div className="px-5 py-4 border-b border-[#ece8e1] flex items-start justify-between gap-4 bg-[#faf8f5]">
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
        <div className="p-5 overflow-y-auto space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
