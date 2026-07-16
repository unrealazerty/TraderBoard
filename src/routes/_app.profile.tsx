import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/_app/profile")({ component: ProfilePage });

function ProfilePage() {
  const { user, updateUser, changePassword } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [capital, setCapital] = useState(user?.capital ?? 10000);
  const [oldPwd, setOld] = useState("");
  const [newPwd, setNew] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader title="Profil" description="Vos informations personnelles et votre capital de trading." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Informations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Capital initial</Label><Input type="number" value={capital} onChange={(e) => setCapital(+e.target.value)} /></div>
            <Button onClick={() => { updateUser({ name, email, capital }); toast.success("Profil mis à jour"); }}>Enregistrer</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Mot de passe</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5"><Label>Ancien mot de passe</Label><Input type="password" value={oldPwd} onChange={(e) => setOld(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Nouveau mot de passe</Label><Input type="password" value={newPwd} onChange={(e) => setNew(e.target.value)} /></div>
            <Button variant="outline" onClick={async () => { await changePassword(oldPwd, newPwd); setOld(""); setNew(""); toast.success("Mot de passe modifié"); }}>Mettre à jour</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}