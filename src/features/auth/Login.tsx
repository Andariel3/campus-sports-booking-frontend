import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn, Shield, User, Dumbbell, AlertCircle } from "lucide-react";
import { useAuth } from "./useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Introdu adresa de email instituțională")
    .email("Formatul adresei de email este invalid"),
  password: z.string().min(1, "Introdu parola"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get("expirat") === "1";

  const from = (location.state as { from?: string })?.from || "/";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.error || "Autentificarea a eșuat. Verifică datele introduse.");
    }
  };

  const handleQuickFill = (role: "student" | "admin") => {
    if (role === "admin") {
      setValue("email", "admin.baza@usv.ro");
      setValue("password", "parolaAdmin123");
    } else {
      setValue("email", "yevhenii.zehria@student.usv.ro");
      setValue("password", "parolaStudent123");
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[390px] space-y-6">
        {/* Logo conform wireframe W1 */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link
            to="/"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0F52BA] text-white shadow-lg shadow-[#0F52BA]/25 hover:scale-105 transition-transform duration-200"
          >
            <Dumbbell className="h-7 w-7" />
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Autentificare</h1>
            <p className="text-xs text-muted-foreground font-normal">
              Folosește adresa instituțională.
            </p>
          </div>
        </div>

        {/* Card formular de autentificare */}
        <Card className="rounded-2xl border border-border/80 bg-card p-6 shadow-xs">
          <CardContent className="p-0 space-y-4">
            {sessionExpired && (
              <Alert variant="warning" className="text-xs py-2.5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sesiunea ta a expirat. Te rugăm să te autentifici din nou.
                </AlertDescription>
              </Alert>
            )}

            {serverError && (
              <Alert variant="destructive" className="text-xs py-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                  Email instituțional
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@student.usv.ro"
                  autoComplete="email"
                  disabled={isSubmitting}
                  {...register("email")}
                  className={`h-11 rounded-xl text-sm ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-[11px] text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                  Parolă
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  {...register("password")}
                  className={`h-11 rounded-xl text-sm ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.password && (
                  <p className="text-[11px] text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Buton principal: Intră în cont */}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-[#0F52BA] hover:bg-[#1E40AF] text-white font-semibold text-sm shadow-sm transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se verifică datele...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Intră în cont
                  </>
                )}
              </Button>

              {/* Buton secundar outline: Creează cont nou (exact ca în wireframe W1) */}
              <Button
                asChild
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-border text-foreground font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                <Link to="/inregistrare">Creează cont nou</Link>
              </Button>
            </form>

            {/* Link text dedesubt: Ai uitat parola? */}
            <div className="text-center pt-2">
              <Link
                to="/parola-uitata"
                className="text-xs font-semibold text-[#0F52BA] hover:underline"
              >
                Ai uitat parola?
              </Link>
            </div>

            {/* Butoane de test rapid */}
            <div className="pt-4 border-t border-border/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block text-center mb-2">
                Acces rapid pentru testare
              </span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill("student")}
                  className="rounded-lg text-xs h-8 text-slate-700 hover:text-[#0F52BA] hover:border-[#0F52BA]/40"
                >
                  <User className="h-3.5 w-3.5 mr-1 text-[#0F52BA]" />
                  Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickFill("admin")}
                  className="rounded-lg text-xs h-8 text-slate-700 hover:text-purple-600 hover:border-purple-300"
                >
                  <Shield className="h-3.5 w-3.5 mr-1 text-purple-600" />
                  Admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
