import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
  Activity,
  Trophy,
  Timer,
  Target,
  Flame,
  ArrowDown,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useStore, useAuth } from "@/lib/store";
import {
  computeStats,
  equityCurve,
  monthlyProfit,
  drawdownCurve,
  profitByAsset,
  winRateOverTime,
  heatmap,
  periodProfit,
} from "@/lib/stats";
import { currency, num, pct, shortDate, duration } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/_app/dashboard")({
  component: Dashboard,
});

const PROFIT = "var(--success)";
const LOSS = "var(--destructive)";
const ACCENT = "var(--accent)";

function Dashboard() {
  const { trades } = useStore();
  const { user } = useAuth();
  const capital = user?.capital ?? 10000;
  const cur = user?.currency ?? "USD";

  const stats = useMemo(() => computeStats(trades), [trades]);
  const equity = useMemo(() => equityCurve(trades, capital), [trades, capital]);
  const monthly = useMemo(() => monthlyProfit(trades), [trades]);
  const ddCurve = useMemo(() => drawdownCurve(trades, capital), [trades, capital]);
  const byAsset = useMemo(() => profitByAsset(trades).slice(0, 8), [trades]);
  const wrOverTime = useMemo(() => winRateOverTime(trades), [trades]);
  const heat = useMemo(() => heatmap(trades), [trades]);
  const currentCapital = capital + stats.totalProfit;

  const daily = periodProfit(trades, 1);
  const weekly = periodProfit(trades, 7);
  const monthlyProfitVal = periodProfit(trades, 30);
  const yearly = periodProfit(trades, 365);

  const pieData = [
    { name: "Gagnants", value: stats.wins, color: PROFIT },
    { name: "Perdants", value: stats.losses, color: LOSS },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Bonjour, ${user?.name ?? "Trader"} 👋`}
        description="Voici l'état de votre performance en un coup d'œil."
      />

      {/* Top KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Capital actuel"
          value={currency(currentCapital, cur)}
          hint={
            <span className={stats.totalProfit >= 0 ? "text-profit" : "text-loss"}>
              {pct((stats.totalProfit / capital) * 100)} vs. initial
            </span>
          }
          icon={<Wallet className="h-4 w-4" />}
          tone="accent"
        />
        <StatCard
          label="Profit journalier"
          value={currency(daily, cur)}
          tone={daily >= 0 ? "profit" : "loss"}
          icon={daily >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        />
        <StatCard
          label="Profit hebdomadaire"
          value={currency(weekly, cur)}
          tone={weekly >= 0 ? "profit" : "loss"}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatCard
          label="Profit mensuel"
          value={currency(monthlyProfitVal, cur)}
          tone={monthlyProfitVal >= 0 ? "profit" : "loss"}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Win Rate"
          value={`${num(stats.winRate, 1)}%`}
          icon={<Percent className="h-4 w-4" />}
          tone="accent"
        />
        <StatCard
          label="Profit Factor"
          value={num(stats.profitFactor, 2)}
          icon={<Target className="h-4 w-4" />}
          tone={stats.profitFactor >= 1 ? "profit" : "loss"}
        />
        <StatCard
          label="Drawdown max"
          value={currency(-stats.maxDrawdown, cur)}
          icon={<ArrowDown className="h-4 w-4" />}
          tone="loss"
        />
        <StatCard
          label="R:R moyen"
          value={num(stats.avgRR, 2)}
          icon={<Trophy className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total trades" value={num(stats.totalTrades, 0)} />
        <StatCard label="Trades gagnants" value={num(stats.wins, 0)} tone="profit" />
        <StatCard label="Trades perdants" value={num(stats.losses, 0)} tone="loss" />
        <StatCard
          label="Profit annuel"
          value={currency(yearly, cur)}
          tone={yearly >= 0 ? "profit" : "loss"}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gain moyen"
          value={currency(stats.avgWin, cur)}
          tone="profit"
        />
        <StatCard
          label="Perte moyenne"
          value={currency(stats.avgLoss, cur)}
          tone="loss"
        />
        <StatCard
          label="Meilleure journée"
          value={stats.bestDay ? currency(stats.bestDay.profit, cur) : "—"}
          hint={stats.bestDay ? shortDate(stats.bestDay.date) : ""}
          tone="profit"
          icon={<Flame className="h-4 w-4" />}
        />
        <StatCard
          label="Pire journée"
          value={stats.worstDay ? currency(stats.worstDay.profit, cur) : "—"}
          hint={stats.worstDay ? shortDate(stats.worstDay.date) : ""}
          tone="loss"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Temps moyen d'un trade"
          value={duration(Math.round(stats.avgDurationMin))}
          icon={<Timer className="h-4 w-4" />}
        />
        <StatCard label="Expectancy" value={currency(stats.expectancy, cur)} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Courbe du capital</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equity}>
                <defs>
                  <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PROFIT} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={PROFIT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" hide />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={60} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => currency(v, cur)}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke={PROFIT}
                  strokeWidth={2}
                  fill="url(#eq)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Répartition gains / pertes</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profit mensuel</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={60} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => currency(v, cur)}
                />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {monthly.map((m) => (
                    <Cell key={m.month} fill={m.profit >= 0 ? PROFIT : LOSS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Drawdown</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ddCurve}>
                <defs>
                  <linearGradient id="dd" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={LOSS} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={LOSS} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" hide />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={60} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => currency(v, cur)}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke={LOSS}
                  strokeWidth={2}
                  fill="url(#dd)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance par actif</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byAsset} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="symbol"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={70}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => currency(v, cur)}
                />
                <Bar dataKey="profit" radius={[0, 4, 4, 0]}>
                  {byAsset.map((d) => (
                    <Cell key={d.symbol} fill={d.profit >= 0 ? PROFIT : LOSS} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Win Rate</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={wrOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" hide />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  width={40}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => `${v}%`}
                />
                <Line
                  type="monotone"
                  dataKey="winRate"
                  stroke={ACCENT}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Heatmap des performances (jour × heure)</CardTitle>
        </CardHeader>
        <CardContent>
          <Heatmap grid={heat} cur={cur} />
        </CardContent>
      </Card>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--popover-foreground)",
  fontSize: 12,
};

function Heatmap({ grid, cur }: { grid: number[][]; cur: string }) {
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const max = Math.max(...grid.flat().map((v) => Math.abs(v)), 1);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[40px_repeat(24,minmax(0,1fr))] gap-1 text-[10px] text-muted-foreground">
          <div />
          {Array.from({ length: 24 }).map((_, h) => (
            <div key={h} className="text-center">
              {h}
            </div>
          ))}
          {grid.map((row, di) => (
            <>
              <div key={`d${di}`} className="flex items-center justify-end pr-1">
                {days[di]}
              </div>
              {row.map((v, hi) => {
                const intensity = Math.min(Math.abs(v) / max, 1);
                const color =
                  v >= 0
                    ? `color-mix(in oklab, var(--success) ${intensity * 90}%, var(--card))`
                    : `color-mix(in oklab, var(--destructive) ${intensity * 90}%, var(--card))`;
                return (
                  <div
                    key={`c${di}-${hi}`}
                    title={`${days[di]} ${hi}h — ${currency(v, cur)}`}
                    className="h-6 rounded-sm border border-border/40"
                    style={{ background: color }}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );
}