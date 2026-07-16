export const currency = (n: number, cur = "USD") =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 2,
  }).format(n);

export const num = (n: number, d = 2) =>
  new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(n);

export const pct = (n: number, d = 2) => `${n >= 0 ? "+" : ""}${num(n, d)}%`;

export const shortDate = (d: string | Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  }).format(new Date(d));

export const dateTime = (d: string | Date) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));

export const duration = (mins: number) => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h < 24) return `${h}h ${m}m`;
  const d = Math.floor(h / 24);
  return `${d}j ${h % 24}h`;
};