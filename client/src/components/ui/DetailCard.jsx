import { MoreVertical } from 'lucide-react';
import cn from '../../utils/cn';

/**
 * The "Product Details" pattern from the reference: a white card with an
 * icon + title header, a 3-dot menu affordance, and a responsive grid of
 * label/value pairs separated by hairline dividers.
 */
export default function DetailCard({ icon: Icon, title, actions, children, className }) {
  return (
    <section
      className={cn(
        'rounded-card border border-gray-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && (
              <Icon className="h-[18px] w-[18px] shrink-0 text-gray-400 dark:text-slate-500" strokeWidth={2} />
            )}
            <h2 className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            <button
              type="button"
              aria-label="More options"
              title="More options"
              className="rounded-md p-1 text-gray-400 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-slate-800"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/**
 * Label/value grid. Dividers are drawn with ring offsets rather than borders
 * so they disappear cleanly at the wrap points on narrow screens.
 */
export function DetailGrid({ columns = 4, children, className }) {
  const cols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return <dl className={cn('grid grid-cols-1 gap-x-6 gap-y-5', cols, className)}>{children}</dl>;
}

export function DetailItem({ icon: Icon, label, value, className }) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1 break-words text-[15px] font-semibold text-gray-900 dark:text-white">
        {value === null || value === undefined || value === '' ? (
          <span className="font-normal text-gray-400 dark:text-slate-500">—</span>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}

/**
 * Toggle switch matching the reference: emerald when on, gray when off.
 *
 * `readOnly` renders the same control without interaction, for flags that
 * reflect record state the API exposes no endpoint to change - better than
 * a switch that silently does nothing when clicked.
 */
export function Toggle({ label, checked, onChange, readOnly = false, id }) {
  const isInteractive = Boolean(onChange) && !readOnly;

  return (
    <div className="flex items-center justify-between gap-3 rounded-control bg-gray-50 px-3 py-2 dark:bg-slate-800/60">
      <span
        id={id ? `${id}-label` : undefined}
        className="truncate text-[13px] font-medium text-gray-700 dark:text-slate-300"
      >
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        aria-labelledby={id ? `${id}-label` : undefined}
        aria-label={id ? undefined : label}
        disabled={!isInteractive}
        onClick={isInteractive ? () => onChange(!checked) : undefined}
        title={isInteractive ? undefined : 'Read-only'}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200',
          checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-slate-600',
          !isInteractive && 'cursor-default opacity-90',
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}
