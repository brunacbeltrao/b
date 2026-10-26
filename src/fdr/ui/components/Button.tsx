import React from 'react';

export type ButtonVariant =
  | 'leaf'
  | 'soft'
  | 'ghost'
  | 'outline'
  | 'default'
  | 'destructive'
  | 'link'
  | 'chip';

export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'soft',
      size = 'default',
      active = false,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-medium transition-colors text-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer select-none';

    let variantStyles = '';
    switch (variant) {
      case 'leaf':
        variantStyles =
          'bg-emerald-800 text-white hover:bg-emerald-900 shadow-xs font-medium';
        break;
      case 'soft':
        variantStyles =
          'bg-white text-stone-800 border border-[#e6e4e8] hover:bg-stone-50 shadow-2xs';
        break;
      case 'ghost':
        variantStyles = 'bg-transparent text-stone-800 hover:bg-stone-100';
        break;
      case 'outline':
        variantStyles =
          'bg-transparent border border-stone-300 text-stone-800 hover:bg-stone-50';
        break;
      case 'default':
        variantStyles =
          'bg-stone-900 text-white hover:bg-stone-800 shadow-2xs';
        break;
      case 'destructive':
        variantStyles =
          'bg-rose-700 text-white hover:bg-rose-800 shadow-2xs';
        break;
      case 'link':
        variantStyles =
          'bg-transparent text-emerald-800 hover:underline p-0 h-auto font-normal';
        break;
      case 'chip':
        variantStyles = active
          ? 'bg-stone-900 text-white font-medium rounded-full border border-stone-900'
          : 'bg-white text-stone-600 hover:text-stone-900 border border-[#e6e4e8] rounded-full hover:bg-stone-50';
        break;
    }

    let sizeStyles = '';
    if (variant === 'chip') {
      sizeStyles = 'h-8 px-3 text-xs';
    } else {
      switch (size) {
        case 'sm':
          sizeStyles = 'h-8 px-3 text-xs gap-1.5';
          break;
        case 'lg':
          sizeStyles = 'h-10 px-8 text-sm gap-2';
          break;
        case 'icon':
          sizeStyles = 'h-9 w-9 p-0';
          break;
        case 'default':
        default:
          sizeStyles = 'h-9 px-4 text-sm gap-2';
          break;
      }
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${base} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
