import React, { useState } from 'react';
import { PontoGraficoIndice } from '../../store/selectors';

interface IndicesChartProps {
  pontos: PontoGraficoIndice[];
}

export const IndicesChart: React.FC<IndicesChartProps> = ({ pontos }) => {
  const [pontoAtivo, setPontoAtivo] = useState<PontoGraficoIndice | null>(null);

  if (!pontos || pontos.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-stone-400">
        Nenhum histórico semestral concluído para exibir no gráfico.
      </div>
    );
  }

  const width = 640;
  const height = 220;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const todasNotas = pontos.flatMap((p) => [p.cr, p.mc]);
  const minNota = Math.max(5, Math.floor(Math.min(...todasNotas) * 10) / 10 - 0.5);
  const maxNota = Math.min(10, Math.ceil(Math.max(...todasNotas) * 10) / 10 + 0.5);

  const getX = (index: number) => {
    if (pontos.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (pontos.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const ratio = (val - minNota) / (maxNota - minNota || 1);
    return height - paddingBottom - ratio * chartHeight;
  };

  const pontosCr = pontos.map((p, i) => `${getX(i)},${getY(p.cr)}`).join(' ');
  const pontosMc = pontos.map((p, i) => `${getX(i)},${getY(p.mc)}`).join(' ');

  const linhasY = [6.0, 7.0, 8.0, 9.0, 10.0].filter(
    (n) => n >= minNota && n <= maxNota
  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#625d66] inline-block" />
            <span className="text-stone-500">CR (Coeficiente de Rendimento)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b1538] inline-block" />
            <span className="text-stone-900 font-semibold">MC (Média de Conclusão)</span>
          </div>
        </div>
        {pontoAtivo ? (
          <div className="text-xs bg-[#f6f5f7] text-stone-800 px-2.5 py-1 rounded-lg flex items-center gap-3 font-mono border border-[#e6e4e8]">
            <span className="font-semibold text-stone-900">
              {pontoAtivo.semestre}:
            </span>
            <span className="text-stone-500">
              CR {pontoAtivo.cr.toFixed(2)}
            </span>
            <span className="text-[#8b1538] font-bold">
              MC {pontoAtivo.mc.toFixed(2)}
            </span>
            <span className="text-stone-400">({pontoAtivo.chAcumulada}h)</span>
          </div>
        ) : (
          <span className="text-[11px] text-stone-400">Passe o cursor sobre os pontos</span>
        )}
      </div>
      <div className="w-full overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[500px] select-none"
        >
          {linhasY.map((yVal) => {
            const y = getY(yVal);
            return (
              <g key={yVal}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#e8e2d8"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-stone-400 text-[10px] font-mono"
                >
                  {yVal.toFixed(1)}
                </text>
              </g>
            );
          })}
          {/* Linha do CR */}
          <polyline
            fill="none"
            stroke="#625d66"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pontosCr}
          />
          {/* Linha da MC */}
          <polyline
            fill="none"
            stroke="#8b1538"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pontosMc}
          />
          {/* Pontos */}
          {pontos.map((p, i) => {
            const cx = getX(i);
            const cyCr = getY(p.cr);
            const cyMc = getY(p.mc);
            const isHovered = pontoAtivo?.semestre === p.semestre;
            return (
              <g
                key={p.semestre}
                onMouseEnter={() => setPontoAtivo(p)}
                onMouseLeave={() => setPontoAtivo(null)}
                className="cursor-pointer"
              >
                <line
                  x1={cx}
                  y1={paddingTop}
                  x2={cx}
                  y2={height - paddingBottom}
                  stroke={isHovered ? '#8b1538' : 'transparent'}
                  strokeDasharray="2 2"
                  className="transition-colors"
                />
                <circle
                  cx={cx}
                  cy={cyCr}
                  r={isHovered ? 5 : 3.5}
                  fill="#625d66"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all"
                />
                <circle
                  cx={cx}
                  cy={cyMc}
                  r={isHovered ? 6 : 4}
                  fill="#8b1538"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all"
                />
                <text
                  x={cx}
                  y={height - paddingBottom + 20}
                  textAnchor="middle"
                  className={`text-[11px] font-mono ${
                    isHovered
                      ? 'fill-stone-900 font-semibold'
                      : 'fill-stone-500'
                  }`}
                >
                  {p.semestre}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
