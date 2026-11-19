import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  LogIn,
  Shield,
  User,
  Dumbbell,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
    setServerError(null);
    if (role === "admin") {
      setValue("email", "admin@usv.ro", { shouldValidate: true });
      setValue("password", "admin123", { shouldValidate: true });
    } else {
      setValue("email", "student@student.usv.ro", { shouldValidate: true });
      setValue("password", "student123", { shouldValidate: true });
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Header cu logo și identitate USV conform wireframe W1 */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link
            to="/"
            className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F52BA] to-[#1E40AF] text-white shadow-xl shadow-[#0F52BA]/25 hover:scale-105 transition-all duration-300"
            title="Înapoi la pagina principală"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Dumbbell className="h-8 w-8 relative z-10" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
            </span>
          </Link>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-[#0F52BA]">
              <Sparkles className="h-3 w-3" />
              <span>Campus Sports Booking</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Autentificare</h1>
            <p className="text-xs text-slate-500 font-normal">
              Folosește adresa instituțională USV (@student.usv.ro / @usv.ro).
            </p>
          </div>
        </div>

        {/* Card formular de autentificare */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <CardContent className="p-6 space-y-4">
            {sessionExpired && (
              <Alert className="text-xs py-2.5 bg-amber-50/80 border-amber-200 text-amber-900 rounded-xl">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <AlertDescription>
                  Sesiunea ta a expirat. Te rugăm să te autentifici din nou pentru a continua.
                </AlertDescription>
              </Alert>
            )}

            {serverError && (
              <Alert variant="destructive" className="text-xs py-2.5 rounded-xl border-rose-200 bg-rose-50/90 text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <AlertDescription className="font-medium">{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Câmp Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email instituțional
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@student.usv.ro"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...register("email")}
                    className={`h-11 pl-10 rounded-xl text-sm transition-all bg-slate-50/50 focus:bg-white ${
                      errors.email
                        ? "border-rose-400 focus-visible:ring-rose-400"
                        : "border-slate-200 focus-visible:ring-[#0F52BA]/30 focus-visible:border-[#0F52BA]"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] font-medium text-rose-600">{errors.email.message}</p>
                )}
              </div>

              {/* Câmp Parolă cu toggle afișare/ascundere */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Parolă
                  </Label>
                  <Link
                    to="/parola-uitata"
                    className="text-[11px] font-semibold text-[#0F52BA] hover:underline"
                  >
                    Ai uitat parola?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    {...register("password")}
                    className={`h-11 pl-10 pr-10 rounded-xl text-sm transition-all bg-slate-50/50 focus:bg-white ${
                      errors.password
                        ? "border-rose-400 focus-visible:ring-rose-400"
                        : "border-slate-200 focus-visible:ring-[#0F52BA]/30 focus-visible:border-[#0F52BA]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? "Ascunde parola" : "Arată parola"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-medium text-rose-600">{errors.password.message}</p>
                )}
              </div>

              {/* Buton principal: Intră în cont */}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0F52BA] to-[#1E40AF] hover:from-[#0d469e] hover:to-[#17328c] text-white font-semibold text-sm shadow-md shadow-[#0F52BA]/20 hover:shadow-lg hover:shadow-[#0F52BA]/30 active:scale-[0.99] transition-all"
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

              {/* Buton secundar outline: Creează cont nou */}
              <Button
                asChild
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors"
              >
                <Link to="/inregistrare">Creează cont nou</Link>
              </Button>
            </form>

            {/* Secțiune acces rapid cu date de test reale din baza de date */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Acces rapid pentru testare
                </span>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Conturi active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill("student")}
                  className="group flex flex-col items-start p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-blue-50/60 hover:border-[#0F52BA]/40 transition-all text-left"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-[#0F52BA]">
                    <User className="h-3.5 w-3.5 text-[#0F52BA]" />
                    <span>Student</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 truncate w-full">
                    student@student.usv.ro
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    parolă: student123
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill("admin")}
                  className="group flex flex-col items-start p-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-purple-50/60 hover:border-purple-300 transition-all text-left"
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 group-hover:text-purple-700">
                    <Shield className="h-3.5 w-3.5 text-purple-600" />
                    <span>Administrator</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 truncate w-full">
                    admin@usv.ro
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    parolă: admin123
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Login;
