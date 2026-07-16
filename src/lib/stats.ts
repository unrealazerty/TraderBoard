import type { Trade } from "./mock-data";

export interface Stats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalProfit: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  bestDay: { date: string; profit: number } | null;
  worstDay: { date: string; profit: number } | null;
  bestStreak: number;
  worstStreak: number;
  maxDrawdown: number;
  avgRR: number;
  avgDurationMin: number;
}

export function computeStats(trades: Trade[]): Stats {
  const totalTrades = trades.length;
  const wins = trades.filter((t) => t.profit > 0);
  const losses = trades.filter((t) => t.profit <= 0);
  const totalProfit = trades.reduce((s, t) => s + t.profit, 0);
  const avgWin = wins.length ? wins.reduce((s, t) => s + t.profit, 0) / wins.length : 0;
  const avgLoss = losses.length ? losses.reduce((s, t) => s + t.profit, 0) / losses.length : 0;
  const grossWin = wins.reduce((s, t) => s + t.profit, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.profit, 0));
  const profitFactor = grossLoss ? grossWin / grossLoss : grossWin;
  const winRate = totalTrades ? (wins.length / totalTrades) * 100 : 0;
  const expectancy = (winRate / 100) * avgWin + (1 - winRate / 100) * avgLoss;

  // Grouping per day
  const byDay = new Map<string, number>();
  for (const t of trades) {
    const d = t.date.slice(0, 10);
    byDay.set(d, (byDay.get(d) || 0) + t.profit);
  }
  let bestDay: Stats["bestDay"] = null;
  let worstDay: Stats["worstDay"] = null;
  for (const [date, profit] of byDay) {
    if (!bestDay || profit > bestDay.profit) bestDay = { date, profit };
    if (!worstDay || profit < worstDay.profit) worstDay = { date, profit };
  }

  // Streaks and drawdown (chronological)
  const chrono = [...trades].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  let bestStreak = 0, worstStreak = 0, curWin = 0, curLoss = 0;
  let peak = 0, equity = 0, maxDrawdown = 0;
  for (const t of chrono) {
    if (t.profit > 0) {
      curWin++; curLoss = 0;
      if (curWin > bestStreak) bestStreak = curWin;
    } else {
      curLoss++; curWin = 0;
      if (curLoss > worstStreak) worstStreak = curLoss;
    }
    equity += t.profit;
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const rrs = chrono
    .map((t) => {
      const risk = Math.abs(t.entry - t.stopLoss);
      const reward = Math.abs(t.exit - t.entry);
      return risk ? reward / risk : 0;
    })
    .filter((v) => isFinite(v) && v > 0);
  const avgRR = rrs.length ? rrs.reduce((s, v) => s + v, 0) / rrs.length : 0;

  const avgDurationMin = totalTrades
    ? trades.reduce((s, t) => s + t.durationMin, 0) / totalTrades
    : 0;

  return {
    totalTrades,
    wins: wins.length,
    losses: losses.length,
    winRate,
    totalProfit,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    bestDay,
    worstDay,
    bestStreak,
    worstStreak,
    maxDrawdown,
    avgRR,
    avgDurationMin,
  };
}

export function equityCurve(trades: Trade[], startCapital: number) {
  const chrono = [...trades].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  let eq = startCapital;
  return chrono.map((t) => {
    eq += t.profit;
    return { date: t.date.slice(0, 10), equity: +eq.toFixed(2) };
  });
}

export function monthlyProfit(trades: Trade[]) {
  const map = new Map<string, number>();
  for (const t of trades) {
    const k = t.date.slice(0, 7);
    map.set(k, (map.get(k) || 0) + t.profit);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, profit]) => ({ month, profit: +profit.toFixed(2) }));
}

export function drawdownCurve(trades: Trade[], startCapital: number) {
  const chrono = [...trades].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  let eq = startCapital, peak = startCapital;
  return chrono.map((t) => {
    eq += t.profit;
    if (eq > peak) peak = eq;
    return { date: t.date.slice(0, 10), drawdown: +(eq - peak).toFixed(2) };
  });
}

export function profitByAsset(trades: Trade[]) {
  const map = new Map<string, { symbol: string; profit: number; count: number }>();
  for (const t of trades) {
    const cur = map.get(t.symbol) || { symbol: t.symbol, profit: 0, count: 0 };
    cur.profit += t.profit;
    cur.count++;
    map.set(t.symbol, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.profit - a.profit);
}

export function profitByStrategy(trades: Trade[]) {
  const map = new Map<string, { strategy: string; profit: number; count: number; wins: number }>();
  for (const t of trades) {
    const cur = map.get(t.strategy) || { strategy: t.strategy, profit: 0, count: 0, wins: 0 };
    cur.profit += t.profit;
    cur.count++;
    if (t.profit > 0) cur.wins++;
    map.set(t.strategy, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.profit - a.profit);
}

export function winRateOverTime(trades: Trade[]) {
  const chrono = [...trades].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const points: { date: string; winRate: number }[] = [];
  let wins = 0;
  chrono.forEach((t, i) => {
    if (t.profit > 0) wins++;
    if (i % 5 === 0 || i === chrono.length - 1)
      points.push({
        date: t.date.slice(0, 10),
        winRate: +((wins / (i + 1)) * 100).toFixed(1),
      });
  });
  return points;
}

export function heatmap(trades: Trade[]) {
  // day of week × hour
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const t of trades) {
    const d = new Date(t.date);
    grid[d.getDay()][d.getHours()] += t.profit;
  }
  return grid;
}

export function periodProfit(trades: Trade[], days: number) {
  const cutoff = Date.now() - days * 86400000;
  return trades
    .filter((t) => +new Date(t.date) >= cutoff)
    .reduce((s, t) => s + t.profit, 0);
}