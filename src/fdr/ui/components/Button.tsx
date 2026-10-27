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
      'inline-flex items-center justify-center font-medium transition-colors text-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

    let variantStyles = '';
    switch (variant) {
      case 'leaf':
        variantStyles =
          'bg-[#8b1538] text-white hover:bg-[#6f0f2c]';
        break;
      case 'soft':
        variantStyles =
          'bg-white text-[#1c1a1e] border border-[#e6e4e8] hover:border-stone-300';
        break;
      case 'ghost':
        variantStyles = 'bg-transparent text-stone-800 hover:bg-stone-100';
        break;
      case 'outline':
        variantStyles =
          'bg-transparent border border-[#e6e4e8] text-[#1c1a1e] hover:border-stone-300';
        break;
      case 'default':
        variantStyles =
          'bg-[#1c1a1e] text-white hover:bg-stone-800';
        break;
      case 'destructive':
        variantStyles =
          'bg-white text-[#8b1538] border border-[#ead3da] hover:bg-[#f7ecef]';
        break;
      case 'link':
        variantStyles =
          'bg-transparent text-[#8b1538] hover:underline p-0 h-auto font-normal';
        break;
      case 'chip':
        variantStyles = active
          ? 'bg-[#f7ecef] text-[#6f0f2c] font-medium rounded-full border border-[#ead3da]'
          : 'bg-white text-stone-600 hover:text-stone-900 border border-[#e6e4e8] rounded-full hover:bg-stone-50';
        break;
    }

    let sizeStyles = '';
    if (variant === 'chip') {
      sizeStyles = 'h-7 px-2.5 text-[13px]';
    } else {
      switch (size) {
        case 'sm':
          sizeStyles = 'h-8 px-2.5 text-[13px] gap-1.5';
          break;
        case 'lg':
          sizeStyles = 'h-10 px-5 text-sm gap-2';
          break;
        case 'icon':
          sizeStyles = 'h-9 w-9 p-0';
          break;
        case 'default':
        default:
          sizeStyles = 'h-9 px-3.5 text-sm gap-1.5';
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
