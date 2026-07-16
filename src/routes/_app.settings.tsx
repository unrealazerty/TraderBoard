import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth, useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { user, updateUser } = useAuth();
  const { resetTrades } = useStore();

  return (
    <div className="space-y-6">
      <PageHeader title="Paramètres" description="Préférences de l'application." />
      <Card>
        <CardHeader><CardTitle>Préférences</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Devise</Label>
            <Select value={user?.currency ?? "USD"} onValueChange={(v) => updateUser({ currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CHF">CHF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Langue</Label>
            <Select value={user?.language ?? "fr"} onValueChange={(v) => updateUser({ language: v as "fr" | "en" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Données</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Vos données sont stockées localement dans votre navigateur.</p>
          <Button variant="outline" onClick={() => { resetTrades(); toast.success("Journal réinitialisé aux données de démo"); }}>
            Réinitialiser le journal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}