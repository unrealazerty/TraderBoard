import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.05]" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[420px] w-[520px] rounded-full bg-[color:var(--primary)] opacity-15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[420px] w-[520px] rounded-full bg-[color:var(--accent)] opacity-15 blur-[120px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-foreground)]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">TradeBoard</span>
        </Link>
        <div className="card-glass w-full rounded-2xl p-6 shadow-xl sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}