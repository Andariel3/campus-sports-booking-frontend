import { useState } from "react";
import type { Reservation } from "@/api/types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { AlertCircle, Calendar, Clock, Dumbbell, Loader2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CancelReservationModalProps {
  reservation: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reservationId: number) => Promise<void>;
}

export function CancelReservationModal({
  reservation,
  isOpen,
  onClose,
  onConfirm,
}: CancelReservationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!reservation) return null;

  const startDate = new Date(reservation.start);
  const endDate = new Date(reservation.end);
  const dateFormatted = format(startDate, "EEEE, d MMMM yyyy", { locale: ro });
  const timeFormatted = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;

  // Verificare dacă se află la mai puțin de 2 ore de start
  const now = new Date();
  const diffHours = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const canCancel = diffHours >= 2;

  const handleCancel = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(reservation.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "A apărut o eroare la anularea rezervării.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-xl">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
            Anulezi rezervarea?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Confirmă anularea pentru intervalul selectat. Intervalul va fi eliberat pentru ceilalți studenți.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {error && (
            <Alert variant="destructive" className="py-2.5 px-3 rounded-xl border-rose-200 bg-rose-50/90 text-rose-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Card sumar rezervare */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Dumbbell className="h-4 w-4 text-[#0F52BA]" />
              <span>{reservation.resourceName || reservation.resource?.name || "Facilitate USV"}</span>
              <span className="text-xs font-mono font-medium text-slate-400 ml-auto">
                #USV-{reservation.id}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-[#0F52BA]" />
                  Data:
                </span>
                <span className="font-semibold text-slate-800 capitalize">{dateFormatted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="h-3.5 w-3.5 text-[#0F52BA]" />
                  Interval:
                </span>
                <span className="font-semibold text-slate-800">{timeFormatted}</span>
              </div>
            </div>
          </div>

          {/* Notă informativă despre regula celor 2 ore */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <p className="font-semibold flex items-center gap-1 text-amber-950">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
              Regulă anulare:
            </p>
            <p className="leading-relaxed">
              Anularea este gratuită dacă se face cu <strong>minim 2 ore înainte</strong> de ora de start.
              {!canCancel && (
                <span className="block font-bold text-rose-700 mt-1">
                  Atenție: Au rămas mai puțin de 2 ore până la începere! Doar administratorul mai poate anula acest slot.
                </span>
              )}
            </p>
          </div>

          {/* Butoane de acțiune */}
          <div className="pt-2 space-y-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancel}
              disabled={isSubmitting || !canCancel}
              className="w-full h-11 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-sm shadow-md shadow-rose-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se anulează rezervarea...
                </>
              ) : (
                "Confirmă anularea"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full h-10 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Păstrează rezervarea
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CancelReservationModal;
