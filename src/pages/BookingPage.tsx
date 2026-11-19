import { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { apiClient } from "@/api/client";
import { useAuth } from "@/features/auth/useAuth";
import type { Resource, AvailabilitySlot } from "@/api/types";
import { getSportImage } from "@/lib/sportImages";
import { DateStrip } from "@/features/availability/DateStrip";
import { TimeSlotGrid } from "@/features/availability/TimeSlotGrid";
import { useAvailability } from "@/features/availability/useAvailability";
import { 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingPage() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isBlocked } = useAuth();

  // Data selectată (implicit azi)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  // Slotul orar selectat de utilizator
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Preluare resurse pentru găsirea facilității curente sau prima disponibilă
  const { data: resources = [], isLoading: isLoadingResources } = useQuery<Resource[]>({
    queryKey: ["resources"],
    queryFn: () => apiClient.resources.list(),
  });

  const parsedId = resourceId ? parseInt(resourceId, 10) : undefined;
  const facility = useMemo(() => {
    if (parsedId) {
      return resources.find((r) => r.id === parsedId) || null;
    }
    return resources[0] || null;
  }, [resources, parsedId]);

  const targetResourceId = facility?.id ?? parsedId ?? 1;

  // Preluare disponibilitate orar prin hook-ul dedicat cu polling scurt și SSE/BroadcastChannel
  const { data: slots = [], isLoading: isLoadingSlots, isFetching: isFetchingSlots, refetch: refetchSlots } = useAvailability({
    resourceId: targetResourceId,
    dateStr,
    enabled: Boolean(targetResourceId),
  });

  // Calcul rezervări curente pentru student
  const { data: myReservations = [] } = useQuery({
    queryKey: ["myReservations"],
    queryFn: () => apiClient.reservations.list(),
    enabled: Boolean(user),
  });

  const studentReservationsCount = user
    ? myReservations.filter((r) => r.status === "ACTIVA" || r.status === "FINALIZATA").length
    : 2;
  const maxMonthlyLimit = 3;
  const isLimitReached = isStudent && studentReservationsCount >= maxMonthlyLimit;

  // Calcul total de plată
  const durationHours = selectedSlot ? selectedSlot.endHour - selectedSlot.startHour : 1;
  const totalPrice = facility ? (facility.pricePerHour || 40) * durationHours : 40;

  const nextReservationIndex = Math.min(maxMonthlyLimit, studentReservationsCount + 1);

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    if (
      selectedSlot &&
      selectedSlot.startHour === slot.startHour &&
      selectedSlot.endHour === slot.endHour
    ) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleProceedToConfirmation = () => {
    if (!selectedSlot || !facility) return;
    // Navigare către pasul de confirmare sau declanșare modal
    const startStr = `${dateStr}T${String(selectedSlot.startHour).padStart(2, "0")}:00:00`;
    const endStr = `${dateStr}T${String(selectedSlot.endHour).padStart(2, "0")}:00:00`;
    
    // Stocăm temporar selecția pentru fluxul de creare
    sessionStorage.setItem(
      "usv_pending_booking",
      JSON.stringify({
        facility,
        selectedDate: dateStr,
        slot: selectedSlot,
        startStr,
        endStr,
        totalPrice,
      })
    );

    // Navigare sau declanșare modal în IP-44
    navigate(`/rezerva/${facility.id}/confirmare`, {
      state: {
        facility,
        selectedDate: dateStr,
        slot: selectedSlot,
        startStr,
        endStr,
        totalPrice,
      },
    });
  };

  if (isLoadingResources) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">Facilitatea nu a fost găsită</h2>
        <p className="text-sm text-muted-foreground">
          Nu am putut identifica terenul sau bazinul solicitat.
        </p>
        <Button asChild className="rounded-xl bg-[#0F52BA]">
          <Link to="/">Înapoi la facilități</Link>
        </Button>
      </div>
    );
  }

  const image = getSportImage(facility.sport, facility.type);

  return (
    <div className="w-full bg-[#F8FAFC] pb-12">
      {/* ───── Antet Navigare Înapoi conform Wireframe W3 ───── */}
      <div className="bg-white border-b border-border/80 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-[#0F52BA] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Înapoi</span>
          </Link>
          <span className="text-sm font-bold text-foreground">
            {facility.name}
          </span>
          <Badge variant="secondary" className="bg-blue-50 text-[#0F52BA] font-bold text-xs uppercase">
            {facility.sport}
          </Badge>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Banner Facilitate */}
        <Card className="rounded-2xl overflow-hidden border border-border/80 bg-white shadow-xs">
          <div className="relative h-44 sm:h-52 w-full overflow-hidden">
            <img
              src={image}
              alt={facility.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  Baza Sportivă USV
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{facility.name}</h1>
                <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                  {facility.openHour && facility.closeHour
                    ? `${facility.openHour} – ${facility.closeHour}`
                    : "08:00 – 20:00"}{" "}
                  · {facility.pricePerHour} lei / oră
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs self-start sm:self-auto">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Disponibil
              </span>
            </div>
          </div>
        </Card>

        {/* Notificare cont blocat sau limită atinsă */}
        {isBlocked && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Contul tău este restricționat</p>
              <p className="mt-0.5">
                Nu poți rezerva un nou interval deoarece ai acumulat neprezentări în această lună.
              </p>
            </div>
          </div>
        )}

        {isLimitReached && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Limită lunară atinsă (3 / 3)</p>
              <p className="mt-0.5">
                Conform regulamentului USV, fiecare student are alocate maxim 3 rezervări pe lună calendaristică.
              </p>
            </div>
          </div>
        )}

        {/* ───── Secțiunea Alege Ziua conform Wireframe W3 ───── */}
        <Card className="rounded-2xl border border-border/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Alege ziua
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mt-0.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground capitalize">
                {format(selectedDate, "EEEE, d MMMM yyyy", { locale: ro })}
              </h2>
              <span className="text-xs text-muted-foreground font-medium">
                {facility.openHour || "08:00"} – {facility.closeHour || "20:00"} · {facility.pricePerHour} lei / oră
              </span>
            </div>
          </div>

          <DateStrip
            selectedDate={selectedDate}
            onSelectDate={(newDate) => {
              setSelectedDate(newDate);
              setSelectedSlot(null); // Resetează intervalul când se schimbă ziua
            }}
          />
        </Card>

        {/* ───── Secțiunea Grila de Intervale Orare ───── */}
        <Card className="rounded-2xl border border-border/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">Intervale orare</h3>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold">Live</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchSlots()}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  title="Actualizează acum orarul"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isFetchingSlots ? "animate-spin text-[#0F52BA]" : ""}`} />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Selectează un interval liber pentru a continua cu rezervarea. Orarul se actualizează automat fără refresh.
            </p>
          </div>

          <TimeSlotGrid
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            isLoading={isLoadingSlots}
          />
        </Card>

        {/* ───── Panoul Sumar Rezervare conform Wireframe W3 ───── */}
        <Card className="rounded-2xl border border-border/80 bg-white p-5 sm:p-6 shadow-xs">
          <CardContent className="p-0 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Interval selectat</span>
                <p className="text-sm sm:text-base font-bold text-foreground mt-0.5">
                  {selectedSlot
                    ? `${format(selectedDate, "EEE d MMM", { locale: ro })} · ${String(selectedSlot.startHour).padStart(2, "0")}:00 – ${String(selectedSlot.endHour).padStart(2, "0")}:00`
                    : "Alege un interval orar liber din grila de mai sus"}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-muted-foreground block font-medium">Total (plata la recepție)</span>
                <span className="text-xl sm:text-2xl font-black text-[#0F52BA]">
                  {selectedSlot ? `${totalPrice} lei` : "—"}
                </span>
              </div>
            </div>

            {/* Mesaj informativ regulament limită conform wireframe W3 */}
            {isStudent && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span>
                  Aceasta va fi a {nextReservationIndex}-a rezervare din 3 pentru luna aceasta.
                </span>
              </p>
            )}

            {/* Buton confirmare */}
            <Button
              onClick={handleProceedToConfirmation}
              disabled={!selectedSlot || isLimitReached || isBlocked}
              className="w-full h-12 rounded-xl bg-[#0F52BA] hover:bg-[#1E40AF] text-white font-bold text-sm shadow-md shadow-[#0F52BA]/20 transition-all disabled:opacity-50"
            >
              Confirmă rezervarea
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BookingPage;
