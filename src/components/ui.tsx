// Shared UI primitives for the Bruna OS design system.
// Plain white panels on the neutral canvas, one bordeaux accent, Inter throughout.
import React from 'react';
import { ArrowRight } from 'lucide-react';

export const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

/** A white section with a plain heading row. Never nest one Panel inside another. */
export const Panel: React.FC<{
  title?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}> = ({ title, meta, actions, children, className, bodyClassName, id }) => (
  <section id={id} className={cx('bg-white border border-[#e6e4e8] rounded-xl', className)}>
    {(title || actions) && (
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-5 pt-4 pb-3">
        <div className="flex items-baseline gap-2 min-w-0 max-w-full shrink-0">
          {title && <h2 className="text-[15px] font-semibold text-[#1c1a1e] truncate">{title}</h2>}
          {meta !== undefined && meta !== null && meta !== '' && (
            <span className="text-sm text-stone-500 tabular-nums">{meta}</span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>
    )}
    <div className={cx('px-5 pb-5', !title && !actions && 'pt-5', bodyClassName)}>{children}</div>
  </section>
);

/** Row above a page's content: optional short context on the left, page actions on the right. */
export const PageActions: React.FC<{ children?: React.ReactNode; aside?: React.ReactNode }> = ({ children, aside }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
    <div className="min-w-0 text-sm text-stone-600">{aside}</div>
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  </div>
);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-[#8b1538] text-white hover:bg-[#6f0f2c] border border-transparent',
  secondary: 'bg-white text-[#1c1a1e] border border-[#e6e4e8] hover:border-stone-300',
  ghost: 'text-stone-600 hover:text-[#1c1a1e] hover:bg-stone-100 border border-transparent',
  danger: 'bg-white text-[#8b1538] border border-[#ead3da] hover:bg-[#f7ecef]',
};

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: 'sm' | 'md';
    icon?: React.ElementType;
  }
> = ({ variant = 'secondary', size = 'md', icon: Icon, className, children, type = 'button', ...rest }) => (
  <button
    type={type}
    className={cx(
      'inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap',
      size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-9 px-3.5 text-sm',
      BUTTON_STYLES[variant],
      className,
    )}
    {...rest}
  >
    {Icon && <Icon className="w-4 h-4 shrink-0" />}
    {children}
  </button>
);

/** Text link with an arrow, for "go to section" actions */
export const LinkButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-[#8b1538]">
    {children}
    <ArrowRight className="w-3.5 h-3.5" />
  </button>
);

export const Segmented = <T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
}) => (
  <div role="tablist" className={cx('inline-flex p-0.5 rounded-md bg-stone-100 text-[13px]', className)}>
    {options.map((o) => (
      <button
        key={o.value}
        role="tab"
        aria-selected={value === o.value}
        onClick={() => onChange(o.value)}
        className={cx(
          'h-7 px-2.5 rounded-[5px] transition-colors whitespace-nowrap',
          value === o.value ? 'bg-white text-[#1c1a1e] font-medium shadow-xs' : 'text-stone-600 hover:text-[#1c1a1e]',
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/** Horizontal section tabs used inside a module (Faculdade, Liga, Rotina) */
export const SectionTabs = <T extends string>({
  value,
  onChange,
  tabs,
  trailing,
}: {
  value: T;
  onChange: (value: T) => void;
  tabs: { id: T; label: string; icon?: React.ElementType }[];
  /** Extra control at the end of the bar (e.g. a link that opens a dialog) */
  trailing?: React.ReactNode;
}) => (
  <div className="-mx-4 sm:mx-0 mb-6 border-b border-[#e6e4e8] overflow-x-auto">
    <div role="tablist" className="flex gap-1 px-4 sm:px-0 min-w-max">
      {tabs.map((t) => {
        const active = t.id === value;
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={cx(
              'relative flex items-center gap-1.5 h-10 px-3 text-sm transition-colors',
              active ? 'text-[#1c1a1e] font-medium' : 'text-stone-500 hover:text-[#1c1a1e]',
            )}
          >
            {Icon && <Icon className={cx('w-4 h-4', active ? 'text-[#8b1538]' : 'text-stone-400')} />}
            {t.label}
            {active && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-[#8b1538] rounded-full" />}
          </button>
        );
      })}
      {trailing && <div className="ml-auto pl-4 flex items-center">{trailing}</div>}
    </div>
  </div>
);

export const Label: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-[13px] font-medium text-stone-700 mb-1">
    {children}
  </label>
);

const FIELD = 'w-full h-9 px-3 text-sm rounded-md border border-[#e6e4e8] bg-white text-[#1c1a1e] focus:outline-none focus:border-[#8b1538]';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => <input ref={ref} className={cx(FIELD, className)} {...rest} />,
);
Input.displayName = 'Input';

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...rest }) => (
  <select className={cx(FIELD, 'pr-8', className)} {...rest}>
    {children}
  </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...rest }) => (
  <textarea
    className={cx(
      'w-full p-3 text-sm leading-relaxed rounded-md border border-[#e6e4e8] bg-white text-[#1c1a1e] focus:outline-none focus:border-[#8b1538]',
      className,
    )}
    {...rest}
  />
);

export const EmptyState: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-stone-500 py-6 text-center">{children}</p>
);

/** Small neutral tag; tone="brand" for the single emphasised state */
export const Tag: React.FC<{ children: React.ReactNode; tone?: 'neutral' | 'brand' | 'success' | 'warning' }> = ({
  children,
  tone = 'neutral',
}) => (
  <span
    className={cx(
      'inline-flex items-center h-5 px-1.5 rounded text-xs font-medium whitespace-nowrap',
      tone === 'neutral' && 'bg-stone-100 text-stone-600',
      tone === 'brand' && 'bg-[#f7ecef] text-[#8b1538]',
      tone === 'success' && 'bg-emerald-50 text-emerald-800',
      tone === 'warning' && 'bg-amber-50 text-amber-800',
    )}
  >
    {children}
  </span>
);
