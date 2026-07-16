import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MOCK_EVENTS, type Impact } from "@/lib/mock-data";
import { dateTime } from "@/lib/format";

export const Route = createFileRoute("/_app/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const [currency, setCurrency] = useState("all");
  const [impact, setImpact] = useState("all");

  const currencies = useMemo(
    () => Array.from(new Set(MOCK_EVENTS.map((e) => e.currency))).sort(),
    [],
  );

  const rows = useMemo(
    () =>
      MOCK_EVENTS.filter((e) => currency === "all" || e.currency === currency)
        .filter((e) => impact === "all" || e.impact === impact),
    [currency, impact],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendrier économique"
        description="Anticipez la volatilité liée aux annonces macro-économiques."
      />
      <div className="card-glass rounded-xl p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger><SelectValue placeholder="Devise" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes devises</SelectItem>
            {currencies.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={impact} onValueChange={setImpact}>
          <SelectTrigger><SelectValue placeholder="Impact" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous impacts</SelectItem>
            <SelectItem value="Élevé">Élevé</SelectItem>
            <SelectItem value="Moyen">Moyen</SelectItem>
            <SelectItem value="Faible">Faible</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="card-glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Devise</TableHead>
              <TableHead>Événement</TableHead>
              <TableHead>Impact</TableHead>
              <TableHead className="text-right">Préc.</TableHead>
              <TableHead className="text-right">Prév.</TableHead>
              <TableHead className="text-right">Actuel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  <CalendarClock className="mx-auto mb-2 h-6 w-6" />
                  Aucun événement.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((e) => (
                <TableRow key={e.id} className="hover:bg-muted/40">
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{dateTime(e.date)}</TableCell>
                  <TableCell><Badge variant="outline">{e.currency}</Badge></TableCell>
                  <TableCell className="text-sm">{e.title}</TableCell>
                  <TableCell><ImpactBadge impact={e.impact} /></TableCell>
                  <TableCell className="text-right tabular-nums">{e.previous ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums">{e.forecast ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{e.actual ?? "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ImpactBadge({ impact }: { impact: Impact }) {
  const map: Record<Impact, string> = {
    Élevé: "border-[color:var(--destructive)]/40 text-[color:var(--destructive)]",
    Moyen: "border-[color:var(--warning)]/40 text-[color:var(--warning)]",
    Faible: "border-border text-muted-foreground",
  };
  return <Badge variant="outline" className={map[impact]}>{impact}</Badge>;
}