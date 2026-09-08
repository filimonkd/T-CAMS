import cn from '../../utils/cn';

export default function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-card border border-slate-200 bg-white shadow-card',
        'dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, actions }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4',
        'dark:border-slate-800',
        className,
      )}
    >
      <div className="min-w-0">{children}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function CardTitle({ className, children }) {
  return (
    <h2 className={cn('text-sm font-semibold text-slate-900 dark:text-white', className)}>{children}</h2>
  );
}

export function CardDescription({ className, children }) {
  return (
    <p className={cn('mt-0.5 text-xs text-slate-500 dark:text-slate-400', className)}>{children}</p>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('p-5', className)}>{children}</div>;
}
