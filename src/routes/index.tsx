import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

const features = [
  {
    icon: LineChart,
    title: "Dashboard temps réel",
    text: "Suivez capital, drawdown, win rate et profit factor en un coup d'œil.",
  },
  {
    icon: BookOpen,
    title: "Journal complet",
    text: "Chaque trade est documenté : setup, émotion, tags, captures d'écran.",
  },
  {
    icon: BarChart3,
    title: "Analyses avancées",
    text: "Performances par actif, stratégie, heure et jour de la semaine.",
  },
  {
    icon: Calculator,
    title: "Gestion du risque",
    text: "Calculateur de position, ratio R:R et gestion du capital intégrés.",
  },
  {
    icon: ShieldCheck,
    title: "Discipline",
    text: "Repérez vos biais émotionnels et corrigez vos patterns perdants.",
  },
  {
    icon: Sparkles,
    title: "Interface premium",
    text: "Design pensé pour les traders professionnels, sombre et rapide.",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.06]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[color:var(--accent)] opacity-20 blur-[120px]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--primary)] text-[color:var(--primary-foreground)]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">TradeBoard</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/auth/login">
            <Button variant="ghost" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="sm">Créer un compte</Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pt-10 pb-24 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--primary)]" />
            Nouveau — heatmap et journal enrichi
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Le journal de trading que vous méritez.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Une plateforme professionnelle pour suivre vos performances,
            analyser vos statistiques et optimiser votre gestion du risque.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth/register">
              <Button size="lg" className="gap-2">
                Commencer gratuitement <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">
                Voir la démo
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="card-glass rounded-xl p-5 transition hover:border-[color:var(--accent)]/40"
            >
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                <f.icon className="h-4 w-4" />
              </div>
              <p className="font-semibold">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TradeBoard. Projet démonstration.
      </footer>
    </div>
  );
}
