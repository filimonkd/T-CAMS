import { useId } from 'react';
import cn from '../../utils/cn';

const CONTROL_BASE =
  'w-full rounded-control border bg-white px-3 text-sm text-slate-900 shadow-subtle transition-colors duration-200 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:disabled:bg-slate-800';

const CONTROL_BORDER =
  'border-slate-300 focus:border-brand-600 dark:border-slate-700 dark:focus:border-brand-500';

const CONTROL_BORDER_ERROR = 'border-red-400 focus:border-red-500 dark:border-red-500/70';

/** Shared wrapper so Input/Textarea/Select all get the same label + help + error layout. */
export function Field({ id, label, hint, error, required, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export default function Input({ label, hint, error, className, id, required, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={inputId}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn('h-9', CONTROL_BASE, error ? CONTROL_BORDER_ERROR : CONTROL_BORDER)}
        {...props}
      />
    </Field>
  );
}

export function Textarea({ label, hint, error, className, id, required, rows = 3, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        className={cn('py-2', CONTROL_BASE, error ? CONTROL_BORDER_ERROR : CONTROL_BORDER)}
        {...props}
      />
    </Field>
  );
}
