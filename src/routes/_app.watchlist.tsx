import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Star, StarOff, Search } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MOCK_QUOTES } from "@/lib/mock-data";
import { useStore } from "@/lib/store";
import { num, pct } from "@/lib/format";

export const Route = createFileRoute("/_app/watchlist")({
  component: WatchlistPage,
});

function WatchlistPage() {
  const { favorites, toggleFavorite } = useStore();
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("all");
  const [sort, setSort] = useState("fav");
  const [showFavOnly, setShowFavOnly] = useState(false);

  const rows = useMemo(() => {
    let out = MOCK_QUOTES;
    if (query)
      out = out.filter(
        (q) =>
          q.symbol.toLowerCase().includes(query.toLowerCase()) ||
          q.name.toLowerCase().includes(query.toLowerCase()),
      );
    if (market !== "all") out = out.filter((q) => q.market === market);
    if (showFavOnly) out = out.filter((q) => favorites.includes(q.symbol));
    const withFav = out.map((q) => ({ ...q, fav: favorites.includes(q.symbol) }));
    switch (sort) {
      case "change-desc":
        return [...withFav].sort((a, b) => b.change - a.change);
      case "change-asc":
        return [...withFav].sort((a, b) => a.change - b.change);
      case "vol-desc":
        return [...withFav].sort((a, b) => b.volume - a.volume);
      default:
        return [...withFav].sort((a, b) => Number(b.fav) - Number(a.fav));
    }
  }, [query, market, sort, favorites, showFavOnly]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Watchlist"
        description="Vos actifs favoris et leurs variations en direct (données de démo)."
      />
      <div className="card-glass rounded-xl p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" />
          </div>
          <Select value={market} onValueChange={setMarket}>
            <SelectTrigger><SelectValue placeholder="Marché" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous marchés</SelectItem>
              <SelectItem value="Forex">Forex</SelectItem>
              <SelectItem value="Metals">Métaux</SelectItem>
              <SelectItem value="Indices">Indices</SelectItem>
              <SelectItem value="Crypto">Crypto</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="fav">Favoris d'abord</SelectItem>
              <SelectItem value="change-desc">Variation +</SelectItem>
              <SelectItem value="change-asc">Variation -</SelectItem>
              <SelectItem value="vol-desc">Volume +</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={showFavOnly ? "default" : "outline"} onClick={() => setShowFavOnly((v) => !v)}>
            <Star className="mr-2 h-4 w-4" />
            {showFavOnly ? "Favoris uniquement" : "Tout afficher"}
          </Button>
        </div>
      </div>
      <div className="card-glass overflow-hidden rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Symbole</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Marché</TableHead>
              <TableHead className="text-right">Prix</TableHead>
              <TableHead className="text-right">Variation</TableHead>
              <TableHead className="text-right">Volume</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((q) => (
              <TableRow key={q.symbol} className="hover:bg-muted/40">
                <TableCell>
                  <button
                    onClick={() => toggleFavorite(q.symbol)}
                    className="text-muted-foreground hover:text-[color:var(--warning)]"
                  >
                    {q.fav ? (
                      <Star className="h-4 w-4 fill-[color:var(--warning)] text-[color:var(--warning)]" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </button>
                </TableCell>
                <TableCell className="font-mono text-xs">{q.symbol}</TableCell>
                <TableCell className="text-sm">{q.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{q.market}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{num(q.price, 4)}</TableCell>
                <TableCell className={`text-right font-semibold tabular-nums ${q.change >= 0 ? "text-profit" : "text-loss"}`}>
                  {pct(q.change)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {num(q.volume, 0)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}