import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface MetricCardProps {
  rotulo: string;
  sigla: string;
  valor: string;
  subtitulo?: string;
  explicacao: string;
  formula?: string;
  destaque?: boolean;
  corBorda?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  rotulo,
  sigla,
  valor,
  subtitulo,
  explicacao,
  formula,
  destaque,
}) => {
  const [aberto, setAberto] = useState(false);

  return (
    <div
      className={`relative bg-white text-stone-900 rounded-2xl p-4 sm:p-5 border transition-all duration-150 ${
        destaque
          ? 'border-[#8b1538]/30 shadow-xs ring-1 ring-[#8b1538]/10'
          : 'border-[#ece8e1] shadow-2xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
            {sigla} • {rotulo}
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-light tracking-tight font-mono text-stone-900">
              {valor}
            </span>
          </div>
          {subtitulo && (
            <p className="mt-1 text-xs text-stone-500">
              {subtitulo}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          title="Ver explicação da fórmula"
          aria-label={`Explicação de ${sigla}`}
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
      {aberto && (
        <div className="mt-3 pt-3 border-t border-[#f2ede4] text-xs text-stone-600 space-y-2">
          <p className="leading-relaxed">{explicacao}</p>
          {formula && (
            <div className="p-2 rounded-lg bg-[#faf8f5] text-[11px] font-mono text-stone-800 border border-[#ece8e1]">
              {formula}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
