import Badge from '../ui/Badge';

/**
 * Status -> semantic tone.
 *
 * These are the exact groupings the previous colour map used (emerald =>
 * success, sky => info, amber => warning, red => danger, slate => neutral), so
 * no status changes meaning; only the rendering moved onto the shared Badge.
 */
const STATUS_TONES = {
  // Success
  APPROVED: 'success',
  ACTIVE: 'success',
  CLEARED: 'success',
  FINALIZED: 'success',
  COMPLETED: 'success',
  ACKNOWLEDGED: 'success',
  FULFILLED: 'success',
  AWARDED: 'success',
  PAID: 'success',

  // Info
  ISSUED: 'info',
  OPEN: 'info',
  AVAILABLE: 'info',
  ENROLLED: 'info',
  ON_LOAN: 'info',
  BOOKED: 'info',
  ASSIGNED: 'info',
  RECORDED: 'info',

  // Warning
  PENDING: 'warning',
  SUBMITTED: 'warning',
  REQUESTED: 'warning',
  SHORTLISTED: 'warning',
  EVALUATED: 'warning',
  IN_PROGRESS: 'warning',
  IN_BINDING: 'warning',
  MAINTENANCE: 'warning',
  UNPAID: 'warning',
  OVERDUE: 'warning',

  // Danger
  REJECTED: 'danger',
  CANCELLED: 'danger',
  DAMAGED: 'danger',
  VOIDED: 'danger',
  REVOKED: 'danger',
  TERMINATED: 'danger',

  // Neutral
  DRAFT: 'neutral',
  WITHDRAWN: 'neutral',
  CLOSED: 'neutral',
  RETIRED: 'neutral',
  ARCHIVED: 'neutral',
  WAIVED: 'neutral',
};

export function getStatusTone(status) {
  return STATUS_TONES[status] || 'neutral';
}

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) {
    return null;
  }

  return (
    <Badge tone={getStatusTone(status)} size={size}>
      {/* A dot keeps state distinguishable when colour alone is not enough. */}
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {String(status).replace(/_/g, ' ')}
    </Badge>
  );
}
