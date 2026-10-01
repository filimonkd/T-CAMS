import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  Clock,
  FileText,
  History,
  Info,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api, { getErrorMessage } from '../../api/axios';
import { moduleConfig } from '../../config/moduleConfig';
import StatusBadge from './StatusBadge';
import ApprovalAction from './ApprovalAction';
import DetailCard, { DetailGrid, DetailItem, Toggle } from '../ui/DetailCard';
import MetricCard from '../ui/MetricCard';
import DataTable from '../ui/DataTable';
import Tabs, { TabPanel } from '../ui/Tabs';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';

// Plumbing rather than record content.
const HIDDEN_FIELDS = ['__v', '_id', 'status'];
const DATE_FIELD = /(At|Date)$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function humanizeKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'object') {
    return value.name || value.code || value.title || JSON.stringify(value);
  }
  if (DATE_FIELD.test(key) && typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();
  }
  return String(value);
}

/**
 * Generic detail view for every module/entity - fetches the record plus its
 * AuditLog history from GET /api/audit/:entityType/:entityId, then lays it
 * out in the ERP reference pattern: a details card, derived metrics, and a
 * tabbed panel.
 *
 * This is deliberately the one generic page rather than a bespoke per-entity
 * screen: routes.jsx maps /modules/:moduleKey/:id here for all 44 entities,
 * so the pattern lands on every detail page at once (Learners included)
 * instead of only one.
 */
