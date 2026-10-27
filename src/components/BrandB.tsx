import React from 'react';

interface BrandBIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Kept for API compatibility; the mark no longer glows */
  withGlow?: boolean;
}

const SIZES = {
  sm: 'w-7 h-7 text-[15px] rounded-md',
  md: 'w-8 h-8 text-base rounded-lg',
  lg: 'w-10 h-10 text-lg rounded-lg',
  xl: 'w-12 h-12 text-xl rounded-xl',
};

/** Monogram: a serif "B" on the brand bordeaux. */
export const BrandBIcon: React.FC<BrandBIconProps> = ({ size = 'md', className = '' }) => (
  <div
    aria-hidden="true"
    className={`flex items-center justify-center shrink-0 select-none bg-[#8b1538] text-white font-display leading-none ${SIZES[size]} ${className}`}
  >
    B
  </div>
);

interface BrandBLogoProps {
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandBLogo: React.FC<BrandBLogoProps> = ({ subtitle, className = '', size = 'md' }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <BrandBIcon size={size} />
    <div className="min-w-0 leading-tight">
      <div className="text-[15px] font-semibold text-[#1c1a1e]">Bruna OS</div>
      {subtitle && <div className="text-xs text-stone-500 truncate">{subtitle}</div>}
    </div>
  </div>
);
