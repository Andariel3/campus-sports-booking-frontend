import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/useAuth";
import { apiClient } from "@/api/client";
import type { Resource, Reservation } from "@/api/types";
import { getSportImage } from "@/lib/sportImages";
import { 
  Dumbbell, 
  Clock, 
  MapPin, 
  Search, 
  ArrowUpDown, 
  Sparkles, 
  ChevronRight, 
  Info,
  CheckCircle2,
  AlertCircle,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyLimitCard } from "@/features/reservations/MonthlyLimitCard";

// Categorii de filtrare cerute explicit în task: Toate, Fotbal, Tenis, Înot
const SPORT_TABS = [
  { id: "toate", label: "Toate" },
  { id: "fotbal", label: "Fotbal" },
  { id: "tenis", label: "Tenis" },
  { id: "inot", label: "Înot" },
] as const;

type SportTabId = (typeof SPORT_TABS)[number]["id"];
type SortOption = "default" | "price-asc" | "price-desc" | "name";

// Subtitlu specific per sport conform prototipului
function getFacilitySubtitle(sport: string, description?: string | null): string {
  const s = (sport || "").toLowerCase();
  if (s.includes("fotbal")) return "Sintetic · Nocturnă · 10 jucători";
  if (s.includes("tenis")) return "Zgură · 2 - 4 jucători";
  if (s.includes("inot") || s.includes("înot")) return "25 m · 6 culoare · Acoperit";
  if (s.includes("baschet") || s.includes("volei")) return "Parchet · Suprafață omologată FIBA";
  return description || "Baza Sportivă USV";
}

