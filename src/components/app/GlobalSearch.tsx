import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useStore } from "@/lib/store";
import { ASSETS, STRATEGIES, TAGS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const { trades } = useStore();
  const navigate = useNavigate();

  const tradesShort = useMemo(() => trades.slice(0, 20), [trades]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-9 min-w-0 justify-start gap-2 text-muted-foreground sm:w-72"
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="truncate">Rechercher…</span>
        <kbd className="ml-auto hidden rounded border border-border/60 px-1.5 text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Rechercher un trade, un actif, une stratégie…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>
          <CommandGroup heading="Actifs">
            {ASSETS.map((a) => (
              <CommandItem
                key={a.symbol}
                value={`${a.symbol} ${a.name}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/watchlist" });
                }}
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {a.symbol}
                </span>
                <span className="ml-2 truncate">{a.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Stratégies">
            {STRATEGIES.map((s) => (
              <CommandItem
                key={s}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/analytics" });
                }}
              >
                {s}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Tags">
            {TAGS.map((t) => (
              <CommandItem
                key={t}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/journal" });
                }}
              >
                #{t}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Trades récents">
            {tradesShort.map((t) => (
              <CommandItem
                key={t.id}
                value={`${t.symbol} ${t.strategy} ${t.setup}`}
                onSelect={() => {
                  setOpen(false);
                  navigate({ to: "/journal" });
                }}
              >
                <span className="font-mono text-xs">{t.symbol}</span>
                <span className="ml-2 truncate text-muted-foreground">
                  {t.strategy} · {t.setup}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}