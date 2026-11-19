import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  FileSpreadsheet,
  Printer,
} from "lucide-react";
import { apiClient } from "@/api/client";
import type { Reservation, Resource } from "@/api/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: Resource[];
}

export function MonthlyReportModal({ isOpen, onClose, resources }: MonthlyReportModalProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-11");

  // Preluare toate rezervările pentru calculul statisticilor lunare
  const { data: allReservations = [] } = useQuery<Reservation[]>({
    queryKey: ["adminAllReservationsForReport"],
    queryFn: () => apiClient.reservations.list(),
    enabled: isOpen,
  });

  // Filtrare rezervări din luna selectată
  const monthReservations = useMemo(() => {
    return allReservations.filter((r) => r.start && r.start.startsWith(selectedMonth));
  }, [allReservations, selectedMonth]);

  // Calcule financiare
  const financialStats = useMemo(() => {
    const totalBookings = monthReservations.length;
    const paidBookings = monthReservations.filter((r) => r.paymentStatus === "ACHITATA");
    const unpaidBookings = monthReservations.filter(
      (r) => r.paymentStatus === "NEACHITATA" && r.status !== "ANULATA"
    );

    const totalRevenue = paidBookings.reduce(
      (acc, curr) => acc + (curr.amount || curr.totalPrice || 0),
      0
    );
    const pendingRevenue = unpaidBookings.reduce(
      (acc, curr) => acc + (curr.amount || curr.totalPrice || 0),
      0
    );
    const potentialRevenue = totalRevenue + pendingRevenue;
    const collectionRate =
      potentialRevenue > 0 ? Math.round((totalRevenue / potentialRevenue) * 100) : 100;

    return {
      totalBookings,
      totalRevenue,
      pendingRevenue,
      collectionRate,
    };
  }, [monthReservations]);

  // Calcule grad de ocupare per facilitate (considerând ~14 ore/zi x 30 zile = 420 ore max/lună)
  const occupancyStats = useMemo(() => {
    const MAX_HOURS_PER_MONTH = 420;

    return resources.map((facility) => {
      const facilityReservations = monthReservations.filter(
        (r) => r.resourceId === facility.id && r.status !== "ANULATA"
      );

      const bookedHours = facilityReservations.reduce((acc, curr) => {
        const start = new Date(curr.start).getTime();
        const end = new Date(curr.end).getTime();
        const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
        return acc + hours;
      }, 0);

      // Calcul rată de ocupare
      const occupancyRate = Math.min(100, Math.round((bookedHours / MAX_HOURS_PER_MONTH) * 100));

      // Încasări generate de facilitate
      const facilityRevenue = facilityReservations
        .filter((r) => r.paymentStatus === "ACHITATA")
        .reduce((acc, curr) => acc + (curr.amount || curr.totalPrice || 0), 0);

      return {
        facility,
        bookedHours,
        occupancyRate: Math.max(occupancyRate, facilityReservations.length > 0 ? 15 : 0), // fallback visual min for active
        facilityRevenue,
        reservationsCount: facilityReservations.length,
      };
    });
  }, [resources, monthReservations]);

  // Export CSV nativ
  const handleExportCSV = () => {
    if (monthReservations.length === 0) {
      toast.error("Nu există rezervări în luna selectată pentru a fi exportate.");
      return;
    }

    const headers = ["ID", "Data Start", "Data Sfarsit", "Facilitate", "Utilizator", "Tarif (RON)", "Status Rezervare", "Status Plata"];
    const rows = monthReservations.map((r) => [
      r.id,
      r.start,
      r.end,
      `"${r.resourceName || "Facilitate USV"}"`,
      `"${r.userName || r.userEmail || "Student"}"`,
      r.amount || r.totalPrice || 0,
      r.status,
      r.paymentStatus,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `raport_usv_sport_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Raportul pentru ${selectedMonth} a fost descărcat ca fișier CSV.`);
  };

  // Print raport
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-xl max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              Raport lunar: Financiar și Grad de Ocupare
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500">
            Analiză detaliată a încasărilor și eficienței utilizării bazei sportive USV.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Bară Selector Lună & Butoane Export */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#0F52BA]" />
              <span className="text-xs font-semibold text-slate-700">Selectează luna:</span>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-9 w-44 text-xs font-semibold rounded-xl bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026-11">Noiembrie 2026</SelectItem>
                  <SelectItem value="2026-10">Octombrie 2026</SelectItem>
                  <SelectItem value="2026-09">Septembrie 2026</SelectItem>
                  <SelectItem value="2026-12">Decembrie 2026</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 text-xs rounded-xl border-slate-200 hover:bg-slate-100"
              >
                <Printer className="h-3.5 w-3.5 mr-1 text-slate-600" />
                Tipărește / PDF
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleExportCSV}
                className="h-9 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* KPI-uri Financiare */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="rounded-2xl border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Încasări totale
              </span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {financialStats.totalRevenue} lei
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Plăți confirmate încasate</p>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sume în așteptare
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {financialStats.pendingRevenue} lei
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">La recepție (neachitate)</p>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Rată colectare
              </span>
              <div className="text-2xl font-black text-[#0F52BA] mt-1">
                {financialStats.collectionRate}%
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Din potențialul total</p>
            </Card>

            <Card className="rounded-2xl border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Rezervări lună
              </span>
              <div className="text-2xl font-black text-slate-800 mt-1">
                {financialStats.totalBookings}
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Total ore programate</p>
            </Card>
          </div>

          {/* Grad de ocupare per facilitate */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-[#0F52BA]" />
              Grad de ocupare per facilitate
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {occupancyStats.map(({ facility, occupancyRate, bookedHours, facilityRevenue, reservationsCount }) => (
                <Card
                  key={facility.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-slate-900">{facility.name}</h5>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase">
                        {facility.sport}
                      </span>
                    </div>
                    <span className="text-lg font-black text-[#0F52BA]">
                      {occupancyRate}%
                    </span>
                  </div>

                  {/* Bară vizuală curată de progres pentru ocupare */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#0F52BA] to-sky-400 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>{reservationsCount} rezervări ({bookedHours} ore)</span>
                    <strong className="text-slate-900 font-bold">{facilityRevenue} lei</strong>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tabel sumar lunar detaliat */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Sumar per facilitate ({selectedMonth})
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Facilitate</th>
                    <th className="p-3">Tip</th>
                    <th className="p-3">Rezervări</th>
                    <th className="p-3">Încasări confirmate</th>
                    <th className="p-3 text-right">Grad ocupare</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {occupancyStats.map(({ facility, occupancyRate, facilityRevenue, reservationsCount }) => (
                    <tr key={facility.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900">{facility.name}</td>
                      <td className="p-3 capitalize text-slate-500">{facility.type}</td>
                      <td className="p-3 font-mono">{reservationsCount}</td>
                      <td className="p-3 font-bold text-emerald-700">{facilityRevenue} lei</td>
                      <td className="p-3 text-right font-black text-[#0F52BA]">{occupancyRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MonthlyReportModal;
