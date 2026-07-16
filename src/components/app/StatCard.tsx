import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "profit" | "loss" | "accent";
  className?: string;
}) {
  const toneClass =
    tone === "profit"
      ? "text-profit"
      : tone === "loss"
        ? "text-loss"
        : tone === "accent"
          ? "text-[color:var(--accent)]"
          : "text-foreground";
  return (
    <div
      className={cn(
        "card-glass rounded-xl p-4 shadow-sm transition hover:border-[color:var(--accent)]/40 hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className={cn("mt-1 text-2xl font-semibold tabular-nums", toneClass)}>
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        {icon && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}