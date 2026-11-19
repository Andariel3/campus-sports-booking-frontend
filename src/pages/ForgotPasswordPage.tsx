import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail, Dumbbell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50/50 via-slate-50/40 to-slate-100/60 flex flex-col justify-center py-6 px-4 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#0F52BA]/10 to-indigo-500/5 rounded-full blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-40 right-10 w-[400px] h-[400px] bg-gradient-to-tl from-emerald-500/5 to-[#0F52BA]/10 rounded-full blur-3xl opacity-60" />

      <div className="relative z-10 w-full max-w-[420px] mx-auto space-y-6">
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
              <span>Recuperare Cont</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ai uitat parola?</h1>
            <p className="text-xs text-slate-500 font-normal">
              Introdu adresa instituțională pentru a primi instrucțiunile de resetare.
            </p>
          </div>
        </div>

        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 overflow-hidden">
          <CardContent className="p-6 space-y-4">
            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm space-y-3">
                <div className="flex items-center gap-2 font-semibold text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <span>Email trimis cu succes</span>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Dacă adresa <strong>{email}</strong> este asociată unui cont instituțional activ, vei primi în scurt timp un link pentru resetarea parolei.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2 h-10 rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-100/50"
                  onClick={() => setSubmitted(false)}
                >
                  Trimite un alt email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="h-11 pl-10 rounded-xl text-sm border-slate-200 bg-slate-50/50 focus:bg-white focus-visible:ring-[#0F52BA]/30 focus-visible:border-[#0F52BA]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-[#0F52BA] to-[#1E40AF] hover:from-[#0d469e] hover:to-[#17328c] text-white font-semibold text-sm shadow-md shadow-[#0F52BA]/20 transition-all"
                >
                  Trimite instrucțiunile
                </Button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link
                to="/login"
                className="text-xs font-semibold text-[#0F52BA] hover:underline inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Înapoi la autentificare
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
