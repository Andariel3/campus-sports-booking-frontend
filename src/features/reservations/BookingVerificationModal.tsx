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
  AlertCircle 
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
      <DialogContent className="max-w-md w-full rounded-3xl p-5 sm:p-6 border border-border shadow-xl">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Verifică rezervarea
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Verifică selecția înainte de confirmarea finală.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Card facilitate conform wireframe W3/W4 modal */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="h-11 w-11 rounded-xl bg-[#0F52BA]/10 text-[#0F52BA] flex items-center justify-center shrink-0">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-foreground truncate">{facility.name}</h4>
              <p className="text-xs text-muted-foreground truncate">
                Baza sportivă USV · {facility.sport}
              </p>
            </div>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-xs shrink-0">
              Disponibil
            </Badge>
          </div>

          {/* Tabel detalii dată & interval */}
          <div className="divide-y divide-border/60 text-xs sm:text-sm">
            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4 text-[#0F52BA]" />
                Data
              </span>
              <span className="font-bold text-foreground capitalize">{dateFormatted}</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Clock className="h-4 w-4 text-[#0F52BA]" />
                Interval
              </span>
              <span className="font-bold text-foreground">
                {startStr} – {endStr} · {durationMin} min
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <CreditCard className="h-4 w-4 text-[#0F52BA]" />
                Total de achitat
              </span>
              <div className="text-right">
                <span className="text-base sm:text-lg font-black text-[#0F52BA]">
                  {totalPrice} lei
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {durationHours} {durationHours === 1 ? "oră" : "ore"} × {facility.pricePerHour} lei / oră
                </span>
              </div>
            </div>
          </div>

          {/* Indicator Limită lunară conform wireframe */}
          <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-1">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Limita ta lunară
              </span>
              <span>
                {studentReservationsCount} / {maxMonthlyLimit} → {nextCount} / {maxMonthlyLimit}
              </span>
            </div>
            <p className="text-[11px] text-blue-800/80 leading-relaxed">
              Aceasta va fi a {nextCount}-a rezervare din {maxMonthlyLimit} pentru luna aceasta.
            </p>
          </div>

          {/* Reguli importante */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-[#0F52BA]" />
              Plata la recepție, înainte de acces.
            </p>
            <p>• Anulare gratuită cu minim 2 ore înainte de ora de începere.</p>
            <p>• Te rugăm să te prezinți la bază cu 15 minute înainte.</p>
          </div>

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
              className="w-full h-11 rounded-xl bg-[#0F52BA] hover:bg-[#1E40AF] text-white font-bold text-sm shadow-md shadow-[#0F52BA]/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se înregistrează rezervarea...
                </>
              ) : (
                "Confirmă rezervarea"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl text-xs font-semibold"
            >
              Înapoi la calendar
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground">
            Rezervarea se înregistrează doar după confirmare.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BookingVerificationModal;
