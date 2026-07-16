import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
  monthlyProfit,
  profitByAsset,
  profitByStrategy,
} from "@/lib/stats";
import { currency, num, shortDate } from "@/lib/format";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_app/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { trades } = useStore();
  const { user } = useAuth();
  const cur = user?.currency ?? "USD";

  const stats = useMemo(() => computeStats(trades), [trades]);
  const monthly = useMemo(() => monthlyProfit(trades), [trades]);
  const byAsset = useMemo(() => profitByAsset(trades), [trades]);
  const byStrat = useMemo(() => profitByStrategy(trades), [trades]);

  // by weekday
  const byDay = useMemo(() => {
    const labels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const arr = Array.from({ length: 7 }, (_, i) => ({
      day: labels[i],
      profit: 0,
      count: 0,
    }));
    for (const t of trades) {
      const d = new Date(t.date).getDay();
      arr[d].profit += t.profit;
      arr[d].count += 1;
    }
    return arr;
  }, [trades]);

  // by hour
  const byHour = useMemo(() => {
    const arr = Array.from({ length: 24 }, (_, h) => ({
      hour: `${h}h`,
      profit: 0,
    }));
    for (const t of trades) arr[new Date(t.date).getHours()].profit += t.profit;
    return arr;
  }, [trades]);

  // yearly performance
  const byYear = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of trades) {
      const y = t.date.slice(0, 4);
      map.set(y, (map.get(y) || 0) + t.profit);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, profit]) => ({ year, profit: +profit.toFixed(2) }));
  }, [trades]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analyses"
        description="Vue détaillée de vos performances et de vos statistiques clés."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Win Rate" value={`${num(stats.winRate, 1)}%`} tone="accent" />
        <StatCard label="Expectancy" value={currency(stats.expectancy, cur)} />
        <StatCard label="Profit Factor" value={num(stats.profitFactor, 2)} tone={stats.profitFactor >= 1 ? "profit" : "loss"} />
        <StatCard label="Drawdown max" value={currency(-stats.maxDrawdown, cur)} tone="loss" />
        <StatCard label="Trades" value={num(stats.totalTrades, 0)} />
        <StatCard label="Gain moyen" value={currency(stats.avgWin, cur)} tone="profit" />
        <StatCard label="Perte moyenne" value={currency(stats.avgLoss, cur)} tone="loss" />
        <StatCard label="Ratio G/P" value={num(Math.abs(stats.avgWin / (stats.avgLoss || 1)), 2)} />
        <StatCard label="Meilleure série" value={`${stats.bestStreak} trades`} tone="profit" />
        <StatCard label="Pire série" value={`${stats.worstStreak} trades`} tone="loss" />
        <StatCard label="Meilleure journée" value={stats.bestDay ? currency(stats.bestDay.profit, cur) : "—"} hint={stats.bestDay ? shortDate(stats.bestDay.date) : ""} tone="profit" />
        <StatCard label="Pire journée" value={stats.worstDay ? currency(stats.worstDay.profit, cur) : "—"} hint={stats.worstDay ? shortDate(stats.worstDay.date) : ""} tone="loss" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Performance mensuelle</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={60} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v, cur)} />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {monthly.map((m) => (
                    <Cell key={m.month} fill={m.profit >= 0 ? "var(--success)" : "var(--destructive)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Performance annuelle</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="year" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={60} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v, cur)} />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {byYear.map((y) => (
                    <Cell key={y.year} fill={y.profit >= 0 ? "var(--success)" : "var(--destructive)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Performance par jour de la semaine</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={60} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v, cur)} />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {byDay.map((d) => (
                    <Cell key={d.day} fill={d.profit >= 0 ? "var(--success)" : "var(--destructive)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Performance par heure</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="hour" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} width={60} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v, cur)} />
                <Line type="monotone" dataKey="profit" stroke="var(--accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Performance par actif</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actif</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byAsset.map((a) => (
                  <TableRow key={a.symbol}>
                    <TableCell className="font-mono text-xs">{a.symbol}</TableCell>
                    <TableCell className="text-right">{a.count}</TableCell>
                    <TableCell className={`text-right font-semibold tabular-nums ${a.profit >= 0 ? "text-profit" : "text-loss"}`}>
                      {currency(a.profit, cur)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Performance par stratégie</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Stratégie</TableHead>
                  <TableHead className="text-right">Trades</TableHead>
                  <TableHead className="text-right">WR</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byStrat.map((s) => (
                  <TableRow key={s.strategy}>
                    <TableCell>{s.strategy}</TableCell>
                    <TableCell className="text-right">{s.count}</TableCell>
                    <TableCell className="text-right">{num((s.wins / s.count) * 100, 1)}%</TableCell>
                    <TableCell className={`text-right font-semibold tabular-nums ${s.profit >= 0 ? "text-profit" : "text-loss"}`}>
                      {currency(s.profit, cur)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
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