import { useState } from 'react';
import api, { getErrorMessage } from '../../api/axios';

const VARIANT_CLASSES = {
  success: 'bg-emerald-600 hover:bg-emerald-500',
  danger: 'bg-red-600 hover:bg-red-500',
  neutral: 'bg-slate-600 hover:bg-slate-500',
};

/**
 * Reusable action button for any workflow transition (approve/reject/
 * escalate/etc.) defined in moduleConfig.js. Actions with `inputs` open a
 * small confirm modal to collect a request body first; actions with none
 * fire immediately. Calls onDone() after a successful request so the
 * caller (WorkflowDetail) can refetch the record and its history.
 */
export default function ApprovalAction({ action, recordId, onDone }) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hasInputs = Boolean(action.inputs && action.inputs.length > 0);
  const variantClass = VARIANT_CLASSES[action.variant] || VARIANT_CLASSES.neutral;

  async function run() {
    setIsSubmitting(true);
    setError('');
    try {
      await api({ method: action.method || 'post', url: action.path(recordId), data: values });
      setIsOpen(false);
      setValues({});
      onDone?.();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClick() {
    if (hasInputs) {
      setIsOpen(true);
    } else {
      run();
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`rounded px-3 py-1.5 text-sm font-medium text-white ${variantClass}`}
      >
        {action.label}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded bg-white p-5 shadow-lg">
            <h3 className="mb-3 text-base font-semibold text-slate-900">{action.label}</h3>
            {error && <p className="mb-3 rounded bg-red-50 px-2 py-1 text-sm text-red-700">{error}</p>}
            <div className="space-y-3">
              {action.inputs.map((input) => (
                <label key={input.key} className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-slate-700">{input.label}</span>
                  <input
                    type={input.type || 'text'}
                    value={values[input.key] || ''}
                    onChange={(event) => setValues((prev) => ({ ...prev, [input.key]: event.target.value }))}
                    className="rounded border border-slate-300 px-2 py-1"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={run}
                disabled={isSubmitting}
                className={`rounded px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 ${variantClass}`}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
