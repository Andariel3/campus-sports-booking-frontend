import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  Dumbbell, 
  AlertCircle, 
  CheckCircle2, 
  CalendarX, 
  Plus, 
  RefreshCw, 
  ArrowRight,
  CreditCard,
  Ban
} from "lucide-react";
import { apiClient } from "@/api/client";
import type { Reservation } from "@/api/types";
import { useAuth } from "@/features/auth/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CancelReservationModal } from "./CancelReservationModal";
import { MonthlyLimitCard } from "./MonthlyLimitCard";

export function MyReservationsView() {
  const { user, isStudent } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const [cancelingReservation, setCancelingReservation] = useState<Reservation | null>(null);

  // Preluare rezervări ale utilizatorului logat
  const {
    data: reservations = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["myReservations"],
    queryFn: () => apiClient.reservations.list(),
    enabled: Boolean(user),
  });

  // Mutație anulare rezervare
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.reservations.cancel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReservations"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Rezervarea a fost anulată cu succes.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "A apărut o eroare la anularea rezervării.");
    },
  });

  // Separare rezervări în Viitoare și Istoric
  const { upcoming, history } = useMemo(() => {
    const now = new Date();
    const up: Reservation[] = [];
    const hist: Reservation[] = [];

    reservations.forEach((r) => {
      const end = new Date(r.end);
      const isPast = end.getTime() <= now.getTime();

      if (r.status === "ACTIVA" && !isPast) {
        up.push(r);
      } else {
        hist.push(r);
      }
    });

    // Sortare: cele mai apropiate primele pentru viitoare, cele mai recente primele pentru istoric
    up.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    hist.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());

    return { upcoming: up, history: hist };
  }, [reservations]);

  const activeReservationsCount = upcoming.length;
  const maxLimit = 3;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Pagina & Buton Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Rezervările mele
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestionează rezervările viitoare și consultă istoricul activității tale.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="rounded-xl text-xs h-9 border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefetching ? "animate-spin text-[#0F52BA]" : ""}`} />
            Reîmprospătează
          </Button>

          <Button
            asChild
            size="sm"
            className="rounded-xl text-xs h-9 bg-[#0F52BA] hover:bg-[#1E40AF] text-white shadow-sm"
          >
            <Link to="/facilitati">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Rezervă teren
            </Link>
          </Button>
        </div>
      </div>

      {/* Indicator Limită Lunar Student conform Wireframe W5 */}
      {isStudent && (
        <MonthlyLimitCard
          usedCount={activeReservationsCount}
          maxLimit={maxLimit}
          variant="compact"
          showNextPreview={false}
        />
      )}

      {/* Tabs Filtrare: Viitoare vs Istoric */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/80 max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "upcoming"
              ? "bg-white text-[#0F52BA] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Viitoare</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] ${
            activeTab === "upcoming"
              ? "bg-blue-100/70 text-[#0F52BA]"
              : "bg-slate-200 text-slate-600"
          }`}>
            {upcoming.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "history"
              ? "bg-white text-[#0F52BA] shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>Istoric</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] ${
            activeTab === "history"
              ? "bg-blue-100/70 text-[#0F52BA]"
              : "bg-slate-200 text-slate-600"
          }`}>
            {history.length}
          </span>
        </button>
      </div>

      {/* ───── TAB 1: REZERVĂRI VIITOARE ───── */}
      {activeTab === "upcoming" && (
        <div className="space-y-4">
          {upcoming.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-4 shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0F52BA]">
                <Calendar className="h-7 w-7" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-900">Nu ai nicio rezervare viitoare</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Explorează terenurile de fotbal, tenis sau bazinul de înot și alege intervalul dorit.
                </p>
              </div>
              <Button asChild className="rounded-xl bg-[#0F52BA] hover:bg-[#1E40AF] text-white font-semibold text-xs h-10 px-5 shadow-sm">
                <Link to="/facilitati">
                  Explorează facilitățile
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((reservation) => {
                const startDate = new Date(reservation.start);
                const endDate = new Date(reservation.end);
                const dateFormatted = format(startDate, "EEEE, d MMMM yyyy", { locale: ro });
                const timeFormatted = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;

                // Calcul oră limită de anulare (cu 2 ore înainte)
                const cancelDeadline = new Date(startDate.getTime() - 2 * 60 * 60 * 1000);
                const now = new Date();
                const canCancel = now.getTime() < cancelDeadline.getTime();

                const isPaid = reservation.paymentStatus === "ACHITATA";

                return (
                  <Card
                    key={reservation.id}
                    className="rounded-2xl border border-slate-200/90 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <CardContent className="p-5 space-y-4">
                      {/* Top: Nume facilitate & status plată */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F52BA]">
                            {reservation.resource?.sport || "Sport"}
                          </span>
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                            <Dumbbell className="h-4 w-4 text-[#0F52BA]" />
                            {reservation.resource?.name || "Teren Baza USV"}
                          </h3>
                        </div>

                        {/* Badge semantic plată */}
                        {isPaid ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-50">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Achitată
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-50">
                            Neachitată
                          </Badge>
                        )}
                      </div>

                      {/* Detalii Data & Oră */}
                      <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <Calendar className="h-3.5 w-3.5 text-[#0F52BA]" />
                            Data:
                          </span>
                          <span className="font-semibold text-slate-800 capitalize">{dateFormatted}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <Clock className="h-3.5 w-3.5 text-[#0F52BA]" />
                            Interval:
                          </span>
                          <span className="font-bold text-slate-900">{timeFormatted}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                          <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                            <CreditCard className="h-3.5 w-3.5 text-[#0F52BA]" />
                            Tarif:
                          </span>
                          <span className="font-bold text-[#0F52BA] text-sm">
                            {reservation.amount} lei
                          </span>
                        </div>
                      </div>

                      {/* Cod rezervare & Info anulare */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono font-medium">#USV-{reservation.id}</span>
                        {canCancel ? (
                          <span className="text-emerald-700 font-medium">
                            Anulare posibilă până la {format(cancelDeadline, "HH:mm")}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-medium">
                            Anularea nu mai este posibilă (&lt; 2h)
                          </span>
                        )}
                      </div>

                      {/* Buton anulare */}
                      <div className="pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setCancelingReservation(reservation)}
                          disabled={!canCancel}
                          className="w-full rounded-xl text-xs h-9 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 disabled:opacity-40"
                        >
                          <Ban className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
                          Anulează rezervarea
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───── TAB 2: ISTORIC RECENT ───── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <Card className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3 shadow-xs">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CalendarX className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Nu există rezervări în istoricul recent</h3>
              <p className="text-xs text-slate-400">
                Toate rezervările finalizate sau anulate vor apărea aici.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((reservation) => {
                const startDate = new Date(reservation.start);
                const endDate = new Date(reservation.end);
                const dateFormatted = format(startDate, "EEE, d MMM yyyy", { locale: ro });
                const timeFormatted = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;

                // Statusuri istorice semantice
                const isCancelled = reservation.status === "ANULATA";
                const isNoShow = reservation.status === "NEPREZENTARE";
                const isCompleted = reservation.status === "FINALIZATA" || (!isCancelled && !isNoShow);

                return (
                  <Card
                    key={reservation.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isCancelled
                            ? "bg-rose-50 text-rose-600"
                            : isNoShow
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-700"
                        }`}>
                          <Dumbbell className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {reservation.resource?.name || "Teren Baza USV"}
                          </h4>
                          <p className="text-xs text-slate-500 capitalize">
                            {dateFormatted} · {timeFormatted}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <span className="text-xs font-mono font-medium text-slate-400">
                          #USV-{reservation.id}
                        </span>

                        {isCancelled && (
                          <Badge variant="outline" className="border-rose-200 bg-rose-50/70 text-rose-700 text-xs">
                            Anulată
                          </Badge>
                        )}

                        {isNoShow && (
                          <Badge variant="outline" className="border-rose-300 bg-rose-100 text-rose-900 text-xs font-bold">
                            <AlertCircle className="h-3 w-3 mr-1" /> Neprezentare
                          </Badge>
                        )}

                        {isCompleted && (
                          <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700 text-xs">
                            Finalizată · {reservation.paymentStatus === "ACHITATA" ? "Achitată" : "La recepție"}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Confirmare Anulare */}
      <CancelReservationModal
        reservation={cancelingReservation}
        isOpen={Boolean(cancelingReservation)}
        onClose={() => setCancelingReservation(null)}
        onConfirm={async (id) => {
          await cancelMutation.mutateAsync(id);
        }}
      />
    </div>
  );
}

export default MyReservationsView;
