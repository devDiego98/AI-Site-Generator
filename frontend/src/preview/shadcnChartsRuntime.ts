/** Chart components (shadcn/ui style) + Recharts globals for the preview iframe. */
export function getShadcnChartsRuntimeScript(): string {
  return `
const __recharts = typeof Recharts !== 'undefined' ? Recharts : null;
const {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip: RechartsTooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  ReferenceLine,
  ReferenceArea,
} = __recharts || {};

function ChartUnavailable({ children }) {
  return (
    <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
      {children || 'Chart could not load. Refresh the preview.'}
    </div>
  );
}

const ChartContext = createContext({ config: {} });

function ChartContainer({ id, className, children, config = {} }) {
  if (!__recharts || !ResponsiveContainer) {
    return (
      <ChartUnavailable>
        Charts require Recharts (check preview scripts loaded correctly).
      </ChartUnavailable>
    );
  }
  const chartId = id || 'chart-' + Math.random().toString(36).slice(2, 9);
  const cssVars = {};
  Object.entries(config).forEach(([key, entry]) => {
    if (entry && entry.color) cssVars['--color-' + key] = entry.color;
  });
  return (
    <ChartContext.Provider value={{ config, chartId }}>
      <div
        data-chart={chartId}
        className={cn(
          'flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50',
          className
        )}
        style={cssVars}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle() {
  return null;
}

function ChartTooltip({ content, ...props }) {
  if (!RechartsTooltip) return null;
  return <RechartsTooltip content={content} {...props} />;
}

function ChartTooltipContent({ active, payload, label, hideLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-md">
      {!hideLabel && label ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      <div className="space-y-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{item.name || item.dataKey}</span>
            <span className="font-mono font-medium text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartLegend({ content, ...props }) {
  return <Legend content={content} {...props} />;
}

function ChartLegendContent({ payload }) {
  if (!payload?.length) return null;
  return (
    <div className="flex flex-wrap justify-center gap-4 pt-4">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}
`.trim();
}
