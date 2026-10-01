import cn from '../../utils/cn';
import EmptyState from './EmptyState';
import { SkeletonTable } from './Skeleton';

/**
 * Minimal table matching the reference: no vertical rules, a tinted header
 * row, hairline row dividers and a gray hover.
 *
 * Columns are declared as
 *   { key, label, align?: 'left' | 'right', render?: (row) => node, className? }
 * and `align: 'right'` is what numeric columns (quantity, cost, total) use.
 *
 * Horizontal scroll is confined to the wrapper. `relative` on it is
 * load-bearing: `sr-only` is position:absolute, and without a positioned
 * ancestor it escapes the scroll box and widens the whole document on narrow
 * screens.
 */
export default function DataTable({
  columns,
  rows,
  rowKey = (row, index) => row._id ?? index,
  isLoading = false,
  emptyState,
  onRowClick,
  className,
}) {
  if (isLoading) {
    return <SkeletonTable rows={5} columns={Math.min(columns.length, 5)} />;
  }

  if (!rows.length) {
    return emptyState ?? <EmptyState title="No records" description="There is nothing to show here yet." />;
  }

  return (
    <div className={cn('relative w-full overflow-x-auto', className)}>
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-gray-50 dark:bg-slate-800/50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-5 py-2.5 text-xs font-medium text-gray-500 dark:text-slate-400',
                  column.align === 'right' ? 'text-right' : 'text-left',
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                'transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/50',
                onRowClick && 'cursor-pointer',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'px-5 py-3 text-gray-700 dark:text-slate-300',
                    column.align === 'right' && 'tabular text-right',
                    column.className,
                  )}
                >
                  {column.render ? column.render(row) : formatCell(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') {
    return value.name || value.code || value.title || value._id || JSON.stringify(value);
  }
  return String(value);
}
