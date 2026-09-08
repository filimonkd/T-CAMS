import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../../api/axios';
import { moduleConfig } from '../../config/moduleConfig';
import StatusBadge from './StatusBadge';
import ApprovalAction from './ApprovalAction';
import Button from '../ui/Button';
import Card, { CardBody, CardHeader, CardTitle } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import Badge from '../ui/Badge';
import {
  IconAlertCircle,
  IconArrowRight,
  IconChevronLeft,
  IconClock,
  IconRefresh,
  IconShield,
} from '../ui/icons';

// Fields that are plumbing rather than record content.
const HIDDEN_FIELDS = ['__v', '_id', 'status'];

const DATE_FIELD = /(At|Date)$/;

function humanizeKey(key) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (char) => char.toUpperCase());
}

function formatValue(key, value) {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  if (typeof value === 'object') {
    if (value.name || value.code || value.title) {
      return value.name || value.code || value.title;
    }
    return JSON.stringify(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  // Mongo returns ISO strings; render them in the viewer's locale.
  if (DATE_FIELD.test(key) && typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString();
    }
  }
  return String(value);
}

/**
 * Generic detail view for any module/entity - fetches the record plus its
 * complete AuditLog history from GET /api/audit/:entityType/:entityId,
 * renders every field generically, and exposes whatever workflow actions the
 * module declares.
 */
export default function WorkflowDetail({ moduleKey }) {
  const { id } = useParams();
  const config = moduleConfig[moduleKey];
  const [record, setRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!config) {
      return;
    }
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

  if (!config) {
    return (
      <Card>
        <EmptyState icon={IconAlertCircle} title="Unknown module" description={`No configuration exists for "${moduleKey}".`} />
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardBody className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </CardBody>
        </Card>
        <Card>
          <CardBody className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </CardBody>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <EmptyState
          icon={IconAlertCircle}
          title="Could not load this record"
          description={error}
          action={
            <Button variant="outline" leadingIcon={IconRefresh} onClick={load}>
              Try again
            </Button>
          }
        />
      </Card>
    );
  }

  if (!record) {
    return null;
  }

  const fields = Object.entries(record).filter(([key]) => !HIDDEN_FIELDS.includes(key));

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={`/modules/${moduleKey}`}
          className="mb-3 inline-flex items-center gap-1 rounded text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <IconChevronLeft className="h-3.5 w-3.5" />
          Back to {config.label}
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
              {record.code || record.name || record.title || config.label}
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{record._id}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={record.status} />
            <Button variant="ghost" size="sm" iconOnly leadingIcon={IconRefresh} onClick={load} aria-label="Reload record" />
          </div>
        </div>
      </div>

      {config.actions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available actions</CardTitle>
          </CardHeader>
          <CardBody className="flex flex-wrap gap-2">
            {config.actions.map((action) => (
              <ApprovalAction key={action.key} action={action} recordId={id} onDone={load} />
            ))}
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Record details</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            {fields.map(([key, value]) => (
              <div key={key} className="min-w-0">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  {humanizeKey(key)}
                </dt>
                <dd className="mt-1 break-words text-sm text-slate-800 dark:text-slate-200">
                  {formatValue(key, value)}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval history</CardTitle>
        </CardHeader>
        {history.length === 0 ? (
          <EmptyState
            icon={IconClock}
            title="No recorded history yet"
            description="Status transitions appear here once this record moves through its workflow."
          />
        ) : (
          <CardBody>
            <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
              {history.map((entry) => (
                <li key={entry._id} className="relative pl-7">
                  <span
                    className="absolute left-0 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-brand-500 ring-1 ring-brand-200 dark:border-slate-900 dark:ring-brand-500/30"
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={entry.fromStatus} size="sm" />
                    <IconArrowRight className="h-3 w-3 text-slate-400" />
                    <StatusBadge status={entry.toStatus} size="sm" />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      {new Date(entry.occurredAt).toLocaleString()}
                    </span>
                    {entry.useCaseCode && <span className="font-mono">{entry.useCaseCode}</span>}
                    {entry.isoClause && (
                      <Badge tone="neutral" size="sm">
                        <IconShield className="h-3 w-3" />
                        ISO {entry.isoClause}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </CardBody>
        )}
      </Card>
    </div>
  );
}
