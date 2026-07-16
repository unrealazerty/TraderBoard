import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Upload, FileText, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import type { Trade, Market, Side, Emotion } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/import")({
  component: ImportPage,
});

function splitLine(line: string) {
  const out: string[] = [];
  let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === "," && !inQ) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

function parseCSV(text: string): Omit<Trade, "id">[] {
  const [head, ...rows] = text.trim().split(/\r?\n/);
  const cols = head.split(",").map((c) => c.trim().toLowerCase());
  const idx = (k: string) => cols.indexOf(k);
  return rows.map((line) => {
    const p = splitLine(line);
    return {
      date: p[idx("date")] ?? new Date().toISOString(),
      symbol: (p[idx("symbol")] ?? "EURUSD").toUpperCase(),
      market: (p[idx("market")] as Market) ?? "Forex",
      side: (p[idx("side")] as Side) ?? "Buy",
      volume: +(p[idx("volume")] ?? 0),
      entry: +(p[idx("entry")] ?? 0),
      exit: +(p[idx("exit")] ?? 0),
      stopLoss: +(p[idx("sl")] ?? 0),
      takeProfit: +(p[idx("tp")] ?? 0),
      commission: +(p[idx("commission")] ?? 0),
      swap: +(p[idx("swap")] ?? 0),
      profit: +(p[idx("profit")] ?? 0),
      durationMin: +(p[idx("durationmin")] ?? 0),
      setup: p[idx("setup")] ?? "",
      strategy: p[idx("strategy")] ?? "",
      emotion: (p[idx("emotion")] as Emotion) ?? "Neutre",
      notes: p[idx("notes")] ?? "",
      tags: (p[idx("tags")] ?? "").split("|").filter(Boolean),
    };
  });
}

function ImportPage() {
  const { importTrades, resetTrades } = useStore();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(f: File) {
    setBusy(true);
    try {
      const n = importTrades(parseCSV(await f.text()));
      toast.success(`${n} trades importés`);
    } catch { toast.error("Fichier illisible"); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import"
        description="Importez votre historique depuis un fichier CSV."
        actions={
          <Button variant="outline" onClick={() => { resetTrades(); toast.success("Journal réinitialisé"); }}>
            <RotateCcw className="mr-2 h-4 w-4" /> Réinitialiser
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-4 w-4" /> Fichier local</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onClick={() => ref.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-card/40 p-10 text-center transition hover:border-[color:var(--accent)]/60"
          >
            <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="font-medium">Cliquez pour choisir un fichier CSV</p>
            <p className="mt-1 text-xs text-muted-foreground">Excel & HTML MT4/MT5 bientôt disponibles.</p>
            <input ref={ref} type="file" accept=".csv" hidden disabled={busy}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Format CSV attendu</CardTitle></CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground">
{`date,symbol,market,side,volume,entry,exit,sl,tp,commission,swap,profit,durationMin,strategy,setup,emotion,tags,notes`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}