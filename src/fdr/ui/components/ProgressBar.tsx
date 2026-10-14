import React from 'react';

interface ProgressBarProps {
  titulo: string;
  atual: number;
  total: number;
  porcentagem: number;
  corBarra?: string;
  unidade?: string;
  subtitulo?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  titulo,
  atual,
  total,
  porcentagem,
  corBarra = 'bg-emerald-700',
  unidade = 'h',
  subtitulo,
}) => {
  const p = Math.min(100, Math.max(0, porcentagem));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-stone-800 font-medium">{titulo}</span>
          {subtitulo && (
            <span className="ml-1.5 text-stone-400 font-normal">
              ({subtitulo})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-stone-500 font-mono">
          <span className="font-medium text-stone-900">
            {atual.toLocaleString('pt-BR')}
          </span>
          <span>/</span>
          <span>
            {total.toLocaleString('pt-BR')} {unidade}
          </span>
          <span className="ml-1 px-1.5 py-0.2 rounded-md text-[10px] font-semibold bg-[#faf8f5] text-stone-700 border border-[#ece8e1]">
            {p}%
          </span>
        </div>
      </div>
      <div className="w-full h-2 rounded-full bg-[#f2ede4] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${corBarra}`}
          style={{ width: `${p}%` }}
        />
      </div>
    </div>
  );
};
