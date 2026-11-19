import type { Resource, AvailabilitySlot } from "@/api/types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { 
  Dumbbell, 
  Calendar, 
  Clock, 
  CreditCard, 
  Sparkles, 
  Loader2, 
  Info,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BookingVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  facility: Resource;
  selectedDate: Date;
  selectedSlot: AvailabilitySlot | null;
  totalPrice: number;
  isSubmitting?: boolean;
  studentReservationsCount?: number;
  maxMonthlyLimit?: number;
  errorMessage?: string | null;
}

export function BookingVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  facility,
  selectedDate,
  selectedSlot,
  totalPrice,
  isSubmitting = false,
  studentReservationsCount = 2,
  maxMonthlyLimit = 3,
  errorMessage = null,
}: BookingVerificationModalProps) {
  if (!selectedSlot) return null;

  const startStr = `${String(selectedSlot.startHour).padStart(2, "0")}:00`;
  const endStr = `${String(selectedSlot.endHour).padStart(2, "0")}:00`;
  const durationHours = selectedSlot.endHour - selectedSlot.startHour;
  const durationMin = durationHours * 60;

  const dateFormatted = format(selectedDate, "EEEE, d MMMM yyyy", { locale: ro });
  const nextCount = Math.min(maxMonthlyLimit, studentReservationsCount + 1);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md w-full rounded-3xl p-6 sm:p-7 border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/15 max-h-[92vh] overflow-y-auto">
        {/* Antet Modal conform stilului de confirmare */}
        <DialogHeader className="text-center sm:text-left space-y-1.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#0F52BA] to-[#1E40AF] text-white flex items-center justify-center shadow-md shadow-[#0F52BA]/25 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Verifică rezervarea
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium">
                Verifică detaliile selecției înainte de confirmarea finală.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Card Detalii Rezervare structurat ca în ecranul de confirmare W4 */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 space-y-3 shadow-2xs">
            {/* Rând Facilitate */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#0F52BA] flex items-center justify-center shrink-0 border border-blue-100">
                  <Dumbbell className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Facilitate sportivă
                  </span>
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {facility.name}
                  </h4>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold shrink-0">
                Disponibil
              </Badge>
            </div>

            {/* Grilă parametri: Data & Interval */}
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Calendar className="h-4 w-4 text-[#0F52BA]" />
                  Data programată
                </span>
                <span className="font-bold text-slate-900 capitalize text-right">
                  {dateFormatted}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-200/60">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock className="h-4 w-4 text-[#0F52BA]" />
                  Interval orar
                </span>
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>{startStr} – {endStr}</span>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/70 px-1.5 py-0.5 rounded-md font-mono">
                    {durationMin} min
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-200/60">
                <span className="flex items-center gap-2 text-slate-500 font-medium">
                  <CreditCard className="h-4 w-4 text-[#0F52BA]" />
                  Status plată
                </span>
                <span className="font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                  Neachitată · la recepție
                </span>
              </div>
            </div>

            {/* Sumar Total de achitat */}
            <div className="mt-2 pt-3 border-t border-slate-200/80 flex items-center justify-between bg-white -mx-4 -mb-4 p-4 rounded-b-2xl">
              <div>
                <span className="text-xs font-semibold text-slate-500 block">Total de achitat</span>
                <span className="text-[10px] text-slate-400">
                  {durationHours} {durationHours === 1 ? "oră" : "ore"} × {facility.pricePerHour} lei / oră
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#0F52BA] tracking-tight">
                  {totalPrice} lei
                </span>
              </div>
            </div>
          </div>

          {/* Indicator Limită lunară conform wireframe */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100/90 text-xs text-blue-950 space-y-2">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-blue-900">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Limita ta lunară de rezervări
              </span>
              <span className="font-mono text-xs font-black text-[#0F52BA]">
                {studentReservationsCount}/3 → {nextCount}/{maxMonthlyLimit}
              </span>
            </div>

            {/* Bară de progres */}
            <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0F52BA] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(nextCount / maxMonthlyLimit) * 100}%` }}
              />
            </div>

            <p className="text-[11px] text-blue-800/80 leading-relaxed">
              Aceasta va fi a {nextCount}-a rezervare din {maxMonthlyLimit} permise pentru studenți în luna curentă.
            </p>
          </div>

          {/* Reguli importante - De reținut */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
              <Info className="h-4 w-4 text-[#0F52BA]" />
              <span>De reținut înainte de confirmare</span>
            </div>
            <ul className="space-y-1 pl-1 text-slate-600 leading-relaxed">
              <li>• Plata se efectuează direct la <strong>recepție</strong>, înainte de accesul pe teren/bazin.</li>
              <li>• Anulare gratuită cu <strong>minim 2 ore înainte</strong> de ora de start.</li>
              <li>• Te rugăm să te prezinți la baza sportivă cu <strong>15 minute înainte</strong>.</li>
            </ul>
          </div>

          {/* Alertă de eroare dacă mutația eșuează */}
          {errorMessage && (
            <Alert variant="destructive" className="py-2.5 px-3 rounded-xl border-rose-200 bg-rose-50/90 text-rose-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Butoane de acțiune */}
          <div className="pt-2 space-y-2">
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0F52BA] to-[#1E40AF] hover:from-[#0d469e] hover:to-[#17328c] text-white font-bold text-sm shadow-md shadow-[#0F52BA]/25 hover:shadow-lg hover:shadow-[#0F52BA]/30 active:scale-[0.99] transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se înregistrează rezervarea...
                </>
              ) : (
                <>
                  Confirmă rezervarea
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              Înapoi la calendar
            </Button>
          </div>

          <p className="text-[10px] text-center text-slate-400 font-medium">
            Rezervarea se înregistrează oficial în sistem doar după confirmare.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BookingVerificationModal;
