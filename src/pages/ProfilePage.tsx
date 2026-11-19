import { useAuth } from "@/features/auth/useAuth";
import { PageHeading } from "@/components/layout/PageHeading";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, LogOut } from "lucide-react";

export function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PageHeading
        title="Profil utilizator"
        eyebrow="Cont instituțional"
        subtitle="Informațiile contului tău USV Sport"
      />

      <div className="mt-6 space-y-6">
        <Card className="border border-border/80 shadow-xs">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{user?.fullName}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="capitalize text-xs font-semibold px-3 py-1">
                {user?.role}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-muted-foreground block">Rol instituțional</span>
                <span className="text-sm font-semibold capitalize flex items-center gap-1.5 mt-1">
                  <Shield className="h-4 w-4 text-primary" />
                  {user?.role}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-muted-foreground block">Stare cont</span>
                <span className="text-sm font-semibold flex items-center gap-1.5 mt-1 text-emerald-600">
                  <User className="h-4 w-4" />
                  {user?.isBlocked ? "Blocat (neprezentări)" : "Activ"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <Button
                variant="destructive"
                className="gap-2"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Deconectare
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
