import { Info, AlertCircle, ShieldAlert, CheckCircle2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MonthlyLimitCardProps {
  usedCount: number;
  maxLimit?: number;
  noShowCount?: number;
  isBlocked?: boolean;
  variant?: "compact" | "detailed" | "banner";
  className?: string;
  showNextPreview?: boolean;
}

export function MonthlyLimitCard({
  usedCount,
  maxLimit = 3,
  noShowCount = 0,
  isBlocked = false,
  variant = "detailed",
  className,
  showNextPreview = false,
}: MonthlyLimitCardProps) {
  const percentage = Math.min(100, Math.round((usedCount / maxLimit) * 100));
  const remaining = Math.max(0, maxLimit - usedCount);
  const isFull = usedCount >= maxLimit;
  const nextCount = Math.min(maxLimit, usedCount + 1);

  // Culoare dinamică pentru bara de progres în funcție de numărul de rezervări folosite
  const progressColor = isBlocked
    ? "bg-rose-500"
    : isFull
      ? "bg-amber-500"
      : usedCount === 2
        ? "bg-[#0F52BA]"
        : "bg-emerald-500";

  // Stare pentru cont blocat
  if (isBlocked) {
    return (
      <div
        className={cn(
          "p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm space-y-2 shadow-xs",
          className
        )}
      >
        <div className="flex items-center justify-between font-bold">
          <span className="flex items-center gap-1.5 text-rose-700">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Cont restricționat
          </span>
          <Badge variant="destructive" className="text-[10px] uppercase font-bold">
            Blocat
          </Badge>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Ai acumulat 2 neprezentări în această lună. Contul este blocat pentru rezervări noi până la începutul lunii următoare sau până la deblocarea de către administrator.
        </p>
      </div>
    );
  }

  // Variantă compactă (pentru sumare laterale sau carduri de confirmare)
  if (variant === "compact") {
    return (
      <div className={cn("p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1.5", className)}>
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Limita ta lunară
          </span>
          <span className="text-[#0F52BA] font-black">
            {showNextPreview ? `${usedCount} / ${maxLimit} → ${nextCount} / ${maxLimit}` : `${usedCount} / ${maxLimit}`}
          </span>
        </div>
        <div className="relative w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={cn("h-full transition-all duration-300 rounded-full", progressColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {showNextPreview
            ? `Aceasta va fi a ${nextCount}-a rezervare din ${maxLimit} pentru luna aceasta.`
            : remaining > 0
              ? `Mai ai ${remaining} ${remaining === 1 ? "rezervare disponibilă" : "rezervări disponibile"} luna aceasta.`
              : "Ai atins limita de 3 rezervări în această lună."}
        </p>
      </div>
    );
  }

  // Variantă completă / detaliată conform Wireframe W2 și specificației
  return (
    <Card className={cn("rounded-2xl border border-slate-200/80 bg-slate-50/80 shadow-xs", className)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">Limita ta lunară</span>
            <Badge variant="secondary" className="bg-blue-50 text-[#0F52BA] text-[10px] font-semibold px-2">
              Student
            </Badge>
          </div>
          <span className="text-sm font-black text-[#0F52BA]">
            {usedCount} / {maxLimit}
          </span>
        </div>

        {/* Bară de progres customizată cu culori semantice */}
        <div className="space-y-1">
          <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-500 rounded-full", progressColor)}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium pt-0.5">
            <span>0 rezervări</span>
            <span>Max. 3 / lună</span>
          </div>
        </div>

        {/* Mesaj informativ & reguli */}
        <div className="pt-2 border-t border-slate-200/60 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            {remaining > 0 ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>
                  Mai ai {remaining} {remaining === 1 ? "rezervare disponibilă" : "rezervări disponibile"} luna aceasta.
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-amber-800 font-semibold">
                  Ai atins limita maximă de 3 rezervări pentru luna în curs.
                </span>
              </>
            )}
          </div>

          {/* Indicator neprezentări dacă există (penalizări) */}
          {noShowCount > 0 && (
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/70 text-[11px] text-amber-800 flex items-start gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Ai {noShowCount} {noShowCount === 1 ? "neprezentare înregistrată" : "neprezentări înregistrate"}. Atenție: la 2 neprezentări contul se blochează automat.
              </span>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Regulament USV: max. 3 rezervări active/lună per student. Anulare gratuită cu minim 2 ore înainte.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthlyLimitCard;
