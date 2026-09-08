import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { moduleGroups, getModulesForGroup, moduleConfig } from '../config/moduleConfig';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/workflow/StatusBadge';
import Button from '../components/ui/Button';
import Card, { CardBody, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import {
  IconActivity,
  IconAlertCircle,
  IconArrowRight,
  IconCheckCircle,
  IconClock,
  IconLayers,
  IconRefresh,
  IconShield,
} from '../components/ui/icons';

// Recharts is by far the heaviest dependency in the app and this chart is the
// only thing using it, so it loads as its own chunk instead of blocking first
// paint. The Suspense fallback matches the chart's height, so nothing shifts.
const ActivityChart = lazy(() => import('../components/dashboard/ActivityChart'));

const ACTIVITY_DAYS = 14;
const RECENT_LIMIT = 8;

// Terminal "this finished successfully" states, matching StatusBadge's
// success tone - used only to count, never to infer anything not in the log.
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
    const key = startOfDay(occurred).getTime();
    const bucket = buckets.get(key);
    if (bucket) bucket.count += 1;
  }

  return Array.from(buckets.values());
}

/**
 * Every figure here is derived from data the API actually returns:
 * GET /api/audit/compliance (the AuditLog) for activity, plus the role-gated
 * module registry for reach. Nothing is mocked or padded - when the log is
 * empty the cards read zero and the panels show empty states.
 */
export default function Dashboard() {
  const { user, hasRole } = useAuth();
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
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    let lastWeek = 0;
    let completions = 0;
    const entityTypes = new Set();

    for (const entry of entries) {
      if (new Date(entry.occurredAt).getTime() >= weekAgo) lastWeek += 1;
      if (SUCCESS_STATES.has(entry.toStatus)) completions += 1;
      if (entry.entityType) entityTypes.add(entry.entityType);
    }

    return { total: entries.length, lastWeek, completions, entityTypes: entityTypes.size };
  }, [entries]);

  const activitySeries = useMemo(() => buildActivitySeries(entries, ACTIVITY_DAYS), [entries]);
  const hasActivity = entries.length > 0;
  const recent = entries.slice(0, RECENT_LIMIT);

  // Quick actions: the first module of each area the role can reach.
  const quickActions = useMemo(
    () => visibleGroups.slice(0, 6).map((group) => ({ group, module: group.modules[0] })),
    [visibleGroups],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {moduleCount} module{moduleCount === 1 ? '' : 's'} across {visibleGroups.length} area
            {visibleGroups.length === 1 ? '' : 's'} available to your role.
          </p>
        </div>
        <Button variant="outline" leadingIcon={IconRefresh} onClick={loadActivity} disabled={isLoading}>
          Refresh
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-card border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400"
        >
          <IconAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium">Could not load workflow activity</p>
            <p className="mt-0.5 break-words">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total transitions"
          value={stats.total}
          hint="All recorded status changes"
          icon={IconActivity}
          tone="brand"
          isLoading={isLoading}
        />
        <StatCard
          label="Last 7 days"
          value={stats.lastWeek}
          hint="Transitions this week"
          icon={IconClock}
          tone="info"
          isLoading={isLoading}
        />
        <StatCard
          label="Completions"
          value={stats.completions}
          hint="Moved to a successful state"
          icon={IconCheckCircle}
          tone="success"
          isLoading={isLoading}
        />
        <StatCard
          label="Record types"
          value={stats.entityTypes}
          hint="Entity types with activity"
          icon={IconLayers}
          tone="warning"
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="flex flex-col xl:col-span-2">
          <CardHeader>
            <CardTitle>Workflow activity</CardTitle>
            <CardDescription>Status transitions per day over the last {ACTIVITY_DAYS} days</CardDescription>
          </CardHeader>
          <CardBody className="flex flex-1 flex-col">
            {isLoading ? (
              <Skeleton className="h-full min-h-56 w-full" />
            ) : hasActivity ? (
              <Suspense fallback={<Skeleton className="h-full min-h-56 w-full" />}>
                <ActivityChart data={activitySeries} />
              </Suspense>
            ) : (
              <EmptyState
                icon={IconActivity}
                title="No workflow activity yet"
                description="This chart draws from the audit log. Once records move through their approval steps, their transitions appear here."
              />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Latest audit-log entries</CardDescription>
          </CardHeader>
          {isLoading ? (
            <CardBody className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </CardBody>
          ) : recent.length === 0 ? (
            <EmptyState
              icon={IconClock}
              title="Nothing recorded yet"
              description="Approval steps taken in any module will show up here."
            />
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.map((entry) => (
                <li key={entry._id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {entry.entityType}
                    </span>
                    <StatusBadge status={entry.fromStatus} size="sm" />
                    <IconArrowRight className="h-3 w-3 shrink-0 text-slate-400" />
                    <StatusBadge status={entry.toStatus} size="sm" />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{new Date(entry.occurredAt).toLocaleString()}</span>
                    {entry.isoClause && (
                      <Badge tone="neutral" size="sm">
                        <IconShield className="h-3 w-3" />
                        ISO {entry.isoClause}
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
          <CardDescription>Jump into the areas your role can access</CardDescription>
        </CardHeader>
        {quickActions.length === 0 ? (
          <EmptyState
            icon={IconLayers}
            title="No modules available"
            description="Your role does not currently grant access to any module."
          />
        ) : (
          <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map(({ group, module }) => (
              <Link
                key={group.key}
                to={`/modules/${module.key}`}
                className="group flex items-center gap-3 rounded-control border border-slate-200 bg-white p-3.5 transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-slate-100 text-slate-500 transition-colors duration-200 group-hover:bg-brand-100 group-hover:text-brand-600 dark:bg-slate-800 dark:text-slate-400 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-400">
                  <IconLayers className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {group.label}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {group.modules.length} module{group.modules.length === 1 ? '' : 's'} ·{' '}
                    {moduleConfig[module.key]?.label || module.label}
                  </p>
                </div>
                <IconArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-500 dark:text-slate-600" />
              </Link>
            ))}
          </CardBody>
        )}
      </Card>
    </div>
  );
}
