// Deterministic mock data for TradeBoard.
// Generates several hundred realistic trades across a variety of markets.

export type Market = "Forex" | "Crypto" | "Indices" | "Metals" | "Stocks";
export type Side = "Buy" | "Sell";
export type Emotion =
  | "Confiant"
  | "Neutre"
  | "Stressé"
  | "Impulsif"
  | "Discipliné"
  | "Fatigué";

export interface Asset {
  symbol: string;
  name: string;
  market: Market;
  pip: number;
  basePrice: number;
}

export const ASSETS: Asset[] = [
  { symbol: "EURUSD", name: "Euro / US Dollar", market: "Forex", pip: 0.0001, basePrice: 1.087 },
  { symbol: "GBPUSD", name: "British Pound / US Dollar", market: "Forex", pip: 0.0001, basePrice: 1.271 },
  { symbol: "USDJPY", name: "US Dollar / Japanese Yen", market: "Forex", pip: 0.01, basePrice: 155.42 },
  { symbol: "AUDUSD", name: "Australian / US Dollar", market: "Forex", pip: 0.0001, basePrice: 0.664 },
  { symbol: "USDCAD", name: "US / Canadian Dollar", market: "Forex", pip: 0.0001, basePrice: 1.367 },
  { symbol: "XAUUSD", name: "Or / US Dollar", market: "Metals", pip: 0.1, basePrice: 2345.5 },
  { symbol: "XAGUSD", name: "Argent / US Dollar", market: "Metals", pip: 0.01, basePrice: 29.4 },
  { symbol: "NAS100", name: "Nasdaq 100", market: "Indices", pip: 0.1, basePrice: 18450 },
  { symbol: "US30", name: "Dow Jones 30", market: "Indices", pip: 0.1, basePrice: 39250 },
  { symbol: "SPX500", name: "S&P 500", market: "Indices", pip: 0.1, basePrice: 5220 },
  { symbol: "GER40", name: "DAX 40", market: "Indices", pip: 0.1, basePrice: 18320 },
  { symbol: "BTCUSD", name: "Bitcoin / USD", market: "Crypto", pip: 1, basePrice: 68500 },
  { symbol: "ETHUSD", name: "Ethereum / USD", market: "Crypto", pip: 0.1, basePrice: 3520 },
  { symbol: "SOLUSD", name: "Solana / USD", market: "Crypto", pip: 0.01, basePrice: 168 },
];

export const STRATEGIES = [
  "Breakout",
  "Pullback",
  "Range",
  "Trend Following",
  "Scalping",
  "News",
  "Support/Résistance",
  "Ichimoku",
  "Smart Money",
];

export const SETUPS = [
  "London Open",
  "NY Open",
  "Asian Range",
  "FVG",
  "Order Block",
  "Double Top",
  "Double Bottom",
  "H&S",
  "Flag",
  "Wedge",
];

export const EMOTIONS: Emotion[] = [
  "Confiant",
  "Neutre",
  "Stressé",
  "Impulsif",
  "Discipliné",
  "Fatigué",
];

export const TAGS = [
  "A+",
  "risque-faible",
  "risque-élevé",
  "backtesté",
  "revenge-trade",
  "haut-timeframe",
  "bas-timeframe",
  "news",
  "session-london",
  "session-ny",
];

export interface Trade {
  id: string;
  date: string; // ISO
  symbol: string;
  market: Market;
  side: Side;
  volume: number;
  entry: number;
  exit: number;
  stopLoss: number;
  takeProfit: number;
  commission: number;
  swap: number;
  profit: number;
  durationMin: number;
  setup: string;
  strategy: string;
  emotion: Emotion;
  screenshot?: string;
  notes: string;
  tags: string[];
}

// Seeded pseudo-random for deterministic mocks
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => a + rand() * (b - a);

