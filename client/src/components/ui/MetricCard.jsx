import { ArrowDown, ArrowUp, MoreVertical } from 'lucide-react';
import cn from '../../utils/cn';
import Skeleton from './Skeleton';

/**
 * The stat card from the reference: small gray title, large bold value, and
 * a comparison line with a pill-shaped trend indicator.
 *
 * `comparison` and `trend` are optional on purpose. A metric with no real
 * prior-period figure renders the value alone rather than a fabricated
 * delta - see the callers, which only pass a trend when the API supplies
 * the baseline.
 */
export default function MetricCard({
  label,
  value,
  comparison,
  trend,
  trendDirection = 'up',
  hint,
  isLoading = false,
  className,
}) {
  const isUp = trendDirection === 'up';
  const TrendIcon = isUp ? ArrowUp : ArrowDown;

  return (
    <div
      className={cn(
        'rounded-card border border-gray-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-[13px] text-gray-500 dark:text-slate-400">{label}</p>
        <button
          type="button"
          aria-label={`More options for ${label}`}
          className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-gray-300 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-500 dark:text-slate-600 dark:hover:bg-slate-800"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-28" />
      ) : (
        <p className="tabular mt-1 text-[26px] font-semibold leading-tight tracking-tight text-gray-900 dark:text-white">
          {value}
        </p>
      )}

      {!isLoading && (comparison || trend || hint) && (
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 truncate text-xs text-gray-500 dark:text-slate-400">
            {comparison || hint}
          </p>
          {trend && (
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                isUp
                  ? 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/25'
                  : 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/25',
              )}
            >
              <TrendIcon className="h-3 w-3" strokeWidth={2.5} />
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
