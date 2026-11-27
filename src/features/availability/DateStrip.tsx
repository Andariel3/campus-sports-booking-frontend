import { addDays, format, isSameDay } from "date-fns";
import { ro } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  maxDays?: number; // max 14 zile conform regulamentului USV
}

export function DateStrip({ selectedDate, onSelectDate, maxDays = 14 }: DateStripProps) {
  const today = new Date();
  const days = Array.from({ length: 15 }, (_, i) => addDays(today, i));

  return (
    <div className="space-y-3">
      {/* Selectorul orizontal de zile conform Wireframe W3 */}
      <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none scroll-smooth">
        {days.map((day, index) => {
          const isSelected = isSameDay(day, selectedDate);
          const isBeyondLimit = index > maxDays;
          const isToday = index === 0;

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isBeyondLimit}
              onClick={() => onSelectDate(day)}
              aria-pressed={isSelected}
              aria-label={`${isToday ? "Azi, " : ""}${format(day, "EEEE d MMMM", { locale: ro })}`}
              className={cn(
                "relative flex min-h-[66px] min-w-[62px] select-none flex-col items-center justify-center rounded-2xl border p-2.5 transition-all duration-150 touch-manipulation sm:min-w-[70px]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary font-bold text-primary-foreground shadow-md shadow-primary/25 motion-safe:scale-[1.03]"
                  : isBeyondLimit
                    ? "cursor-not-allowed border-border/40 bg-slate-100 text-muted-foreground/40 opacity-40"
                    : isToday
                      ? "cursor-pointer border-primary/40 bg-white text-foreground shadow-2xs hover:border-primary hover:bg-slate-50"
                      : "cursor-pointer border-border/80 bg-white text-foreground shadow-2xs hover:border-primary/50 hover:bg-slate-50"
              )}
              title={isBeyondLimit ? "Regulament USV: maxim 14 zile în avans" : undefined}
            >
              <span
                className={cn(
                  "text-[11px] font-medium capitalize",
                  isSelected
                    ? "text-primary-foreground/80"
                    : isToday
                      ? "font-bold text-primary"
                      : "text-muted-foreground"
                )}
              >
                {isToday ? "Azi" : format(day, "EEE", { locale: ro })}
              </span>
              <span className="mt-0.5 text-lg font-black leading-tight sm:text-xl">
                {format(day, "d")}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase",
                  isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                )}
              >
                {format(day, "MMM", { locale: ro })}
              </span>
              {isToday && !isSelected && (
                <span
                  className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legendă statusuri sloturi conform prototipului W3 */}
      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          <span className="text-[11px] font-medium">Liber</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-blue-100" />
          <span className="text-[11px] font-medium">Selectat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400 ring-2 ring-rose-100" />
          <span className="text-[11px] font-medium">Ocupat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-300 ring-2 ring-slate-100" />
          <span className="text-[11px] font-medium">Mentenanță</span>
        </div>
      </div>
    </div>
  );
}

export default DateStrip;
