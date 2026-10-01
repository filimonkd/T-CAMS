import cn from '../../utils/cn';

/**
 * Underline tabs from the reference: active tab is blue text with a 2px blue
 * bottom border; the rest are gray. Scrolls horizontally on narrow screens
 * rather than wrapping, so the row keeps its single-line rhythm.
 */
export default function Tabs({ tabs, value, onChange, className }) {
  return (
    <div
      className={cn('scrollbar-slim -mb-px flex gap-1 overflow-x-auto border-b border-gray-200 px-5 dark:border-slate-800', className)}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === value;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`tab-${tab.key}`}
            aria-selected={isActive}
            aria-controls={`panel-${tab.key}`}
            onClick={() => onChange(tab.key)}
            className={cn(
              'relative shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-[13px] font-medium transition-colors duration-200',
              isActive
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white',
            )}
          >
            {tab.label}
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] tabular',
                  isActive
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400',
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ tabKey, value, children }) {
  if (tabKey !== value) return null;
  return (
    <div role="tabpanel" id={`panel-${tabKey}`} aria-labelledby={`tab-${tabKey}`}>
      {children}
    </div>
  );
}
