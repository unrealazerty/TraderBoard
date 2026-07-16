import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/store";
import { ASSETS } from "@/lib/mock-data";
import { currency, num } from "@/lib/format";

export const Route = createFileRoute("/_app/risk")({
  component: RiskPage,
});

function RiskPage() {
  const { user } = useAuth();
  const cur = user?.currency ?? "USD";
  const [capital, setCapital] = useState(user?.capital ?? 10000);
  const [riskPct, setRiskPct] = useState(1);
  const [symbol, setSymbol] = useState("EURUSD");
  const [entry, setEntry] = useState(1.087);
  const [stop, setStop] = useState(1.083);
  const [target, setTarget] = useState(1.095);

  const asset = ASSETS.find((a) => a.symbol === symbol) ?? ASSETS[0];

  const calc = useMemo(() => {
    const riskAmount = (capital * riskPct) / 100;
    const stopDist = Math.abs(entry - stop);
    const rewardDist = Math.abs(target - entry);
    const positionSize = stopDist > 0 ? riskAmount / stopDist : 0;
    const potentialProfit = positionSize * rewardDist;
    const rr = stopDist > 0 ? rewardDist / stopDist : 0;
    return { riskAmount, positionSize, potentialProfit, rr };
  }, [capital, riskPct, entry, stop, target]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion du risque"
        description="Dimensionnez chaque trade en cohérence avec votre plan."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4" /> Calculateur de position
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Capital ({cur})</Label>
                <Input type="number" value={capital} onChange={(e) => setCapital(+e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Risque (%)</Label>
                <Input type="number" step="0.1" value={riskPct} onChange={(e) => setRiskPct(+e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Actif</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSETS.map((a) => (
                      <SelectItem key={a.symbol} value={a.symbol}>{a.symbol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prix d'entrée</Label>
                <Input type="number" step="0.00001" value={entry} onChange={(e) => setEntry(+e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Stop Loss</Label>
                <Input type="number" step="0.00001" value={stop} onChange={(e) => setStop(+e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Take Profit</Label>
                <Input type="number" step="0.00001" value={target} onChange={(e) => setTarget(+e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard label="Montant risqué" value={currency(calc.riskAmount, cur)} tone="loss" />
            <StatCard label="Profit potentiel" value={currency(calc.potentialProfit, cur)} tone="profit" />
            <StatCard label="Taille de position" value={num(calc.positionSize, 2)} hint={asset.market === "Forex" ? "unités de base" : "unités"} tone="accent" />
            <StatCard label="Risk / Reward" value={`${num(calc.rr, 2)} : 1`} />
          </div>
          <Card>
            <CardHeader><CardTitle>Recommandations</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Ne risquez jamais plus de <span className="text-foreground">1 à 2%</span> par trade.</p>
              <p>• Un R:R inférieur à 1 nécessite un win rate supérieur à 50%.</p>
              <p>• Vérifiez systématiquement votre stop avant l'entrée.</p>
              <p>• Documentez chaque trade pour améliorer votre edge.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}