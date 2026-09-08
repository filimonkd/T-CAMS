import Button from './Button';
import { IconChevronLeft, IconChevronRight } from './icons';

/**
 * Page controls for client-side pagination. Purely presentational - the
 * caller owns the slicing (see hooks/useTableControls.js).
 */
export default function Pagination({ page, pageCount, total, pageSize, onPageChange }) {
  if (pageCount <= 1) {
    return null;
  }

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 dark:border-slate-800 sm:flex-row">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="font-medium text-slate-700 dark:text-slate-200">{first}</span>–
        <span className="font-medium text-slate-700 dark:text-slate-200">{last}</span> of{' '}
        <span className="font-medium text-slate-700 dark:text-slate-200">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          leadingIcon={IconChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="px-1 text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {page} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          trailingIcon={IconChevronRight}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
