import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

/**
 * Workflow transitions per day, from the AuditLog.
 *
 * A single series, so no legend - the card title names it. Both series steps
 * were validated against their own surface with the data-viz palette checker
 * (light #4f46e5 passes all checks on a light surface; the dark step is #6366f1,
 * since #4f46e5 falls to 2.77:1 against a dark surface and indigo-400 sits
 * outside the dark lightness band).
 */
const SERIES = {
  light: { stroke: '#4f46e5', grid: '#e2e8f0', axis: '#94a3b8', surface: '#ffffff', text: '#0f172a' },
  dark: { stroke: '#6366f1', grid: '#1e293b', axis: '#64748b', surface: '#0f172a', text: '#f1f5f9' },
};

function ChartTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) {
    return null;
  }
  const count = payload[0].value;
  return (
    <div
      className="rounded-control border border-slate-200 bg-white px-3 py-2 shadow-overlay dark:border-slate-700 dark:bg-slate-800"
      style={{ color: colors.text }}
    >
      <p className="text-xs font-medium text-slate-900 dark:text-white">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{count}</span>{' '}
        transition{count === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export default function ActivityChart({ data }) {
  const { isDark } = useTheme();
  const colors = isDark ? SERIES.dark : SERIES.light;

  return (
    <div className="h-full min-h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.22} />
              <stop offset="100%" stopColor={colors.stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Recessive grid: horizontal only, no vertical rules. */}
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            content={<ChartTooltip colors={colors} />}
            cursor={{ stroke: colors.axis, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={colors.stroke}
            strokeWidth={2}
            fill="url(#activityFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: colors.surface }}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
