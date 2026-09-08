import cn from '../../utils/cn';

/**
 * Horizontal scroll is confined to this wrapper so the page never scrolls
 * sideways.
 *
 * `relative` is load-bearing, not decoration: an absolutely positioned
 * descendant is only clipped by a scroll container that is in its containing
 * block chain. Without it, `sr-only` (which is `position: absolute`) resolved
 * against the viewport, escaped this box, and widened the whole document on
 * narrow screens.
 */
export function TableContainer({ className, children }) {
  return <div className={cn('relative w-full overflow-x-auto', className)}>{children}</div>;
}

export function Table({ className, children }) {
  return <table className={cn('min-w-full border-collapse text-sm', className)}>{children}</table>;
}

export function THead({ className, children }) {
  return (
    <thead className={cn('bg-slate-50/80 dark:bg-slate-800/50', className)}>{children}</thead>
  );
}

export function TH({ className, children, align = 'left', ...props }) {
  return (
    <th
      scope="col"
      className={cn(
        'whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500',
        'dark:text-slate-400',
        align === 'right' && 'text-right',
        align === 'left' && 'text-left',
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TBody({ className, children }) {
  return (
    <tbody className={cn('divide-y divide-slate-100 dark:divide-slate-800', className)}>
      {children}
    </tbody>
  );
}

export function TR({ className, children, ...props }) {
  return (
    <tr
      className={cn('transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50', className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TD({ className, children, align = 'left', ...props }) {
  return (
    <td
      className={cn(
        'px-5 py-3.5 text-slate-700 dark:text-slate-300',
        align === 'right' && 'text-right',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}
