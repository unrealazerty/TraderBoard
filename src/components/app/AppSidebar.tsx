import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Calculator,
  Star,
  CalendarClock,
  Upload,
  User as UserIcon,
  Settings as SettingsIcon,
  LogOut,
  TrendingUp,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Journal", url: "/journal", icon: BookOpen },
  { title: "Analyses", url: "/analytics", icon: BarChart3 },
  { title: "Gestion du risque", url: "/risk", icon: Calculator },
  { title: "Watchlist", url: "/watchlist", icon: Star },
  { title: "Calendrier éco.", url: "/calendar", icon: CalendarClock },
  { title: "Import", url: "/import", icon: Upload },
];

const secondary = [
  { title: "Profil", url: "/profile", icon: UserIcon },
  { title: "Paramètres", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-2">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-sm">
            <TrendingUp className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">TradeBoard</p>
              <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                Trader edition
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Espace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Compte</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 rounded-lg p-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-[color:var(--accent)]/20 text-xs">
              {user?.name?.slice(0, 2).toUpperCase() ?? "TB"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{user?.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user?.email}
              </p>
            </div>
          )}
          <button
            onClick={logout}
            title="Se déconnecter"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}