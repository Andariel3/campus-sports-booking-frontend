import { Link } from "react-router-dom";
import type { Resource, Reservation, AvailabilitySlot } from "@/api/types";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { 
  Check, 
  Info, 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Dumbbell, 
  CreditCard, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const price = reservation.amount || reservation.totalPrice || facility.pricePerHour || 40;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      {/* Header mic navigare */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0F52BA] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Înapoi la facilități</span>
        </Link>
      </div>

      {/* Cerc verde cu bifă & mesaj succes conform Wireframe W4 */}
      <div className="text-center space-y-3">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/25 ring-8 ring-emerald-50 animate-in zoom-in-75 duration-300">
          <Check className="h-10 w-10 stroke-[3]" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-600 border-2 border-white" />
          </span>
        </div>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
            <Sparkles className="h-3 w-3" />
            <span>Confirmare oficială</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Rezervare confirmată!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Un email de confirmare cu detaliile rezervării a fost transmis la adresa ta instituțională.
          </p>
        </div>
      </div>

      {/* Cardul cu detaliile rezervării conform Wireframe W4 */}
      <Card className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-lg shadow-slate-200/50 space-y-5">
        <div className="space-y-3 divide-y divide-slate-100 text-xs sm:text-sm">
          {/* Facilitate */}
          <div className="flex items-center justify-between pb-2">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-[#0F52BA]" />
              Facilitate
            </span>
            <div className="text-right">
              <span className="font-bold text-slate-900 block">{facility.name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{facility.sport}</span>
            </div>
          </div>

          {/* Data */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#0F52BA]" />
              Data
            </span>
            <span className="font-bold text-slate-900 capitalize">{dateFormatted}</span>
          </div>

          {/* Interval */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#0F52BA]" />
              Interval orar
            </span>
            <span className="font-bold text-slate-900">
              {startStr} – {endStr}
            </span>
          </div>

          {/* Plată */}
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#0F52BA]" />
              Plată
            </span>
            <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-semibold hover:bg-amber-50">
              Neachitată · {price} lei la recepție
            </Badge>
          </div>

          {/* Cod rezervare */}
          <div className="pt-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Cod rezervare</span>
            <span className="font-mono font-black text-[#0F52BA] tracking-wider text-base sm:text-lg bg-blue-50/70 border border-blue-100 px-3 py-1 rounded-xl">
              {bookingCode}
            </span>
          </div>
        </div>

        {/* Secțiunea De Reținut conform Wireframe W4 */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            <Info className="h-4 w-4 text-[#0F52BA]" />
            <span>De reținut pentru vizita ta</span>
          </div>
          <ul className="space-y-1.5 pl-1 leading-relaxed text-slate-600">
            <li>
              • Anularea este gratuită cu <strong>minim 2 ore înainte</strong> de ora de start.
            </li>
            <li>
              • Neprezentarea se contorizează; la <strong>2 neprezentări</strong> contul este restricționat pentru luna în curs.
            </li>
            <li>
              • Te rugăm să prezinți acest cod (#USV) sau legitimația la recepție cu <strong>15 minute înainte</strong>.
            </li>
          </ul>
        </div>

        {/* Butoane de acțiune */}
        <div className="pt-2 space-y-2.5">
          <Button
            asChild
            className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0F52BA] to-[#1E40AF] hover:from-[#0d469e] hover:to-[#17328c] text-white font-bold text-sm shadow-md shadow-[#0F52BA]/25"
          >
            <Link to="/rezervarile-mele" className="flex items-center justify-center gap-2">
              <span>Vezi rezervările mele</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-10 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            <Link to="/facilitati">Înapoi la facilități</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default BookingConfirmationView;
