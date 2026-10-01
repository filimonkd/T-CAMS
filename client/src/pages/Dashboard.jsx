import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { moduleGroups, getModulesForGroup, moduleConfig } from '../config/moduleConfig';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/ui/MetricCard';
import DataTable from '../components/ui/DataTable';
import DetailCard from '../components/ui/DetailCard';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import Button from '../components/ui/Button';
import StatusBadge from '../components/workflow/StatusBadge';

// Recharts is the heaviest dependency here and only this chart uses it, so it
// loads as its own chunk rather than blocking first paint.
const ActivityChart = lazy(() => import('../components/dashboard/ActivityChart'));

const ACTIVITY_DAYS = 14;
const RECENT_LIMIT = 8;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Terminal "finished successfully" states, matching StatusBadge's success
// tone - used only to count, never to infer anything absent from the log.
const SUCCESS_STATES = new Set([
  'APPROVED', 'ACTIVE', 'CLEARED', 'FINALIZED', 'COMPLETED',
  'ACKNOWLEDGED', 'FULFILLED', 'AWARDED', 'PAID',
]);

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

/** Buckets audit entries into one point per day, including days with none. */
function buildActivitySeries(entries, days) {
  const buckets = new Map();
  const today = startOfDay(new Date());

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - offset);
    buckets.set(day.getTime(), {
      label: day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      count: 0,
    });
  }

  for (const entry of entries) {
    const occurred = new Date(entry.occurredAt);
    if (Number.isNaN(occurred.getTime())) continue;
    const bucket = buckets.get(startOfDay(occurred).getTime());
    if (bucket) bucket.count += 1;
  }

  return Array.from(buckets.values());
}

/**
 * Every figure comes from data the API actually returns:
 * GET /api/audit/compliance (the AuditLog) for activity, plus the role-gated
 * module registry for reach. Nothing is mocked - an empty log renders zeros
 * and empty states rather than placeholder numbers, and a trend pill only
 * appears where a real prior-period baseline exists in the log.
 */
