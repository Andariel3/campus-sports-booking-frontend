import type { AvailabilitySlot } from "@/api/types";
import { cn } from "@/lib/utils";
import { Check, Wrench, Ban, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TimeSlotGridProps {
  slots: AvailabilitySlot[];
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  isLoading?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}: TimeSlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-50 border border-border">
        <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-xs sm:text-sm font-semibold text-foreground">
          Nu sunt intervale disponibile pentru această dată.
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Te rugăm să alegi o altă zi din calendar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {slots.map((slot) => {
        const isSelected =
          selectedSlot &&
          selectedSlot.startHour === slot.startHour &&
          selectedSlot.endHour === slot.endHour;

        const isAvailable = slot.status === "liber";
        const isOccupied = slot.status === "ocupat";
        const isMaintenance = slot.status === "mentenanta";

        const startStr = `${String(slot.startHour).padStart(2, "0")}:00`;
        const endStr = `${String(slot.endHour).padStart(2, "0")}:00`;

        return (
          <button
            key={`${slot.startHour}-${slot.endHour}`}
            type="button"
            disabled={!isAvailable && !isSelected}
            onClick={() => {
              if (isAvailable || isSelected) {
                onSelectSlot(slot);
              }
            }}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-150 min-h-[64px] touch-manipulation select-none relative",
              // Selectat (albastru închis conform regulilor)
              isSelected
                ? "border-[#0F52BA] bg-[#0F52BA] text-white shadow-md shadow-[#0F52BA]/30 font-bold scale-[1.02] ring-2 ring-[#0F52BA]/20"
                : // Liber (verde)
                isAvailable
                  ? "border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer shadow-2xs font-semibold"
                  : // Ocupat (roșu/roz pal)
                  isOccupied
                    ? "border-rose-200 bg-rose-50 text-rose-700 opacity-75 cursor-not-allowed"
                    : // Mentenanță (gri)
                    "border-slate-200 bg-slate-100 text-slate-500 opacity-75 cursor-not-allowed"
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
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              {startStr} – {endStr}
            </span>

            <span
              className={cn(
                "text-[10px] uppercase font-semibold tracking-wider mt-0.5 flex items-center gap-1",
                isSelected
                  ? "text-blue-100"
                  : isAvailable
                    ? "text-emerald-700"
                    : isOccupied
                      ? "text-rose-600"
                      : "text-slate-500"
              )}
            >
              {isSelected ? (
                <>
                  <Check className="h-3 w-3 stroke-[3]" />
                  Selectat
                </>
              ) : isAvailable ? (
                "Liber"
              ) : isOccupied ? (
                <>
                  <Ban className="h-3 w-3" />
                  Ocupat
                </>
              ) : (
                <>
                  <Wrench className="h-3 w-3" />
                  Mentenanță
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default TimeSlotGrid;
