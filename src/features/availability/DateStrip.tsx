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
              disabled={isBeyondLimit}
              onClick={() => onSelectDate(day)}
              className={cn(
                "flex min-w-[62px] sm:min-w-[70px] flex-col items-center justify-center rounded-2xl border p-2.5 transition-all duration-150 min-h-[66px] select-none touch-manipulation",
                isSelected
                  ? "border-[#0F52BA] bg-[#0F52BA] text-white shadow-md shadow-[#0F52BA]/25 font-bold scale-[1.03]"
                  : isBeyondLimit
                    ? "border-border/40 bg-slate-100 text-muted-foreground/40 cursor-not-allowed opacity-40"
                    : "border-border/80 bg-white text-foreground hover:border-[#0F52BA]/50 hover:bg-slate-50 cursor-pointer shadow-2xs"
              )}
              title={isBeyondLimit ? "Regulament USV: maxim 14 zile în avans" : undefined}
            >
              <span className={cn("text-[11px] font-medium capitalize", isSelected ? "text-blue-100" : "text-muted-foreground")}>
                {isToday ? "Azi" : format(day, "EEE", { locale: ro })}
              </span>
              <span className="text-lg sm:text-xl font-black leading-tight mt-0.5">
                {format(day, "d")}
              </span>
              <span className={cn("text-[10px] uppercase font-semibold", isSelected ? "text-blue-200" : "text-muted-foreground")}>
                {format(day, "MMM", { locale: ro })}
              </span>
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
          <span className="h-2.5 w-2.5 rounded-full bg-[#0F52BA] ring-2 ring-blue-100" />
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
