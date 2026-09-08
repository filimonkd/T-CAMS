import cn from '../../utils/cn';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

const TONES = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
};

/**
 * A single figure with its label. `hint` explains what the number counts -
 * every value on this dashboard is derived from real API data, and the hint
 * says which, so no figure is mistaken for something it is not.
 */
export default function StatCard({ label, value, hint, icon: Icon, tone = 'brand', isLoading }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>
          {isLoading ? (
            <Skeleton className="mt-2 h-8 w-16" />
          ) : (
            <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-slate-900 dark:text-white">
              {value}
            </p>
          )}
          {hint && !isLoading && (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          )}
        </div>
        {Icon && (
          <span
            className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-control', TONES[tone] || TONES.brand)}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
    </Card>
  );
}
