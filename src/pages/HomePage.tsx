import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import type { Resource } from "@/api/types";
import { getSportImage } from "@/lib/sportImages";
import { useAuth } from "@/features/auth/useAuth";
import {
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Award,
  ChevronRight,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const { user } = useAuth();

  // Obținem facilitățile direct din backend
  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: async () => apiClient.resources.list(),
  });

  return (
    <div className="w-full bg-[#F8FAFC] min-h-screen text-slate-900">
      {/* ────────────────── 1. HERO SECTION INOVATIV ────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B192C] via-[#0F52BA] to-[#1E3A8A] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Glow & background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.3),transparent_50%)] pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto space-y-8">
          {/* Pill Badge Universitate */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-blue-200 border border-white/20 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Universitatea „Ștefan cel Mare” din Suceava
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Live Rezervări Campus
            </span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Sport, Energie și Performanță în <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-300 to-indigo-100">Campusul USV</span>
            </h1>
            <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed font-normal">
              Platforma digitală oficială pentru studenți și cadre didactice. Rezervă terenurile sintetice de fotbal, terenurile de tenis și bazinul de înot în câteva secunde.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/facilitati">
              <Button size="lg" className="bg-white text-[#0F52BA] hover:bg-blue-50 font-bold px-6 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 gap-2">
                Explorează facilitățile
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={user ? "/rezerva" : "/login"}>
              <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-semibold px-6 h-12 rounded-xl backdrop-blur-md transition-all duration-200">
                {user ? "Fă o rezervare" : "Autentificare cont USV"}
              </Button>
            </Link>
          </div>

          {/* Live Campus Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-2xl font-black text-white">3 Baze</div>
              <div className="text-xs text-blue-200 font-medium mt-0.5">Fotbal, Tenis, Bazin Înot</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-2xl font-black text-white">08:00 – 22:00</div>
              <div className="text-xs text-blue-200 font-medium mt-0.5">Program zilnic terenuri</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-2xl font-black text-white">3 / lună</div>
              <div className="text-xs text-blue-200 font-medium mt-0.5">Rezervări per student</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
              <div className="text-2xl font-black text-emerald-400">100% Live</div>
              <div className="text-xs text-blue-200 font-medium mt-0.5">Actualizare automată sloturi</div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 2. CARUSEL / CARDURI FACILITĂȚI REALE ────────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto -mt-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F52BA]">
                Baza Materială Sportivă
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Facilități moderne deschise comunității universitare
            </h2>
          </div>
          <Link to="/facilitati" className="inline-flex items-center gap-1 text-sm font-semibold text-[#0F52BA] hover:underline">
            Vezi toate facilitățile
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Grid de facilități */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            ))
          ) : resources.length > 0 ? (
            resources.map((item) => {
              const imageSrc = getSportImage(item.sport, item.type);
              return (
                <Card key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group">
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={imageSrc}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-emerald-600 text-white font-semibold text-xs shadow-xs">
                        Disponibil
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      {item.pricePerHour} lei / oră
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-[#0F52BA] transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description || "Dotare omologată USV pentru antrenamente și competiții."}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        08:00 – 22:00
                      </div>
                      <Link to={`/rezerva/${item.id}`}>
                        <Button size="sm" className="bg-[#0F52BA] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg px-3.5">
                          Rezervă acum
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
              <Activity className="h-8 w-8 text-[#0F52BA] mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">Se încarcă facilitățile...</p>
            </div>
          )}
        </div>
      </section>

      {/* ────────────────── 3. CUM FUNCȚIONEAZĂ (3 PAȘI SIMPLI) ────────────────── */}
      <section className="py-14 bg-white border-y border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="secondary" className="bg-blue-50 text-[#0F52BA] text-xs font-semibold">
              Proces Simplu & Rapid
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Cum funcționează rezervarea în 3 pași
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Am eliminat cozile și formalitățile pe hârtie. Întreg procesul se desfășoară digital direct de pe telefon sau laptop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0F52BA] font-black flex items-center justify-center text-lg shadow-xs">
                1
              </div>
              <h3 className="font-bold text-base text-foreground">Autentificare USV</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Conectează-te cu adresa de email instituțională <span className="font-semibold text-slate-700">@student.usv.ro</span> pentru recunoașterea automată a statutului de student.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0F52BA] font-black flex items-center justify-center text-lg shadow-xs">
                2
              </div>
              <h3 className="font-bold text-base text-foreground">Alegere dată & interval</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Selectează facilitatea sportivă și alege un interval liber de 1–2 ore direct din calendarul interactiv sincronizat în timp real.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#0F52BA] font-black flex items-center justify-center text-lg shadow-xs">
                3
              </div>
              <h3 className="font-bold text-base text-foreground">Confirmare instantă</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Primești codul de rezervare unic (ex. <span className="font-mono font-semibold text-slate-700">#USV-10422</span>) și te prezinți la recepție cu 15 minute înainte de joc.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────── 4. BENEFICII STUDENȚI & REGULI USV ────────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs font-semibold">
              Regulament & Facilități
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
              Reguli clare pentru un acces echitabil pentru toți studenții
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Baza sportivă a Universității „Ștefan cel Mare” funcționează după un set de reguli gândite să asigure oportunități egale pentru fiecare membru al comunității academice.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Limita lunară:</strong> Fiecare student are dreptul la maxim 3 rezervări active în fiecare lună calendaristică.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Anulare gratuită:</strong> Poți anula rezervarea direct din aplicație cu minim 2 ore înainte de ora de începere.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Neprezentări & Fair Play:</strong> La acumularea a 2 neprezentări, contul este restricționat automat pentru a proteja disponibilitatea colegilor.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-900 to-[#0F52BA] text-white space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-amber-300" />
              <div>
                <h4 className="font-bold text-lg">Complexul Sportiv USV</h4>
                <p className="text-xs text-blue-200">Campus 1, Str. Universității nr. 13</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-blue-100">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span>Bazin Olimpic Acoperit</span>
                <span className="font-bold text-white">6 culoare · 25 m</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span>Teren de Fotbal Sintetic</span>
                <span className="font-bold text-white">Gazon artificial + Nocturnă</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span>Terenuri de Tenis</span>
                <span className="font-bold text-white">Zgură amenajată profesional</span>
              </div>
            </div>

            <Link to="/facilitati" className="block">
              <Button className="w-full bg-white text-[#0F52BA] hover:bg-blue-50 font-bold rounded-xl h-11 text-xs sm:text-sm">
                Vezi orarul disponibil acum
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────── 5. BANNER FINAL CTA ────────────────── */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Gata să intri pe teren?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Alege facilitatea preferată și rezervă-ți intervalul orar dorit în câteva click-uri.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link to="/facilitati">
              <Button size="lg" className="bg-[#0F52BA] hover:bg-[#1E40AF] text-white font-bold rounded-xl px-8 shadow-md">
                Mergi la facilități
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