export default function WorkflowDetail({ moduleKey }) {
  const { id } = useParams();
  const config = moduleConfig[moduleKey];
  const [record, setRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const load = useCallback(async () => {
    if (!config) return;
    setIsLoading(true);
    setError('');
    try {
      const [recordRes, historyRes] = await Promise.all([
        api.get(`${config.endpoint}/${id}`),
        api.get(`/audit/${config.entityType}/${id}`).catch(() => ({ data: { history: [] } })),
      ]);
      setRecord(recordRes.data);
      setHistory(historyRes.data.history || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [config, id]);

  useEffect(() => {
    load();
  }, [load]);

  // Split the record into booleans (rendered as toggles) and everything else.
  const { flagFields, valueFields } = useMemo(() => {
    if (!record) return { flagFields: [], valueFields: [] };
    const flags = [];
    const values = [];
    for (const [key, value] of Object.entries(record)) {
      if (HIDDEN_FIELDS.includes(key)) continue;
      if (typeof value === 'boolean') flags.push([key, value]);
      else values.push([key, value]);
    }
    return { flagFields: flags, valueFields: values };
  }, [record]);

  const metrics = useMemo(() => {
    if (!record) return null;
    const created = record.createdAt ? new Date(record.createdAt) : null;
    const ageDays =
      created && !Number.isNaN(created.getTime())
        ? Math.max(0, Math.floor((Date.now() - created.getTime()) / DAY_MS))
        : null;

    const latest = history.length ? new Date(history[history.length - 1].occurredAt) : null;
    const daysInStatus =
      latest && !Number.isNaN(latest.getTime())
        ? Math.max(0, Math.floor((Date.now() - latest.getTime()) / DAY_MS))
        : null;

    return { transitions: history.length, ageDays, daysInStatus };
  }, [record, history]);

  const historyColumns = useMemo(
    () => [
      {
        key: 'transition',
        label: 'Transition',
        render: (row) => (
          <span className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={row.fromStatus} size="sm" />
            <ArrowRight className="h-3 w-3 shrink-0 text-gray-400" />
            <StatusBadge status={row.toStatus} size="sm" />
          </span>
        ),
      },
      {
        key: 'useCaseCode',
        label: 'Use Case',
        render: (row) =>
          row.useCaseCode ? (
            <span className="font-mono text-xs text-gray-500 dark:text-slate-400">{row.useCaseCode}</span>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      },
      {
        key: 'isoClause',
        label: 'ISO Clause',
        render: (row) =>
          row.isoClause ? (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              {row.isoClause}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      },
      {
        key: 'occurredAt',
        label: 'Occurred',
        align: 'right',
        render: (row) => (
          <span className="whitespace-nowrap text-xs text-gray-500 dark:text-slate-400">
            {new Date(row.occurredAt).toLocaleString()}
          </span>
        ),
      },
    ],
    [],
  );

  if (!config) {
    return (
      <DetailCard icon={AlertCircle} title="Unknown module">
        <EmptyState
          icon={AlertCircle}
          title="Unknown module"
          description={`No configuration exists for "${moduleKey}".`}
        />
      </DetailCard>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-64" />
        <div className="rounded-card border border-gray-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <DetailCard icon={AlertCircle} title="Could not load record">
        <EmptyState
          icon={AlertCircle}
          title="Could not load this record"
          description={error}
          action={
            <Button variant="outline" leadingIcon={RefreshCw} onClick={load}>
              Try again
            </Button>
          }
        />
      </DetailCard>
    );
  }

  if (!record) return null;

  const tabs = [
    { key: 'details', label: 'Details', count: valueFields.length },
    { key: 'history', label: 'Approval History', count: history.length },
    ...(config.actions.length > 0
      ? [{ key: 'actions', label: 'Actions', count: config.actions.length }]
      : []),
  ];

  return (
    <div className="space-y-5">
      <div>
        <Link
          to={`/modules/${moduleKey}`}
          className="mb-2.5 inline-flex items-center gap-1 rounded text-[13px] text-gray-500 transition-colors duration-200 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to {config.label}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
              {record.code || record.name || record.title || config.label}
            </h1>
            <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-slate-400">{record._id}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={record.status} />
            <Button variant="outline" size="sm" iconOnly leadingIcon={RefreshCw} onClick={load} aria-label="Reload record" />
          </div>
        </div>
      </div>

      {/* Row 1 - details card with key/value grid and flag toggles */}
      <DetailCard icon={FileText} title={`${config.label} Details`}>
        <div className="flex flex-col gap-6 lg:flex-row">
          {flagFields.length > 0 && (
            <div className="w-full shrink-0 space-y-2 lg:w-56">
              {flagFields.map(([key, value]) => (
                <Toggle key={key} id={`flag-${key}`} label={humanizeKey(key)} checked={value} readOnly />
              ))}
              <p className="pt-1 text-[11px] leading-snug text-gray-400 dark:text-slate-500">
                Read-only: the API exposes no endpoint to change these flags directly.
              </p>
            </div>
          )}

          <DetailGrid columns={flagFields.length > 0 ? 3 : 4} className="min-w-0 flex-1">
            {valueFields.map(([key, value]) => (
              <DetailItem
                key={key}
                icon={DATE_FIELD.test(key) ? CalendarDays : Info}
                label={humanizeKey(key)}
                value={formatValue(key, value)}
              />
            ))}
          </DetailGrid>
        </div>
      </DetailCard>

      {/* Row 2 - metrics derived from the record and its audit trail */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="Recorded Transitions"
          value={metrics.transitions.toLocaleString()}
          hint="Entries in the audit log"
        />
        <MetricCard
          label="Record Age"
          value={metrics.ageDays === null ? '—' : `${metrics.ageDays}d`}
          hint={metrics.ageDays === null ? 'No creation timestamp' : 'Since created'}
        />
        <MetricCard
          label="Time in Current Status"
          value={metrics.daysInStatus === null ? '—' : `${metrics.daysInStatus}d`}
          hint={metrics.daysInStatus === null ? 'No transitions recorded' : 'Since last transition'}
        />
      </div>

      {/* Row 3 - tabbed panel */}
      <section className="rounded-card border border-gray-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} />

        <TabPanel tabKey="details" value={activeTab}>
          <div className="p-5">
            <DetailGrid columns={3}>
              {valueFields.map(([key, value]) => (
                <DetailItem key={key} label={humanizeKey(key)} value={formatValue(key, value)} />
              ))}
            </DetailGrid>
          </div>
        </TabPanel>

        <TabPanel tabKey="history" value={activeTab}>
          <DataTable
            columns={historyColumns}
            rows={history}
            emptyState={
              <EmptyState
                icon={History}
                title="No recorded history yet"
                description="Status transitions appear here once this record moves through its workflow."
              />
            }
          />
        </TabPanel>

        {config.actions.length > 0 && (
          <TabPanel tabKey="actions" value={activeTab}>
            <div className="p-5">
              <p className="mb-3 text-[13px] text-gray-500 dark:text-slate-400">
                Workflow transitions available for this record. Guard rules are enforced server-side.
              </p>
              <div className="flex flex-wrap gap-2">
                {config.actions.map((action) => (
                  <ApprovalAction key={action.key} action={action} recordId={id} onDone={load} />
                ))}
              </div>
            </div>
          </TabPanel>
        )}
      </section>
    </div>
  );
}
