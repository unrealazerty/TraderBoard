import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Download,
  Trash2,
  Copy,
  Pencil,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore, useAuth } from "@/lib/store";
import {
  ASSETS,
  EMOTIONS,
  SETUPS,
  STRATEGIES,
  type Trade,
} from "@/lib/mock-data";
import { currency, dateTime, duration } from "@/lib/format";
import { EmptyState } from "@/components/app/EmptyState";

export const Route = createFileRoute("/_app/journal")({
  component: JournalPage,
});

const PAGE = 15;

function JournalPage() {
  const { trades, deleteTrade, duplicateTrade, addTrade, updateTrade } = useStore();
  const { user } = useAuth();
  const cur = user?.currency ?? "USD";

  const [query, setQuery] = useState("");
  const [symbol, setSymbol] = useState<string>("all");
  const [side, setSide] = useState<string>("all");
  const [strategy, setStrategy] = useState<string>("all");
  const [sort, setSort] = useState<string>("date-desc");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Trade | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    let out = trades;
    const q = query.trim().toLowerCase();
    if (q)
      out = out.filter(
        (t) =>
          t.symbol.toLowerCase().includes(q) ||
          t.strategy.toLowerCase().includes(q) ||
          t.setup.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    if (symbol !== "all") out = out.filter((t) => t.symbol === symbol);
    if (side !== "all") out = out.filter((t) => t.side === side);
    if (strategy !== "all") out = out.filter((t) => t.strategy === strategy);
    switch (sort) {
      case "date-asc":
        out = [...out].sort((a, b) => +new Date(a.date) - +new Date(b.date));
        break;
      case "profit-desc":
        out = [...out].sort((a, b) => b.profit - a.profit);
        break;
      case "profit-asc":
        out = [...out].sort((a, b) => a.profit - b.profit);
        break;
      default:
        out = [...out].sort((a, b) => +new Date(b.date) - +new Date(a.date));
    }
    return out;
  }, [trades, query, symbol, side, strategy, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pageItems = filtered.slice((page - 1) * PAGE, page * PAGE);

  function exportCSV() {
    const header = [
      "date","symbol","market","side","volume","entry","exit","sl","tp",
      "commission","swap","profit","durationMin","strategy","setup","emotion","tags","notes",
    ];
    const rows = filtered.map((t) =>
      [
        t.date, t.symbol, t.market, t.side, t.volume, t.entry, t.exit,
        t.stopLoss, t.takeProfit, t.commission, t.swap, t.profit,
        t.durationMin, t.strategy, t.setup, t.emotion, t.tags.join("|"),
        `"${(t.notes || "").replace(/"/g, '""')}"`,
      ].join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tradeboard-journal.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal de trading"
        description={`${filtered.length} trades affichés sur ${trades.length}`}
        actions={
          <>
            <Button variant="outline" onClick={exportCSV}>
              <Download className="mr-2 h-4 w-4" /> Exporter
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Nouveau trade
            </Button>
          </>
        }
      />

      <div className="card-glass rounded-xl p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="pl-8"
            />
          </div>
          <Select value={symbol} onValueChange={(v) => { setSymbol(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Actif" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les actifs</SelectItem>
              {ASSETS.map((a) => (
                <SelectItem key={a.symbol} value={a.symbol}>{a.symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={side} onValueChange={(v) => { setSide(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Sens" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Buy & Sell</SelectItem>
              <SelectItem value="Buy">Buy</SelectItem>
              <SelectItem value="Sell">Sell</SelectItem>
            </SelectContent>
          </Select>
          <Select value={strategy} onValueChange={(v) => { setStrategy(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Stratégie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes stratégies</SelectItem>
              {STRATEGIES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue placeholder="Tri" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Date (récent)</SelectItem>
              <SelectItem value="date-asc">Date (ancien)</SelectItem>
              <SelectItem value="profit-desc">Profit (élevé)</SelectItem>
              <SelectItem value="profit-asc">Profit (faible)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState
          title="Aucun trade"
          description="Ajoutez votre premier trade ou modifiez vos filtres."
          icon={<Filter className="h-5 w-5" />}
          action={
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Nouveau trade
            </Button>
          }
        />
      ) : (
        <div className="card-glass overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Actif</TableHead>
                  <TableHead>Sens</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Entrée</TableHead>
                  <TableHead className="text-right">Sortie</TableHead>
                  <TableHead>Stratégie</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/40">
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {dateTime(t.date)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{t.symbol}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          t.side === "Buy"
                            ? "border-[color:var(--success)]/40 text-[color:var(--success)]"
                            : "border-[color:var(--destructive)]/40 text-[color:var(--destructive)]"
                        }
                      >
                        {t.side}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{t.volume}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.entry}</TableCell>
                    <TableCell className="text-right tabular-nums">{t.exit}</TableCell>
                    <TableCell className="text-xs">{t.strategy}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {duration(t.durationMin)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold tabular-nums ${t.profit >= 0 ? "text-profit" : "text-loss"}`}
                    >
                      {currency(t.profit, cur)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(t);
                              setOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { duplicateTrade(t.id); toast.success("Trade dupliqué"); }}>
                            <Copy className="mr-2 h-4 w-4" /> Dupliquer
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              deleteTrade(t.id);
                              toast.success("Trade supprimé");
                            }}
                            className="text-[color:var(--destructive)]"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between border-t border-border/60 px-4 py-3 text-xs text-muted-foreground">
            <span>
              Page {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}

      <TradeDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSave={(t) => {
          if (editing) {
            updateTrade(editing.id, t);
            toast.success("Trade mis à jour");
          } else {
            addTrade(t);
            toast.success("Trade ajouté");
          }
          setOpen(false);
        }}
      />
    </div>
  );
}

function TradeDialog({
  open,
  onOpenChange,
  editing,
  onSave,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: Trade | null;
  onSave: (t: Omit<Trade, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<Trade, "id">>(() => defaultTrade(editing));

  // Reset form when editing changes
  useMemoResetForm(() => setForm(defaultTrade(editing)), [editing, open]);

  function update<K extends keyof Omit<Trade, "id">>(k: K, v: Omit<Trade, "id">[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Modifier le trade" : "Nouveau trade"}
          </DialogTitle>
          <DialogDescription>
            Documentez précisément votre trade pour l'analyse.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Date & heure</Label>
            <Input
              type="datetime-local"
              value={form.date.slice(0, 16)}
              onChange={(e) => update("date", new Date(e.target.value).toISOString())}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Actif</Label>
            <Select
              value={form.symbol}
              onValueChange={(v) => {
                const a = ASSETS.find((x) => x.symbol === v)!;
                update("symbol", v);
                update("market", a.market);
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSETS.map((a) => (
                  <SelectItem key={a.symbol} value={a.symbol}>
                    {a.symbol} — {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Sens</Label>
            <Select value={form.side} onValueChange={(v) => update("side", v as Trade["side"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Buy">Buy</SelectItem>
                <SelectItem value="Sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Volume</Label>
            <Input type="number" step="0.01" value={form.volume} onChange={(e) => update("volume", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Prix d'entrée</Label>
            <Input type="number" step="0.00001" value={form.entry} onChange={(e) => update("entry", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Prix de sortie</Label>
            <Input type="number" step="0.00001" value={form.exit} onChange={(e) => update("exit", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Stop Loss</Label>
            <Input type="number" step="0.00001" value={form.stopLoss} onChange={(e) => update("stopLoss", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Take Profit</Label>
            <Input type="number" step="0.00001" value={form.takeProfit} onChange={(e) => update("takeProfit", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Commission</Label>
            <Input type="number" step="0.01" value={form.commission} onChange={(e) => update("commission", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Swap</Label>
            <Input type="number" step="0.01" value={form.swap} onChange={(e) => update("swap", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Profit</Label>
            <Input type="number" step="0.01" value={form.profit} onChange={(e) => update("profit", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Durée (min)</Label>
            <Input type="number" value={form.durationMin} onChange={(e) => update("durationMin", +e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Setup</Label>
            <Select value={form.setup} onValueChange={(v) => update("setup", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SETUPS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Stratégie</Label>
            <Select value={form.strategy} onValueChange={(v) => update("strategy", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STRATEGIES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Émotion</Label>
            <Select value={form.emotion} onValueChange={(v) => update("emotion", v as Trade["emotion"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {EMOTIONS.map((e) => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Tags (séparés par une virgule)</Label>
            <Input
              value={form.tags.join(", ")}
              onChange={(e) =>
                update(
                  "tags",
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Commentaires</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{editing ? "Enregistrer" : "Ajouter"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function defaultTrade(t: Trade | null): Omit<Trade, "id"> {
  if (t) {
    const { id: _id, ...rest } = t;
    return rest;
  }
  return {
    date: new Date().toISOString(),
    symbol: "EURUSD",
    market: "Forex",
    side: "Buy",
    volume: 0.5,
    entry: 1.087,
    exit: 1.089,
    stopLoss: 1.085,
    takeProfit: 1.091,
    commission: -2,
    swap: 0,
    profit: 40,
    durationMin: 45,
    setup: "London Open",
    strategy: "Breakout",
    emotion: "Discipliné",
    notes: "",
    tags: [],
  };
}

// tiny helper to reset form when props change without an effect import
import { useEffect as _useEffect } from "react";
function useMemoResetForm(fn: () => void, deps: unknown[]) {
  _useEffect(fn, deps);
}