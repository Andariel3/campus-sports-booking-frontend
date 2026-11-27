import type { AvailabilitySlot } from "@/api/types";
import { cn } from "@/lib/utils";
import { Check, Wrench, Ban, Clock, Sunrise, Sun, Moon, type LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlotGridProps {
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  isLoading?: boolean;
}

// Intervalele zilei sunt grupate pe momente, ca orarul să se citească mai ușor pe mobil
const PERIOADE: { id: string; label: string; icon: LucideIcon; from: number; to: number }[] = [
  { id: "dimineata", label: "Dimineață", icon: Sunrise, from: 0, to: 12 },
  { id: "dupa-amiaza", label: "După-amiază", icon: Sun, from: 12, to: 17 },
  { id: "seara", label: "Seară", icon: Moon, from: 17, to: 24 },
];

const formatOra = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

function esteSelectat(slot: AvailabilitySlot, selectedSlot: AvailabilitySlot | null) {
  return Boolean(
    selectedSlot &&
    selectedSlot.startHour === slot.startHour &&
    selectedSlot.endHour === slot.endHour
  );
}

interface SlotButtonProps {
  slot: AvailabilitySlot;
  isSelected: boolean;
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

function SlotButton({ slot, isSelected, onSelectSlot }: SlotButtonProps) {
  const isAvailable = slot.status === "liber";
  const isOccupied = slot.status === "ocupat";
  const isMaintenance = slot.status === "mentenanta";

  const interval = `${formatOra(slot.startHour)} – ${formatOra(slot.endHour)}`;
  const stare = isSelected
    ? "selectat"
    : isAvailable
      ? "liber"
      : isOccupied
        ? "ocupat"
        : "blocat pentru mentenanță";

  return (
    <button
      type="button"
      disabled={!isAvailable && !isSelected}
      onClick={() => onSelectSlot(slot)}
      aria-pressed={isSelected}
      aria-label={`${interval}, ${stare}`}
      className={cn(
        "relative flex min-h-[64px] select-none flex-col items-center justify-center rounded-2xl border p-3 transition-all duration-150 touch-manipulation",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary font-bold text-primary-foreground shadow-md shadow-primary/30 motion-safe:scale-[1.02]"
          : isAvailable
            ? "cursor-pointer border-emerald-300 bg-emerald-50/70 font-semibold text-emerald-800 shadow-2xs hover:border-emerald-500 hover:bg-emerald-100"
            : isOccupied
              ? "cursor-not-allowed border-rose-200 bg-rose-50 text-rose-700 opacity-75"
              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500 opacity-75"
      )}
      title={
        isOccupied
          ? "Interval ocupat"
          : isMaintenance
            ? "Interval blocat pentru mentenanță"
            : isSelected
              ? "Interval selectat"
              : "Interval liber pentru rezervare"
      }
    >
      <span className="text-xs font-bold tracking-tight sm:text-sm">{interval}</span>

      <span
        className={cn(
          "mt-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider",
          isSelected
            ? "text-primary-foreground/80"
            : isAvailable
              ? "text-emerald-700"
              : isOccupied
                ? "text-rose-600"
                : "text-slate-500"
        )}
      >
        {isSelected ? (
          <>
            <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
            Selectat
          </>
        ) : isAvailable ? (
          "Liber"
        ) : isOccupied ? (
          <>
            <Ban className="h-3 w-3" aria-hidden="true" />
            Ocupat
          </>
        ) : (
          <>
            <Wrench className="h-3 w-3" aria-hidden="true" />
            Mentenanță
          </>
        )}
      </span>
    </button>
  );
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-slate-50 p-8 text-center">
        <Clock
          className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-50"
          aria-hidden="true"
        />
        <p className="text-xs font-semibold text-foreground sm:text-sm">
          Nu sunt intervale disponibile pentru această dată.
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Te rugăm să alegi o altă zi din calendar.
        </p>
      </div>
    );
  }

  const totalLibere = slots.filter((s) => s.status === "liber").length;

  return (
    <div className="space-y-5">
      <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
        {totalLibere === 0 ? (
          "Toate intervalele din această zi sunt ocupate."
        ) : (
          <>
            <span className="font-bold text-emerald-700">{totalLibere}</span>
            {totalLibere === 1 ? " interval liber" : " intervale libere"} din {slots.length}
          </>
        )}
      </p>

      {PERIOADE.map((perioada) => {
        const sloturi = slots.filter(
          (s) => s.startHour >= perioada.from && s.startHour < perioada.to
        );
        if (sloturi.length === 0) return null;

        const libere = sloturi.filter((s) => s.status === "liber").length;
        const Icon = perioada.icon;
        const headingId = `perioada-${perioada.id}`;

        return (
          <section key={perioada.id} aria-labelledby={headingId} className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3
                id={headingId}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                {perioada.label}
              </h3>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  libere > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                )}
              >
                {libere > 0 ? `${libere} libere` : "complet"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {sloturi.map((slot) => (
                <SlotButton
                  key={`${slot.startHour}-${slot.endHour}`}
                  slot={slot}
                  isSelected={esteSelectat(slot, selectedSlot)}
                  onSelectSlot={onSelectSlot}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default TimeSlotGrid;
