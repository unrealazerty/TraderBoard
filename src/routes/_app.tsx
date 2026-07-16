import {
  createFileRoute,
  Outlet,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app/AppSidebar";
import { GlobalSearch } from "@/components/app/GlobalSearch";
import { useAuth } from "@/lib/store";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth/login" });
  }, [ready, user, navigate]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <div className="text-sm">Chargement…</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border/60 bg-background/80 px-3 backdrop-blur sm:px-6">
            <SidebarTrigger className="-ml-1" />
            <div className="mx-2 h-5 w-px bg-border" />
            <div className="flex flex-1 items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {segmentLabel(pathname)}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <GlobalSearch />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[color:var(--primary)]" />
              </Button>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function segmentLabel(p: string) {
  const map: Record<string, string> = {
    "/dashboard": "Tableau de bord",
    "/journal": "Journal de trading",
    "/analytics": "Analyses",
    "/risk": "Gestion du risque",
    "/watchlist": "Watchlist",
    "/calendar": "Calendrier économique",
    "/import": "Import",
    "/profile": "Profil",
    "/settings": "Paramètres",
  };
  return map[p] ?? "";
}