import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/auth/forgot")({
  component: Forgot,
});

function Forgot() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    toast.success("Si l'email existe, un lien a été envoyé.");
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Nous vous enverrons un lien de réinitialisation.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Envoi…" : "Envoyer le lien"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          to="/auth/login"
          className="text-[color:var(--accent)] hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}