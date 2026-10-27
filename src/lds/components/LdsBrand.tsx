/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CrestProps {
  className?: string;
  size?: number;
  color?: string; // default #8b1538
}

export const LdsCrest: React.FC<CrestProps> = ({
  className = '',
  size = 40,
  color = '#8b1538'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Brasão LDS FDR - Monograma LD com Coroa de Folhas"
    >
      {/* Laurel leaves wreath (heraldic branches around center) */}
      <g fill={color} fillRule="evenodd" clipRule="evenodd">
        {/* Left branch leaves */}
        <path d="M 28 32 C 22 28 16 35 20 42 C 24 38 27 35 28 32 Z" opacity="0.95" />
        <path d="M 22 45 C 15 44 14 52 19 57 C 23 53 23 48 22 45 Z" opacity="0.95" />
        <path d="M 24 60 C 18 63 21 72 27 72 C 29 67 27 62 24 60 Z" opacity="0.95" />
        <path d="M 33 73 C 28 78 35 85 41 83 C 40 78 36 74 33 73 Z" opacity="0.95" />
        
        {/* Right branch leaves */}
        <path d="M 72 32 C 78 28 84 35 80 42 C 76 38 73 35 72 32 Z" opacity="0.95" />
        <path d="M 78 45 C 85 44 86 52 81 57 C 77 53 77 48 78 45 Z" opacity="0.95" />
        <path d="M 76 60 C 82 63 79 72 73 72 C 71 67 73 62 76 60 Z" opacity="0.95" />
        <path d="M 67 73 C 72 78 65 85 59 83 C 60 78 64 74 67 73 Z" opacity="0.95" />
        
        {/* Top central foliage */}
        <path d="M 50 16 C 45 22 49 28 50 28 C 51 28 55 22 50 16 Z" />
        <path d="M 42 20 C 37 21 38 28 44 27 C 44 24 43 22 42 20 Z" />
        <path d="M 58 20 C 63 21 62 28 56 27 C 56 24 57 22 58 20 Z" />

        {/* Stem ribbons at base */}
        <path d="M 46 86 C 48 88 52 88 54 86 C 52 85 48 85 46 86 Z" />
        
        {/* Intertwined Monogram LD - Historic Academic Typography (Faculdade de Direito do Recife) */}
        {/* Letter L serif & stem */}
        <path d="M 36 32 H 45 V 65 H 58 V 70 H 36 V 65 H 41 V 37 H 36 Z" />
        {/* Letter D curve intertwined with L */}
        <path d="M 44 32 C 55 31 66 38 66 50 C 66 62 55 69 44 69 V 64 C 52 64 60 59 60 50 C 60 41 52 37 44 37 Z" />
        {/* Cross details of heraldry */}
        <circle cx="50" cy="50" r="2.5" />
        <path d="M 48 28 L 52 28 L 50 24 Z" />
      </g>
    </svg>
  );
};

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  light?: boolean;
  withSubtitle?: boolean;
}

export const LdsLogo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  light = false,
  withSubtitle = true
}) => {
  const crestColor = light ? '#f6f5f7' : '#8b1538';
  const textColor = light ? 'text-[#f6f5f7]' : 'text-[#8b1538]';
  const subtextColor = light ? 'text-[#f6f5f7]/80' : 'text-[#625d66]';
  const crestSize = size === 'sm' ? 28 : size === 'md' ? 36 : size === 'lg' ? 48 : 64;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <LdsCrest size={crestSize} color={crestColor} />
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight">
          <span
            className={`font-serif-title font-bold leading-none ${textColor} ${
              size === 'sm' ? 'text-xl' : size === 'md' ? 'text-2xl' : size === 'lg' ? 'text-3xl' : 'text-4xl'
            }`}
          >
            LDS<span className="text-[#625d66] mx-0.5">·</span>FDR
          </span>
        </div>
        {withSubtitle && size !== 'sm' && (
          <span
            className={`eyebrow-lds text-xs sm:text-xs font-medium tracking-[0.14em] mt-1 ${subtextColor}`}
          >
            Direito Societário & Mercado de Capitais • FDR
          </span>
        )}
      </div>
    </div>
  );
};
