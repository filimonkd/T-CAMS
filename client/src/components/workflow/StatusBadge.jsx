const COLORS = {
  APPROVED: 'bg-emerald-100 text-emerald-800',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  CLEARED: 'bg-emerald-100 text-emerald-800',
  FINALIZED: 'bg-emerald-100 text-emerald-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  ACKNOWLEDGED: 'bg-emerald-100 text-emerald-800',
  FULFILLED: 'bg-emerald-100 text-emerald-800',
  AWARDED: 'bg-emerald-100 text-emerald-800',
  ISSUED: 'bg-sky-100 text-sky-800',
  OPEN: 'bg-sky-100 text-sky-800',
  AVAILABLE: 'bg-sky-100 text-sky-800',
  ENROLLED: 'bg-sky-100 text-sky-800',
  ON_LOAN: 'bg-sky-100 text-sky-800',
  BOOKED: 'bg-sky-100 text-sky-800',
  ASSIGNED: 'bg-sky-100 text-sky-800',
  RECORDED: 'bg-sky-100 text-sky-800',
  DRAFT: 'bg-slate-100 text-slate-700',
  PENDING: 'bg-amber-100 text-amber-800',
  SUBMITTED: 'bg-amber-100 text-amber-800',
  REQUESTED: 'bg-amber-100 text-amber-800',
  SHORTLISTED: 'bg-amber-100 text-amber-800',
  EVALUATED: 'bg-amber-100 text-amber-800',
  IN_PROGRESS: 'bg-amber-100 text-amber-800',
  IN_BINDING: 'bg-amber-100 text-amber-800',
  MAINTENANCE: 'bg-amber-100 text-amber-800',
  UNPAID: 'bg-amber-100 text-amber-800',
  OVERDUE: 'bg-amber-100 text-amber-800',
  REJECTED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DAMAGED: 'bg-red-100 text-red-800',
  VOIDED: 'bg-red-100 text-red-800',
  REVOKED: 'bg-red-100 text-red-800',
  TERMINATED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-slate-200 text-slate-700',
  CLOSED: 'bg-slate-200 text-slate-700',
  RETIRED: 'bg-slate-200 text-slate-700',
  ARCHIVED: 'bg-slate-200 text-slate-700',
  WAIVED: 'bg-slate-200 text-slate-700',
  PAID: 'bg-emerald-100 text-emerald-800',
};

export default function StatusBadge({ status }) {
  if (!status) {
    return null;
  }
  const classes = COLORS[status] || 'bg-slate-100 text-slate-700';
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${classes}`}>{status}</span>;
}
