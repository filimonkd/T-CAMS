import { useId } from 'react';
import cn from '../../utils/cn';
import { Field } from './Input';
import { ChevronDown } from 'lucide-react';

export default function Select({ label, hint, error, className, id, required, options = [], children, ...props }) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select
          id={selectId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          className={cn(
            'h-9 w-full appearance-none rounded-control border bg-white pl-3 pr-9 text-sm text-gray-900 shadow-subtle',
            'transition-colors duration-200 disabled:cursor-not-allowed disabled:bg-gray-50',
            'dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800',
            error
              ? 'border-red-400 focus:border-red-500 dark:border-red-500/70'
              : 'border-gray-300 focus:border-brand-600 dark:border-slate-700 dark:focus:border-brand-500',
          )}
          {...props}
        >
          {children ||
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </Field>
  );
}
