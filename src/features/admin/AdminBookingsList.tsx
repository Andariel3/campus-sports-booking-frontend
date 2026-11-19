import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Ban,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";
import { apiClient } from "@/api/client";
import type { Reservation, Resource, PaymentStatus } from "@/api/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AdminBookingsListProps {
  onOpenMaintenanceModal?: () => void;
  onOpenReportModal?: () => void;
}

export function AdminBookingsList({
  onOpenMaintenanceModal,
  onOpenReportModal,
}: AdminBookingsListProps) {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [selectedResourceId, setSelectedResourceId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Preluare facilități pentru filtrul din antet
  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => apiClient.resources.list(),
  });

  // Preluare rezervări
  const {
    data: allReservations = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<Reservation[]>({
    queryKey: ["adminReservations", selectedDate],
    queryFn: () => apiClient.reservations.list({ from: selectedDate, to: selectedDate }),
  });

  // Mutație marcare plată (Achitată / Neachitată)
  const setPaymentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: PaymentStatus }) => {
      return apiClient.reservations.setPayment(id, status);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminReservations"] });
      queryClient.invalidateQueries({ queryKey: ["myReservations"] });
      toast.success(
        variables.status === "ACHITATA"
          ? "Rezervarea a fost marcată ca achitată."
          : "Statusul plății a fost resetat la neachitat."
      );
    },
    onError: (err: Error) => {
      toast.error(err.message || "A apărut o eroare la actualizarea plății.");
    },
  });

  // Mutație marcare neprezentare
  const markNoShowMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.reservations.markNoShow(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReservations"] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("Neprezentarea a fost înregistrată. Contorizată în profilul studentului.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "A apărut o eroare la înregistrarea neprezentării.");
    },
  });

  // Mutație anulare rezervare (Admin)
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.reservations.cancel(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReservations"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      toast.success("Rezervarea a fost anulată.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "A apărut o eroare la anularea rezervării.");
    },
  });

  // Filtrare rezervări după facilitate și căutare nume
  const filteredReservations = useMemo(() => {
    return allReservations.filter((r) => {
      if (selectedResourceId !== "all" && String(r.resourceId) !== selectedResourceId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (r.userName || "").toLowerCase().includes(q);
        const matchesEmail = (r.userEmail || "").toLowerCase().includes(q);
        const matchesResource = (r.resourceName || "").toLowerCase().includes(q);
        const matchesId = String(r.id).includes(q);
        if (!matchesName && !matchesEmail && !matchesResource && !matchesId) return false;
      }
      return true;
    });
  }, [allReservations, selectedResourceId, searchQuery]);

  // KPI-uri zilnice conform wireframe W6
  const kpis = useMemo(() => {
    const totalDay = allReservations.length;
    const unpaid = allReservations.filter(
      (r) => r.paymentStatus === "NEACHITATA" && r.status !== "ANULATA"
    ).length;
    const noShow = allReservations.filter((r) => r.status === "NEPREZENTARE").length;
    const totalIncome = allReservations
      .filter((r) => r.paymentStatus === "ACHITATA")
      .reduce((acc, curr) => acc + (curr.amount || curr.totalPrice || 0), 0);

    return { totalDay, unpaid, noShow, totalIncome };
  }, [allReservations]);

  return (
    <div className="space-y-6">
      {/* ───── KPI-URI ZILNICE (Wireframe W6) ───── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Rezervări azi
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{kpis.totalDay}</span>
            <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              {filteredReservations.length} afișate
            </span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-amber-200/90 bg-amber-50/40 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block">
            Neachitate la recepție
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700">{kpis.unpaid}</span>
            <span className="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-full">
              De încasat
            </span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-rose-200/90 bg-rose-50/40 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800 block">
            Neprezentări
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-700">{kpis.noShow}</span>
            <span className="text-xs text-rose-700 font-semibold bg-rose-100 px-2 py-0.5 rounded-full">
              Penalizări
            </span>
          </div>
        </Card>

        <Card className="rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-4 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
            Încasări azi
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{kpis.totalIncome} lei</span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
              Achitate
            </span>
          </div>
        </Card>
      </div>

      {/* ───── BARA DE FILTRE ȘI ACȚIUNI RAPIDE ADMIN (Wireframe W6) ───── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        {/* Filtre: Dată & Facilitate & Căutare */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[#0F52BA]" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 w-40 text-xs rounded-xl font-medium border-slate-200"
            />
          </div>

          <div className="w-48">
            <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
              <SelectTrigger className="h-9 text-xs rounded-xl border-slate-200">
                <SelectValue placeholder="Toate facilitățile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate facilitățile</SelectItem>
                {resources.map((r) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-48">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Caută student sau cod..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-xs rounded-xl border-slate-200"
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-9 text-xs text-slate-600 rounded-xl"
            title="Reîmprospătează"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin text-[#0F52BA]" : ""}`} />
          </Button>
        </div>

        {/* Butoane acțiuni rapide Admin */}
        <div className="flex items-center gap-2">
          {onOpenMaintenanceModal && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenMaintenanceModal}
              className="h-9 text-xs font-semibold rounded-xl border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              <Ban className="h-3.5 w-3.5 mr-1 text-slate-600" />
              Blochează interval
            </Button>
          )}

          {onOpenReportModal && (
            <Button
              type="button"
              size="sm"
              onClick={onOpenReportModal}
              className="h-9 text-xs font-semibold rounded-xl bg-[#0F52BA] hover:bg-[#1E40AF] text-white shadow-xs"
            >
              <DollarSign className="h-3.5 w-3.5 mr-1" />
              Raport lunar
            </Button>
          )}
        </div>
      </div>

      {/* ───── LISTA REZERVĂRILOR ZILEI (Wireframe W6) ───── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Rezervările zilei:</span>
            <span className="text-[#0F52BA] capitalize font-extrabold">
              {format(new Date(selectedDate), "EEEE, d MMMM yyyy", { locale: ro })}
            </span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {filteredReservations.length} rezervări găsite
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
            <Loader2 className="h-6 w-6 animate-spin text-[#0F52BA] mx-auto mb-2" />
            <p className="text-xs text-slate-500">Se încarcă rezervările...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-2">
            <Calendar className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">Nicio rezervare în această zi</h4>
            <p className="text-xs text-slate-400">
              Nu există rezervări înregistrate conform filtrelor selectate.
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {filteredReservations.map((reservation) => {
              const startDate = new Date(reservation.start);
              const endDate = new Date(reservation.end);
              const timeFormatted = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;
              const isPaid = reservation.paymentStatus === "ACHITATA";
              const isCancelled = reservation.status === "ANULATA";
              const isNoShow = reservation.status === "NEPREZENTARE";

              return (
                <Card
                  key={reservation.id}
                  className={`rounded-2xl border bg-white p-4 shadow-2xs transition-all ${
                    isCancelled
                      ? "border-slate-200 opacity-60 bg-slate-50/50"
                      : isNoShow
                        ? "border-rose-200 bg-rose-50/30"
                        : "border-slate-200 hover:border-blue-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Informații Utilizator & Rezervare */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {reservation.userName || "Student USV"}
                        </span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] py-0 px-1.5 font-normal">
                          {reservation.userEmail || "student"}
                        </Badge>
                        <span className="text-[11px] font-mono text-slate-400">
                          #USV-{reservation.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Dumbbell className="h-3.5 w-3.5 text-[#0F52BA]" />
                          {reservation.resourceName || "Facilitate USV"}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {timeFormatted}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="font-bold text-[#0F52BA]">
                          {reservation.amount || reservation.totalPrice} lei
                        </span>
                      </div>
                    </div>

                    {/* Status Badge & Butoane de Acțiune Rapidă */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* Badge status */}
                      {isCancelled ? (
                        <Badge variant="outline" className="border-rose-200 text-rose-700 bg-rose-50 text-xs">
                          Anulată
                        </Badge>
                      ) : isNoShow ? (
                        <Badge variant="outline" className="border-rose-300 text-rose-900 bg-rose-100 text-xs font-bold">
                          <AlertCircle className="h-3 w-3 mr-1 text-rose-600" /> Neprezentare
                        </Badge>
                      ) : isPaid ? (
                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Achitată
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                          Neachitată
                        </Badge>
                      )}

                      {/* Acțiuni Admin */}
                      {!isCancelled && !isNoShow && (
                        <>
                          {/* Buton Marcare Achitat / Neachitat */}
                          <Button
                            type="button"
                            size="sm"
                            variant={isPaid ? "outline" : "default"}
                            disabled={setPaymentMutation.isPending}
                            onClick={() =>
                              setPaymentMutation.mutate({
                                id: reservation.id,
                                status: isPaid ? "NEACHITATA" : "ACHITATA",
                              })
                            }
                            className={`h-8 text-xs font-semibold rounded-xl ${
                              isPaid
                                ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                            }`}
                          >
                            {isPaid ? "Setează neachitat" : "Marchează achitat"}
                          </Button>

                          {/* Buton Neprezentare */}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={markNoShowMutation.isPending}
                            onClick={() => markNoShowMutation.mutate(reservation.id)}
                            className="h-8 text-xs font-semibold rounded-xl border-amber-300 text-amber-900 hover:bg-amber-50"
                          >
                            Neprezentare
                          </Button>

                          {/* Buton Anulare (Admin) */}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={cancelMutation.isPending}
                            onClick={() => cancelMutation.mutate(reservation.id)}
                            className="h-8 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                          >
                            Anulează
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBookingsList;
