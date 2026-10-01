import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

/**
 * Workflow transitions per day, from the AuditLog.
 *
 * A single series, so no legend - the card title names it. #3b82f6 (the
 * brand primary) was validated with the data-viz palette checker and passes
 * every check against BOTH the light and dark surfaces, so one series colour
 * serves both modes; blue-400 fails the dark lightness band.
 */
const SERIES = {
  light: { stroke: '#3b82f6', grid: '#e5e7eb', axis: '#9ca3af', surface: '#ffffff', text: '#111827' },
  dark: { stroke: '#3b82f6', grid: '#1e293b', axis: '#64748b', surface: '#0f172a', text: '#f1f5f9' },
};

function ChartTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) {
    return null;
  }
  const count = payload[0].value;
  return (
    <div
      className="rounded-control border border-gray-200 bg-white px-3 py-2 shadow-overlay dark:border-slate-700 dark:bg-slate-800"
      style={{ color: colors.text }}
    >
      <p className="text-xs font-medium text-gray-900 dark:text-white">{label}</p>
      <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
        <span className="font-semibold tabular-nums text-gray-900 dark:text-white">{count}</span>{' '}
        transition{count === 1 ? '' : 's'}
      </p>
    </div>
  );
}

export default function ActivityChart({ data }) {
  const { isDark } = useTheme();
  const colors = isDark ? SERIES.dark : SERIES.light;

  // Definite height, not a percentage: ResponsiveContainer's height="100%"
  // resolves to 0 against an auto-height ancestor, so the chart must not
  // depend on an unbroken flex chain above it.
  return (
    <div className="h-64 w-full">
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