export default function FacilitiesPage() {
  const { user, isStudent, isBlocked } = useAuth();
  const [selectedTab, setSelectedTab] = useState<SportTabId>("toate");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [activeFacility, setActiveFacility] = useState<Resource | null>(null);

  // Preluare resurse prin clientul API
  const {
    data: resources = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: async () => {
      return apiClient.resources.list();
    },
  });

  // Preluare rezervări active pentru calculul limitei lunare
  const { data: myReservations = [] } = useQuery<Reservation[]>({
    queryKey: ["myReservations"],
    queryFn: async () => {
      return apiClient.reservations.list();
    },
    enabled: Boolean(user),
  });

  // Calcul rezervări luna curentă pentru student (implicit 2 conform wireframe-ului W2 dacă nu are rezervări)
  const activeCount = myReservations.filter((r) => r.status === "ACTIVA" || r.status === "FINALIZATA").length;
  const studentReservationsCount = user ? activeCount : 2;
  const maxMonthlyLimit = 3;
  const isLimitReached = isStudent && studentReservationsCount >= maxMonthlyLimit;

  // Filtrare și sortare
  const filteredResources = useMemo(() => {
    let list = [...resources];

    // 1. Filtrare după tab-ul selectat
    if (selectedTab !== "toate") {
      list = list.filter((item) => {
        const itemSport = (item.sport || "").toLowerCase();
        if (selectedTab === "inot") {
          return itemSport.includes("inot") || itemSport.includes("înot") || item.type === "bazin";
        }
        return itemSport.includes(selectedTab);
      });
    }

    // 2. Filtrare după căutare
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.sport.toLowerCase().includes(q) ||
          (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // 3. Sortare
    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.pricePerHour || 0) - (b.pricePerHour || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.pricePerHour || 0) - (a.pricePerHour || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name, "ro"));
    }

    return list;
  }, [resources, selectedTab, searchQuery, sortBy]);

  // Numele utilizatorului pentru salut conform wireframe: "Salut, Andrei. Ce sport alegi azi?"
  const userGreetingName = user?.fullName
    ? user.fullName.split(" ")[0]
    : "Andrei";

  return (
    <div className="w-full bg-[#F8FAFC]">
      {/* ───── Secțiune Antet & Salut (Conform Wireframe W2) ───── */}
      <section className="bg-white border-b border-border/70 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#0F52BA]">
                  <Sparkles className="h-3 w-3" />
                  Baza Sportivă Universitară
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Salut, {userGreetingName}. Ce sport alegi azi?
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Verifică disponibilitatea în timp real și rezervă terenul dorit.
              </p>
            </div>

            {/* Indicator Limită Lunară pentru Studenți conform Wireframe W2 */}
            {(!user || isStudent) && (
              <div className="w-full sm:w-80 shrink-0">
                <MonthlyLimitCard
                  usedCount={studentReservationsCount}
                  maxLimit={maxMonthlyLimit}
                  noShowCount={user?.noShowCount || 0}
                  isBlocked={isBlocked}
                />
              </div>
            )}
          </div>

          {/* ───── Bara de filtrare cu tab-uri, căutare și sortare ───── */}
          <div className="pt-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            {/* Tab-uri de filtrare pe sport conform wireframe W2 */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {SPORT_TABS.map((tab) => {
                const isActive = selectedTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 shrink-0 ${
                      isActive
                        ? "bg-[#0F52BA] text-white shadow-sm shadow-[#0F52BA]/25"
                        : "bg-slate-100 text-muted-foreground hover:bg-slate-200 hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Căutare și sortare */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Caută facilitate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs sm:text-sm rounded-xl bg-slate-50 border-border"
                />
              </div>

              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="h-9 px-3 pr-8 rounded-xl bg-slate-50 border border-border text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-[#0F52BA] cursor-pointer appearance-none"
                >
                  <option value="default">Sortare: Implicit</option>
                  <option value="price-asc">Preț: Crescător</option>
                  <option value="price-desc">Preț: Descrescător</option>
                  <option value="name">Nume: A-Z</option>
                </select>
                <ArrowUpDown className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Grila de Facilități (Carduri conform Wireframe) ───── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de alertă pentru cont blocat */}
        {isBlocked && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Contul tău este temporar restricționat</p>
              <p className="mt-0.5">
                Ai acumulat 2 neprezentări la rezervările anterioare. Nu poți efectua rezervări noi până la deblocarea de către administrator.
              </p>
            </div>
          </div>
        )}

        {/* Stare Încărcare */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="rounded-2xl overflow-hidden border border-border/80 p-0 shadow-xs">
                <Skeleton className="aspect-16/10 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                  <div className="pt-4 flex items-center justify-between">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stare Eroare */}
        {isError && (
          <div className="p-8 text-center rounded-2xl bg-white border border-border shadow-xs max-w-md mx-auto space-y-3">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-foreground">Nu s-au putut încărca facilitățile</h3>
            <p className="text-xs text-muted-foreground">
              A apărut o problemă de comunicare cu serverul bazei sportive.
            </p>
            <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl">
              Reîncearcă
            </Button>
          </div>
        )}

        {/* Stare Gol (Empty State) */}
        {!isLoading && !isError && filteredResources.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-white border border-border shadow-xs max-w-md mx-auto space-y-3">
            <Dumbbell className="h-10 w-10 text-muted-foreground/50 mx-auto" />
            <h3 className="text-base font-bold text-foreground">Nicio facilitate găsită</h3>
            <p className="text-xs text-muted-foreground">
              Nu există terenuri sau bazine care să corespundă criteriilor de căutare selectate.
            </p>
            <Button
              onClick={() => {
                setSelectedTab("toate");
                setSearchQuery("");
                setSortBy("default");
              }}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              Resetează filtrele
            </Button>
          </div>
        )}

        {/* Lista de Carduri */}
        {!isLoading && !isError && filteredResources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((facility) => {
              const image = getSportImage(facility.sport, facility.type);
              const subtitle = getFacilitySubtitle(facility.sport, facility.description);
              const priceLabel =
                facility.type === "bazin" || facility.sport.toLowerCase().includes("inot")
                  ? `${facility.pricePerHour || 25} lei / acces`
                  : `${facility.pricePerHour || 40} lei / oră`;

              return (
                <Card
                  key={facility.id}
                  className="rounded-2xl overflow-hidden border border-border/80 bg-white shadow-xs hover:shadow-md transition-all duration-200 flex flex-col group"
                >
                  {/* Imagine cu overlay și badge-uri semantice */}
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                    <img
                      src={image}
                      alt={facility.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Badge semantic: Disponibil (Verde conform specificației) */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/90 text-white shadow-xs backdrop-blur-xs">
                        <CheckCircle2 className="h-3 w-3" />
                        Disponibil
                      </span>
                    </div>

                    {/* Buton detalii rapide (info) */}
                    <button
                      type="button"
                      onClick={() => setActiveFacility(facility)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-slate-700 hover:bg-white shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F52BA]"
                      title="Detalii facilitate"
                      aria-label={`Detalii despre ${facility.name}`}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Conținut Card conform wireframe W2 */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-[#0F52BA] transition-colors">
                          {facility.name}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {subtitle}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#0F52BA]" />
                          {facility.openHour && facility.closeHour
                            ? `${facility.openHour} – ${facility.closeHour}`
                            : "08:00 – 22:00"}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#0F52BA]" />
                          Baza USV
                        </span>
                      </div>
                    </div>

                    {/* Rândul de jos: Tarif și Buton Rezervă */}
                    <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">Tarif</span>
                        <span className="text-sm sm:text-base font-extrabold text-foreground">
                          {priceLabel}
                        </span>
                      </div>

                      {isBlocked ? (
                        <Button
                          disabled
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs font-semibold border-rose-200 text-rose-600 bg-rose-50"
                        >
                          Cont blocat
                        </Button>
                      ) : isLimitReached ? (
                        <Button
                          disabled
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-xs font-semibold"
                        >
                          Limită atinsă (3/3)
                        </Button>
                      ) : (
                        <Button
                          asChild
                          size="sm"
                          className="rounded-xl bg-[#0F52BA] hover:bg-[#1E40AF] text-white font-semibold px-4 text-xs sm:text-sm shadow-xs transition-colors"
                        >
                          <Link to={`/rezerva/${facility.id}`}>
                            Rezervă
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* ───── Modal Detalii Facilitate ───── */}
      <Dialog open={Boolean(activeFacility)} onOpenChange={(open) => !open && setActiveFacility(null)}>
        {activeFacility && (
          <DialogContent className="max-w-md w-full rounded-3xl p-6 sm:p-7 bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/15">
            <DialogHeader className="text-left space-y-1.5 pb-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-50 text-[#0F52BA] border border-blue-100 font-bold text-xs uppercase px-2.5 py-0.5">
                  {activeFacility.sport}
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-2.5 py-0.5">
                  Disponibil
                </Badge>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {activeFacility.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#0F52BA] shrink-0" />
                <span>Baza Sportivă USV · {getFacilitySubtitle(activeFacility.sport, activeFacility.description)}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-1">
              {/* Fotografie facilitate */}
              <div className="aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs">
                <img
                  src={getSportImage(activeFacility.sport, activeFacility.type)}
                  alt={activeFacility.name}
                  className="h-full w-full object-cover"
                  decoding="async"
                />
              </div>

              {/* Detalii / Facilități */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-1 text-xs text-slate-600">
                <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-4 w-4 text-[#0F52BA]" />
                  <span>Dotări & Caracteristici</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed pl-1">
                  {activeFacility.description && activeFacility.description !== getFacilitySubtitle(activeFacility.sport, activeFacility.description)
                    ? activeFacility.description
                    : "Acces pe bază de programare · Vestiare cu dușuri · Nocturnă · Echipament disponibil la recepție."}
                </p>
              </div>

              {/* Grilă Program & Tarif */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5 text-[11px]">
                    <Clock className="h-3.5 w-3.5 text-[#0F52BA]" />
                    Program zilnic
                  </span>
                  <span className="font-bold text-slate-900 mt-1 block text-sm">
                    {activeFacility.openHour && activeFacility.closeHour
                      ? `${activeFacility.openHour} – ${activeFacility.closeHour}`
                      : "08:00 – 22:00"}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5 text-[11px]">
                    <CreditCard className="h-3.5 w-3.5 text-[#0F52BA]" />
                    Tarif orar
                  </span>
                  <span className="font-black text-[#0F52BA] mt-1 block text-sm">
                    {activeFacility.pricePerHour} lei / oră
                  </span>
                </div>
              </div>

              {/* Butoane de acțiune */}
              <div className="pt-2 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveFacility(null)}
                  className="flex-1 rounded-xl text-xs h-11 font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
                >
                  Închide
                </Button>
                <Button
                  asChild
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#0F52BA] to-[#1E40AF] hover:from-[#0d469e] hover:to-[#17328c] text-white text-xs h-11 font-bold shadow-md shadow-[#0F52BA]/25"
                >
                  <Link
                    to={`/rezerva/${activeFacility.id}`}
                    onClick={() => setActiveFacility(null)}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <span>Mergi la rezervare</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