function generateTrades(count: number): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();
  const daySpan = 365; // 1 year
  for (let i = 0; i < count; i++) {
    const asset = pick(ASSETS);
    const side: Side = rand() > 0.48 ? "Buy" : "Sell";
    // Slight edge -> ~58% win rate
    const win = rand() > 0.42;
    const drift = (rand() - 0.5) * 0.02;
    const entry = +(asset.basePrice * (1 + drift)).toFixed(asset.pip < 0.01 ? 5 : 2);
    const rMultiple = win ? between(0.8, 3.5) : -between(0.7, 1.6);
    const slDist = asset.basePrice * between(0.002, 0.012);
    const stopLoss = +(side === "Buy" ? entry - slDist : entry + slDist).toFixed(
      asset.pip < 0.01 ? 5 : 2,
    );
    const takeProfit = +(
      side === "Buy" ? entry + slDist * 2 : entry - slDist * 2
    ).toFixed(asset.pip < 0.01 ? 5 : 2);
    const exit = +(
      side === "Buy" ? entry + slDist * rMultiple : entry - slDist * rMultiple
    ).toFixed(asset.pip < 0.01 ? 5 : 2);
    const volume = +between(0.05, 2).toFixed(2);
    const notional =
      asset.market === "Crypto"
        ? volume * entry
        : asset.market === "Indices"
          ? volume * entry * 1
          : volume * 100000; // FX lot
    const priceDelta = side === "Buy" ? exit - entry : entry - exit;
    const profit =
      asset.market === "Forex"
        ? +((priceDelta / asset.basePrice) * notional).toFixed(2)
        : +(priceDelta * volume).toFixed(2);
    const commission = -+between(1, 8).toFixed(2);
    const swap = -+between(0, 3).toFixed(2);
    const durationMin = Math.floor(between(3, 480));
    const daysAgo = Math.floor(rand() * daySpan);
    const date = new Date(now - daysAgo * 86400000 - Math.floor(rand() * 86400000)).toISOString();
    trades.push({
      id: `t_${i.toString().padStart(4, "0")}`,
      date,
      symbol: asset.symbol,
      market: asset.market,
      side,
      volume,
      entry,
      exit,
      stopLoss,
      takeProfit,
      commission,
      swap,
      profit: profit + commission + swap,
      durationMin,
      setup: pick(SETUPS),
      strategy: pick(STRATEGIES),
      emotion: pick(EMOTIONS),
      notes: pick([
        "Trade dans le plan.",
        "Sortie anticipée par prudence.",
        "Bon respect du setup.",
        "SL touché de justesse, à revoir.",
        "Excellent contexte de marché.",
        "Entrée légèrement en retard.",
        "",
      ]),
      tags: Array.from({ length: Math.floor(rand() * 3) }, () => pick(TAGS)).filter(
        (v, i, a) => a.indexOf(v) === i,
      ),
    });
  }
  return trades.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export const MOCK_TRADES: Trade[] = generateTrades(420);

// Watchlist prices (with variation)
export interface Quote {
  symbol: string;
  name: string;
  market: Market;
  price: number;
  change: number; // %
  volume: number;
}

export const MOCK_QUOTES: Quote[] = ASSETS.map((a) => {
  const change = +between(-3.5, 3.5).toFixed(2);
  return {
    symbol: a.symbol,
    name: a.name,
    market: a.market,
    price: +(a.basePrice * (1 + change / 100)).toFixed(a.pip < 0.01 ? 5 : 2),
    change,
    volume: Math.floor(between(50_000, 5_000_000)),
  };
});

// Economic calendar
export type Impact = "Faible" | "Moyen" | "Élevé";
export interface EcoEvent {
  id: string;
  date: string;
  currency: string;
  title: string;
  impact: Impact;
  category: string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

const EVENT_TITLES = [
  ["USD", "Non-Farm Payrolls", "Emploi"],
  ["USD", "CPI", "Inflation"],
  ["USD", "FOMC Statement", "Banque centrale"],
  ["EUR", "ECB Interest Rate", "Banque centrale"],
  ["EUR", "German Ifo Business Climate", "Sentiment"],
  ["GBP", "BoE Interest Rate", "Banque centrale"],
  ["GBP", "UK GDP", "Croissance"],
  ["JPY", "BoJ Statement", "Banque centrale"],
  ["CAD", "Canada Employment", "Emploi"],
  ["AUD", "RBA Statement", "Banque centrale"],
  ["CHF", "SNB Rate Decision", "Banque centrale"],
  ["USD", "Retail Sales", "Consommation"],
  ["USD", "ISM Manufacturing PMI", "Industrie"],
  ["EUR", "Eurozone PMI", "Industrie"],
];

export const MOCK_EVENTS: EcoEvent[] = Array.from({ length: 60 }, (_, i) => {
  const [currency, title, category] = pick(EVENT_TITLES);
  const impacts: Impact[] = ["Faible", "Moyen", "Élevé"];
  const daysOffset = Math.floor(rand() * 30) - 15;
  return {
    id: `e_${i}`,
    date: new Date(Date.now() + daysOffset * 86400000).toISOString(),
    currency,
    title,
    impact: pick(impacts),
    category,
    forecast: `${between(0.1, 5).toFixed(1)}%`,
    previous: `${between(0.1, 5).toFixed(1)}%`,
    actual: daysOffset < 0 ? `${between(0.1, 5).toFixed(1)}%` : undefined,
  };
}).sort((a, b) => +new Date(a.date) - +new Date(b.date));