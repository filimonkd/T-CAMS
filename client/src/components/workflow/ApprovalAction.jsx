import { useState } from 'react';
import api, { getErrorMessage } from '../../api/axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useToast } from '../ui/Toast';
import { IconAlertCircle } from '../ui/icons';

// moduleConfig declares variants as success/danger/neutral; map them onto the
// shared Button variants without changing any config.
const VARIANT_MAP = {
  success: 'success',
  danger: 'danger',
  neutral: 'outline',
};

/**
 * Reusable action button for any workflow transition (approve/reject/
 * escalate/etc.) defined in moduleConfig.js. Actions with `inputs` open a
 * confirm modal to collect a request body first; actions with none fire
 * immediately. Calls onDone() after a successful request so the caller
 * (WorkflowDetail) can refetch the record and its history.
 */
export default function ApprovalAction({ action, recordId, onDone }) {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const hasInputs = Boolean(action.inputs && action.inputs.length > 0);
  const buttonVariant = VARIANT_MAP[action.variant] || 'outline';

  async function run() {
    setIsSubmitting(true);
    setError('');
    try {
      await api({ method: action.method || 'post', url: action.path(recordId), data: values });
      setIsOpen(false);
      setValues({});
      toast.success(`${action.label} completed.`);
      onDone?.();
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      // A guard rejection is the expected outcome here, not a crash - surface
      // it in the modal when one is open, and as a toast for direct actions.
      if (!hasInputs) {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClick() {
    setError('');
    if (hasInputs) {
      setIsOpen(true);
    } else {
      run();
    }
  }

  return (
    <>
      <Button
        variant={buttonVariant}
        size="md"
        onClick={handleClick}
        isLoading={isSubmitting && !hasInputs}
      >
        {action.label}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isSubmitting && setIsOpen(false)}
        title={action.label}
        description="Provide the details below to complete this transition."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant={buttonVariant} onClick={run} isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Confirm'}
            </Button>
          </>
        }
      >
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-control border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
          >
            <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="min-w-0 break-words">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {(action.inputs || []).map((input) => (
            <Input
              key={input.key}
              label={input.label}
              type={input.type || 'text'}
              value={values[input.key] || ''}
              onChange={(event) => setValues((prev) => ({ ...prev, [input.key]: event.target.value }))}
            />
          ))}
        </div>
      </Modal>
    </>
  );
}
