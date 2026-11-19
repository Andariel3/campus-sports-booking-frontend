import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Info,
  Loader2,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  Dumbbell,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "./useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Numele complet trebuie să aibă minim 3 caractere")
      .max(100, "Numele este prea lung"),
    email: z
      .string()
      .trim()
      .email("Formatul adresei de email este invalid")
      .refine(
        (val) => val.endsWith("@student.usv.ro") || val.endsWith("@usm.ro"),
        "Sunt permise doar adrese instituționale (@student.usv.ro sau @usm.ro)"
      ),
    phone: z.string().trim().optional(),
    password: z
      .string()
      .min(8, "Parola trebuie să conțină cel puțin 8 caractere"),
    confirmPassword: z.string().min(1, "Confirmă parola introdusă"),
    agreeRegulations: z.boolean().refine((val) => val === true, {
      message: "Trebuie să fii de acord cu regulamentul bazei sportive",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele introduse nu coincid",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function Register() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeRegulations: false,
    },
  });

  const emailValue = watch("email") || "";
  const agreeValue = watch("agreeRegulations");

  // Detectare rol estimat pe baza domeniului
  const detectedRole = emailValue.toLowerCase().endsWith("@student.usv.ro")
    ? "Student (limită de 3 rezervări / lună)"
    : emailValue.toLowerCase().endsWith("@usm.ro")
      ? "Cadru didactic (fără limită lunară)"
      : null;

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    const result = await registerAuth({
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
    });

    if (result.success) {
      navigate("/facilitati", { replace: true });
    } else {
      setServerError(result.error || "Înregistrarea a eșuat. Verifică datele introduse.");
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[440px] space-y-6">
        {/* Header cu logo și titlu */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link
            to="/"
            className="group relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F52BA] to-[#1E40AF] text-white shadow-xl shadow-[#0F52BA]/25 hover:scale-105 transition-all duration-300"
            title="Înapoi la pagina principală"
          >
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Dumbbell className="h-8 w-8 relative z-10" />
          </Link>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-[#0F52BA]">
              <Sparkles className="h-3 w-3" />
              <span>Cont Nou Campus Sports</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Creează cont nou</h1>
            <p className="text-xs text-slate-500 font-normal">
              Completează formularul cu datele tale instituționale USV.
            </p>
          </div>
        </div>

        {/* Card formular înregistrare */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <CardContent className="p-6 space-y-4">
            {serverError && (
              <Alert variant="destructive" className="text-xs py-2.5 rounded-xl border-rose-200 bg-rose-50/90 text-rose-800">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <AlertDescription className="font-medium">{serverError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Nume și prenume */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700">
                  Nume și prenume
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="fullName"
                    placeholder="Ion Popescu"
                    autoComplete="name"
                    disabled={isSubmitting}
                    {...register("fullName")}
                    className={`h-11 pl-10 rounded-xl text-sm transition-all bg-slate-50/50 focus:bg-white ${
                      errors.fullName
                        ? "border-rose-400 focus-visible:ring-rose-400"
                        : "border-slate-200 focus-visible:ring-[#0F52BA]/30 focus-visible:border-[#0F52BA]"
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-[11px] font-medium text-rose-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email instituțional */}
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
                    placeholder="ion.popescu@student.usv.ro"
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
                {detectedRole && (
                  <div className="pt-1 flex items-center gap-1.5">
                    <Badge variant="secondary" className="bg-blue-50 text-[#0F52BA] border border-blue-200/60 text-[11px] font-normal py-0.5 px-2">
                      <Info className="h-3 w-3 mr-1" /> {detectedRole}
                    </Badge>
                  </div>
                )}
                {errors.email && (
                  <p className="text-[11px] font-medium text-rose-600">{errors.email.message}</p>
                )}
              </div>

              {/* Număr de telefon (opțional) */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                  Număr de telefon (opțional)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="07xxxxxxxx"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    {...register("phone")}
                    className="h-11 pl-10 rounded-xl text-sm border-slate-200 bg-slate-50/50 focus:bg-white focus-visible:ring-[#0F52BA]/30 focus-visible:border-[#0F52BA]"
                  />
                </div>
              </div>

              {/* Parolă */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Parolă (minim 8 caractere)
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
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

              {/* Confirmă parola */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-700">
                  Confirmă parola
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Reintrodu parola"
                    autoComplete="new-password"
                    disabled={isSubmitting}
                    {...register("confirmPassword")}
                    className={`h-11 pl-10 pr-10 rounded-xl text-sm transition-all bg-slate-50/50 focus:bg-white ${
                      errors.confirmPassword
                        ? "border-rose-400 focus-visible:ring-rose-400"
                        : "border-slate-200 focus-visible:ring-[#0F52BA]/30 focus-visible:border-[#0F52BA]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "Ascunde parola" : "Arată parola"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] font-medium text-rose-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Checkbox acord regulament */}
              <div className="pt-2">
                <div className="flex items-start space-x-2.5">
                  <Checkbox
                    id="agreeRegulations"
                    checked={agreeValue}
                    onCheckedChange={(checked) => setValue("agreeRegulations", Boolean(checked))}
                    disabled={isSubmitting}
                    className="mt-0.5"
                  />
                  <div className="grid gap-1 leading-none">
                    <Label
                      htmlFor="agreeRegulations"
                      className="text-xs text-slate-600 font-normal cursor-pointer leading-relaxed"
                    >
                      Sunt de acord cu{" "}
                      <span className="text-[#0F52BA] font-semibold underline">
                        Regulamentul bazei sportive USV
                      </span>{" "}
                      (anulare cu min. 2 ore înainte, max. 3 rezervări/lună pentru studenți).
                    </Label>
                  </div>
                </div>
                {errors.agreeRegulations && (
                  <p className="text-[11px] font-medium text-rose-600 mt-1.5">
                    {errors.agreeRegulations.message}
                  </p>
                )}
              </div>

              {/* Buton principal creare cont */}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0F52BA] to-[#1E40AF] hover:from-[#0d469e] hover:to-[#17328c] text-white font-semibold text-sm shadow-md shadow-[#0F52BA]/20 hover:shadow-lg hover:shadow-[#0F52BA]/30 active:scale-[0.99] transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Se creează contul...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Creează cont
                  </>
                )}
              </Button>
            </form>

            {/* Link înapoi la login */}
            <div className="pt-4 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Ai deja un cont creat?{" "}
                <Link to="/login" className="font-semibold text-[#0F52BA] hover:underline">
                  Intră în cont
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Register;
