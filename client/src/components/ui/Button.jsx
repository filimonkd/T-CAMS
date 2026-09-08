import cn from '../../utils/cn';
import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-brand-600 text-white shadow-subtle hover:bg-brand-700 active:bg-brand-800 dark:bg-brand-500 dark:hover:bg-brand-600',
  secondary:
    'bg-slate-900 text-white shadow-subtle hover:bg-slate-800 active:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white',
  outline:
    'border border-slate-300 bg-white text-slate-700 shadow-subtle hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white',
  danger:
    'bg-red-600 text-white shadow-subtle hover:bg-red-700 active:bg-red-800 dark:bg-red-600 dark:hover:bg-red-500',
  success:
    'bg-emerald-600 text-white shadow-subtle hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500',
};

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-9 gap-2 px-3.5 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
};

const ICON_SIZES = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-11 w-11',
};

/**
 * The single button in the app. `variant` covers the six styles in the brief;
 * `iconOnly` switches to a square hit area (an accessible name via aria-label
 * is then the caller's job).
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  iconOnly = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  className,
  disabled,
  children,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-control font-medium',
        'transition-colors duration-200',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANTS[variant] || VARIANTS.primary,
        iconOnly ? ICON_SIZES[size] || ICON_SIZES.md : SIZES[size] || SIZES.md,
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner className={iconOnly ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      ) : (
        LeadingIcon && <LeadingIcon className="h-4 w-4" />
      )}
      {!iconOnly && children}
      {!iconOnly && !isLoading && TrailingIcon && <TrailingIcon className="h-4 w-4" />}
    </button>
  );
}
