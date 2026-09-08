import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import cn from '../../utils/cn';
import { IconAlertCircle, IconAlertTriangle, IconCheckCircle, IconInfo, IconX } from './icons';

const ToastContext = createContext(null);

const TONES = {
  success: {
    icon: IconCheckCircle,
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    icon: IconAlertCircle,
    accent: 'text-red-600 dark:text-red-400',
  },
  warning: {
    icon: IconAlertTriangle,
    accent: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: IconInfo,
    accent: 'text-sky-600 dark:text-sky-400',
  },
};

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message, { tone = 'info', duration = 4000 } = {}) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, tone }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      notify,
      dismiss,
      success: (message, options) => notify(message, { ...options, tone: 'success' }),
      error: (message, options) => notify(message, { ...options, tone: 'error' }),
      warning: (message, options) => notify(message, { ...options, tone: 'warning' }),
      info: (message, options) => notify(message, { ...options, tone: 'info' }),
    }),
    [notify, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
          role="region"
          aria-label="Notifications"
        >
          {toasts.map((toast) => {
            const tone = TONES[toast.tone] || TONES.info;
            const Icon = tone.icon;
            return (
              <div
                key={toast.id}
                role="status"
                aria-live="polite"
                className={cn(
                  'pointer-events-auto flex items-start gap-3 rounded-card border border-slate-200 bg-white p-3.5 shadow-overlay',
                  'animate-slide-in-right dark:border-slate-800 dark:bg-slate-900',
                )}
              >
                <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', tone.accent)} />
                <p className="min-w-0 flex-1 break-words text-sm text-slate-700 dark:text-slate-200">
                  {toast.message}
                </p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="shrink-0 rounded text-slate-400 transition-colors duration-200 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
