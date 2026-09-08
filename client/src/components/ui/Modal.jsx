import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import cn from '../../utils/cn';
import Button from './Button';
import { IconX } from './icons';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Portal-rendered dialog with a blurred backdrop.
 *
 * Handles the accessibility basics the old inline overlay skipped: Escape to
 * close, a click on the backdrop (but not the panel) to close, body scroll
 * lock, initial focus into the panel, and focus restored to whatever opened it.
 */
export default function Modal({ isOpen, onClose, title, description, footer, size = 'md', children }) {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current = document.activeElement;

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    // Focus the panel itself rather than guessing at a first field, so screen
    // readers announce the dialog title before its contents.
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-900/40 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
        className={cn(
          'w-full rounded-t-card bg-white shadow-overlay outline-none animate-scale-in',
          'dark:bg-slate-900 dark:ring-1 dark:ring-slate-800',
          'sm:rounded-card',
          SIZES[size] || SIZES.md,
        )}
      >
        {(title || onClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div className="min-w-0">
              {title && (
                <h2 id="modal-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
              )}
            </div>
            <Button variant="ghost" size="sm" iconOnly leadingIcon={IconX} onClick={onClose} aria-label="Close dialog" />
          </div>
        )}

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
