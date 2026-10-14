import React from 'react';

interface BrandBIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withGlow?: boolean;
}

export const BrandBIcon: React.FC<BrandBIconProps> = ({
  size = 'md',
  className = '',
  withGlow = true,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-sm rounded-lg',
    md: 'w-9 h-9 text-lg rounded-xl',
    lg: 'w-11 h-11 text-xl rounded-2xl',
    xl: 'w-14 h-14 text-2xl rounded-2xl',
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none shrink-0 transition-transform hover:scale-[1.03] active:scale-[0.98] ${sizeMap[size]} ${className}`}
    >
      {/* Outer subtle shadow / glow */}
      {withGlow && (
        <div className="absolute inset-0 rounded-[inherit] bg-[#8b1538]/20 blur-md -z-10 opacity-70" />
      )}

      {/* Main Luxury Obsidian Container */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-[#1f1d1c] via-[#141212] to-[#0a0909] border border-white/15 shadow-sm ring-1 ring-black/40" />

      {/* Subtle diagonal specular highlight (Lovable signature sheen) */}
      <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-[inherit] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* Haute Couture Stylized Serif "B" Monogram */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[62%] h-[62%] relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
      >
        <defs>
          <linearGradient id="lovableBGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#fdf8f4" />
            <stop offset="100%" stopColor="#e5c8c5" />
          </linearGradient>
        </defs>
        {/* Elegant sculpted serif 'B' letterform with high-contrast serifs */}
        <path
          d="M7 6.5C7 5.95 7.45 5.5 8 5.5H16.5C20.09 5.5 22.8 7.7 22.8 11.2C22.8 13.4 21.4 15.1 19.3 15.9C22.2 16.7 24 18.9 24 22.2C24 26.2 20.8 28.5 16.6 28.5H8C7.45 28.5 7 28.05 7 27.5V6.5ZM11.8 14H16.2C18.1 14 19.3 12.9 19.3 11.3C19.3 9.7 18.1 8.7 16.2 8.7H11.8V14ZM11.8 25.3H16.4C18.7 25.3 20.2 24.1 20.2 22.1C20.2 20.1 18.7 18.9 16.4 18.9H11.8V25.3Z"
          fill="url(#lovableBGrad)"
        />
        {/* Subtle accent diamond/sparkle mark near top serif */}
        <circle cx="24.5" cy="7.5" r="1.3" fill="#8b1538" className="opacity-90" />
      </svg>
    </div>
  );
};

interface BrandBLogoProps {
  subtitle?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BrandBLogo: React.FC<BrandBLogoProps> = ({
  subtitle = 'Personal Operating System',
  className = '',
  size = 'md',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BrandBIcon size={size} />
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-serif-title font-semibold text-lg md:text-xl text-[#1f1d1c] tracking-tight">
            Bruna
          </span>
          <span className="font-serif-title italic font-normal text-lg md:text-xl text-[#8b1538] tracking-tight">
            OS
          </span>
        </div>
        <p className="text-[10px] text-stone-400 font-sans-ui uppercase tracking-[0.14em] font-medium mt-1 truncate">
          {subtitle}
        </p>
      </div>
    </div>
  );
};
