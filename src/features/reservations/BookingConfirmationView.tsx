import { Link } from "react-router-dom";
import type { Resource, Reservation, AvailabilitySlot } from "@/api/types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { Check, Info, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BookingConfirmationViewProps {
  reservation: Reservation;
  facility: Resource;
  selectedDate: Date;
  slot: AvailabilitySlot;
}

export function BookingConfirmationView({
  reservation,
  facility,
  selectedDate,
  slot,
}: BookingConfirmationViewProps) {
  const startStr = `${String(slot.startHour).padStart(2, "0")}:00`;
  const endStr = `${String(slot.endHour).padStart(2, "0")}:00`;
  const bookingCode = `#USV-${reservation.id || 10422}`;
  const dateFormatted = format(selectedDate, "EEEE, d MMMM yyyy", { locale: ro });

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Header mic navigare */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-[#0F52BA] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Înapoi la facilități</span>
        </Link>
      </div>

      {/* Cerc verde cu bifă & mesaj succes conform Wireframe W4 */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-sm ring-8 ring-emerald-50">
          <Check className="h-8 w-8 stroke-[3]" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Rezervare confirmată
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Un email de confirmare a fost trimis la adresa ta instituțională.
          </p>
        </div>
      </div>

      {/* Cardul cu detaliile rezervării conform Wireframe W4 */}
      <Card className="rounded-3xl border border-border/80 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="divide-y divide-border/60 text-xs sm:text-sm">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Facilitate</span>
            <span className="font-bold text-foreground">{facility.name}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Data</span>
            <span className="font-bold text-foreground capitalize">{dateFormatted}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Interval</span>
            <span className="font-bold text-foreground">
              {startStr} – {endStr}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Plată</span>
            <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs">
              Neachitată - la recepție ({reservation.totalPrice || facility.pricePerHour} lei)
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Cod rezervare</span>
            <span className="font-black text-[#0F52BA] tracking-wider text-sm sm:text-base">
              {bookingCode}
            </span>
          </div>
        </div>

        {/* Secțiunea De Reținut conform Wireframe W4 */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
            <Info className="h-4 w-4 text-[#0F52BA]" />
            <span>De reținut</span>
          </div>
          <ul className="space-y-1.5 pl-1 leading-relaxed">
            <li>
              • Anularea este posibilă cu <strong>minim 2 ore înainte</strong>.
            </li>
            <li>
              • Neprezentarea se înregistrează; la <strong>2 neprezentări</strong> contul se blochează pentru luna în curs.
            </li>
            <li>
              • Arată această confirmare la intrare. Te rugăm să te prezinți cu <strong>15 minute înainte</strong>.
            </li>
          </ul>
        </div>

        {/* Butoane de acțiune */}
        <div className="pt-2 space-y-2.5">
          <Button
            asChild
            className="w-full h-11 rounded-xl bg-[#0F52BA] hover:bg-[#1E40AF] text-white font-bold text-sm shadow-md shadow-[#0F52BA]/20"
          >
            <Link to="/rezervarile-mele">Vezi rezervările mele</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-10 rounded-xl text-xs font-semibold"
          >
            <Link to="/">Înapoi la facilități</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default BookingConfirmationView;