export default function Dashboard() {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const visibleGroups = useMemo(
    () =>
      moduleGroups
        .filter((group) => hasRole(group.roles))
        .map((group) => ({ ...group, modules: getModulesForGroup(group.key) }))
        .filter((group) => group.modules.length > 0),
    [hasRole],
  );

  const moduleCount = useMemo(
    () => visibleGroups.reduce((sum, group) => sum + group.modules.length, 0),
    [visibleGroups],
  );

  const loadActivity = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await api.get('/audit/compliance');
      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch (err) {
      setError(getErrorMessage(err));
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  const stats = useMemo(() => {
    const now = Date.now();
    let thisWeek = 0;
    let priorWeek = 0;
    let completions = 0;
    const entityTypes = new Set();

    for (const entry of entries) {
      const at = new Date(entry.occurredAt).getTime();
      if (at >= now - WEEK_MS) thisWeek += 1;
      else if (at >= now - 2 * WEEK_MS) priorWeek += 1;
      if (SUCCESS_STATES.has(entry.toStatus)) completions += 1;
      if (entry.entityType) entityTypes.add(entry.entityType);
    }

    // Only a real prior week supports a delta. With no baseline there is no
    // percentage to show, so the card renders without a trend pill.
    const weekTrend =
      priorWeek > 0 ? Math.round(((thisWeek - priorWeek) / priorWeek) * 100) : null;

    return {
      total: entries.length,
      thisWeek,
      priorWeek,
      weekTrend,
      completions,
      completionRate: entries.length ? Math.round((completions / entries.length) * 100) : 0,
      entityTypes: entityTypes.size,
    };
  }, [entries]);

  const activitySeries = useMemo(() => buildActivitySeries(entries, ACTIVITY_DAYS), [entries]);
  const recent = useMemo(() => entries.slice(0, RECENT_LIMIT), [entries]);

  const quickActions = useMemo(
    () => visibleGroups.slice(0, 6).map((group) => ({ group, module: group.modules[0] })),
    [visibleGroups],
  );

  const recentColumns = useMemo(
    () => [
      {
        key: 'entityType',
        label: 'Record Type',
        render: (row) => (
          <span className="font-medium text-gray-900 dark:text-white">{row.entityType}</span>
        ),
      },
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
            <span className="text-xs text-gray-500 dark:text-slate-400">{row.isoClause}</span>
          ) : (
            <span className="text-gray-400">—</span>
          ),
      },
      {
        key: 'occurredAt',
        label: 'Date',
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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-0.5 text-[13px] text-gray-500 dark:text-slate-400">
            {moduleCount} module{moduleCount === 1 ? '' : 's'} across {visibleGroups.length} area
            {visibleGroups.length === 1 ? '' : 's'} available to your role.
          </p>
        </div>
        <Button variant="outline" leadingIcon={RefreshCw} onClick={loadActivity} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium">Could not load workflow activity</p>
            <p className="mt-0.5 break-words">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Transitions"
          value={stats.total.toLocaleString()}
          hint="All recorded status changes"
          isLoading={isLoading}
        />
        <MetricCard
          label="Last 7 Days"
          value={stats.thisWeek.toLocaleString()}
          comparison={stats.priorWeek > 0 ? `vs prior 7 days ${stats.priorWeek}` : 'No prior-week baseline'}
          trend={stats.weekTrend !== null ? `${Math.abs(stats.weekTrend)}%` : undefined}
          trendDirection={stats.weekTrend >= 0 ? 'up' : 'down'}
          isLoading={isLoading}
        />
        <MetricCard
          label="Completions"
          value={stats.completions.toLocaleString()}
          comparison={`${stats.completionRate}% of all transitions`}
          isLoading={isLoading}
        />
        <MetricCard
          label="Record Types"
          value={stats.entityTypes.toLocaleString()}
          hint="Entity types with activity"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <DetailCard icon={BarChart3} title="Workflow Activity" className="xl:col-span-2">
          <div>
            <p className="mb-3 text-[13px] text-gray-500 dark:text-slate-400">
              Status transitions per day over the last {ACTIVITY_DAYS} days
            </p>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : entries.length > 0 ? (
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <ActivityChart data={activitySeries} />
              </Suspense>
            ) : (
              <EmptyState
                icon={Activity}
                title="No workflow activity yet"
                description="This chart draws from the audit log. Transitions appear once records move through their approval steps."
              />
            )}
          </div>
        </DetailCard>

        <DetailCard icon={Layers} title="Quick Actions">
          {quickActions.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No modules available"
              description="Your role does not grant access to any module."
            />
          ) : (
            <div className="space-y-2">
              {quickActions.map(({ group, module }) => (
                <Link
                  key={group.key}
                  to={`/modules/${module.key}`}
                  className="group flex items-center gap-3 rounded-control border border-gray-200 px-3 py-2.5 transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50/60 dark:border-slate-800 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-gray-900 dark:text-white">
                      {group.label}
                    </p>
                    <p className="truncate text-[11px] text-gray-500 dark:text-slate-400">
                      {group.modules.length} module{group.modules.length === 1 ? '' : 's'} ·{' '}
                      {moduleConfig[module.key]?.label || module.label}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-slate-600" />
                </Link>
              ))}
            </div>
          )}
        </DetailCard>
      </div>

      <section className="rounded-card border border-gray-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-2.5">
            <Clock className="h-[18px] w-[18px] shrink-0 text-gray-400 dark:text-slate-500" strokeWidth={2} />
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
              <p className="truncate text-xs text-gray-500 dark:text-slate-400">
                Latest entries from the compliance audit log
              </p>
            </div>
          </div>
        </div>

        <DataTable
          columns={recentColumns}
          rows={recent}
          isLoading={isLoading}
          emptyState={
            <EmptyState
              icon={CheckCircle2}
              title="Nothing recorded yet"
              description="Approval steps taken in any module will show up here."
            />
          }
        />
      </section>
    </div>
  );
}
