import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import {
  Ban,
  Trash2,
  Wrench,
  AlertCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { apiClient } from "@/api/client";
import type { Resource, MaintenanceBlock } from "@/api/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { notifyAvailabilityChange } from "@/features/availability/useAvailability";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: Resource[];
}

export function MaintenanceModal({ isOpen, onClose, resources }: MaintenanceModalProps) {
  const queryClient = useQueryClient();
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    resources[0] ? String(resources[0].id) : "1"
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => format(new Date(), "yyyy-MM-dd"));
  const [startHour, setStartHour] = useState("10");
  const [endHour, setEndHour] = useState("12");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Preluare blocaje de mentenanță active
  const { data: blocks = [], isLoading: isLoadingBlocks } = useQuery<MaintenanceBlock[]>({
    queryKey: ["maintenanceBlocks"],
    queryFn: () => apiClient.maintenance.list(),
    enabled: isOpen,
  });

  // Mutație creare blocaj mentenanță
  const createBlockMutation = useMutation({
    mutationFn: async () => {
      const sH = parseInt(startHour, 10);
      const eH = parseInt(endHour, 10);
      if (sH >= eH) {
        throw new Error("Ora de începere trebuie să fie mai mică decât ora de sfârșit.");
      }
      if (!reason.trim()) {
        throw new Error("Te rugăm să introduci un motiv pentru mentenanță.");
      }

      const start = `${selectedDate}T${String(sH).padStart(2, "0")}:00:00`;
      const end = `${selectedDate}T${String(eH).padStart(2, "0")}:00:00`;

      return apiClient.maintenance.create({
        resourceId: parseInt(selectedResourceId, 10),
        start,
        end,
        reason: reason.trim(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      notifyAvailabilityChange(parseInt(selectedResourceId, 10), selectedDate);
      toast.success("Intervalul a fost blocat pentru mentenanță!");
      setReason("");
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Mutație deblocare / ștergere mentenanță
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: number) => {
      return apiClient.maintenance.delete(blockId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenanceBlocks"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      notifyAvailabilityChange(parseInt(selectedResourceId, 10));
      toast.success("Blocajul de mentenanță a fost eliminat. Sloturile sunt din nou libere.");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Eroare la eliminarea blocajului.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createBlockMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl w-full rounded-3xl p-6 border border-slate-200 bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#0F52BA]" />
            Blocări pentru mentenanță
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Blochează intervale orare pentru lucrări tehnice, curățenie sau reparații. Sloturile vor apărea indisponibile în calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {error && (
            <Alert variant="destructive" className="py-2.5 px-3 rounded-xl border-rose-200 bg-rose-50/90 text-rose-800 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <AlertDescription className="font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Formular creare blocaj */}
          <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-[#0F52BA]" />
              Adaugă blocaj nou
            </h4>

            {/* Select Facilitate */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Facilitate sportivă</Label>
              <Select value={selectedResourceId} onValueChange={setSelectedResourceId}>
                <SelectTrigger className="h-10 text-xs rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Alege terenul sau bazinul" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name} ({r.sport})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dată & Intervale Orare */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Data</Label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-10 text-xs rounded-xl bg-white border-slate-200 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">De la ora</Label>
                <Select value={startHour} onValueChange={setStartHour}>
                  <SelectTrigger className="h-10 text-xs rounded-xl bg-white border-slate-200 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => i + 8).map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {String(h).padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Până la ora</Label>
                <Select value={endHour} onValueChange={setEndHour}>
                  <SelectTrigger className="h-10 text-xs rounded-xl bg-white border-slate-200 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 14 }, (_, i) => i + 9).map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {String(h).padStart(2, "0")}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Motiv mentenanță */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Motivul mentenanței</Label>
              <Input
                type="text"
                placeholder="ex. Curățare filtre bazin, revizie nocturnă, schimbare gazon..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-10 text-xs rounded-xl bg-white border-slate-200"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={createBlockMutation.isPending}
              className="w-full h-10 rounded-xl bg-[#0F52BA] hover:bg-[#1E40AF] text-white font-bold text-xs shadow-md shadow-[#0F52BA]/20"
            >
              {createBlockMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se blochează intervalul...
                </>
              ) : (
                <>
                  <Ban className="mr-1.5 h-3.5 w-3.5" />
                  Blochează intervalul selectat
                </>
              )}
            </Button>
          </form>

          {/* Lista blocajelor existente */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Blocaje active în sistem</span>
              <Badge variant="secondary" className="text-[10px] bg-slate-100 text-slate-600">
                {blocks.length}
              </Badge>
            </h4>

            {isLoadingBlocks ? (
              <div className="p-4 text-center text-xs text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-[#0F52BA]" />
                Se încarcă blocajele...
              </div>
            ) : blocks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-xl">
                Nu există intervale blocate pentru mentenanță.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {blocks.map((block) => {
                  const startDate = new Date(block.start);
                  const endDate = new Date(block.end);
                  const dateFormatted = format(startDate, "d MMMM yyyy", { locale: ro });
                  const timeFormatted = `${format(startDate, "HH:mm")} – ${format(endDate, "HH:mm")}`;
                  const facilityName =
                    resources.find((r) => r.id === block.resourceId)?.name ||
                    `Facilitatea #${block.resourceId}`;

                  return (
                    <div
                      key={block.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-slate-300"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{facilityName}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-slate-700 capitalize">{dateFormatted}</span>
                        </div>
                        <p className="text-slate-500 flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#0F52BA]">{timeFormatted}</span>
                          <span>•</span>
                          <span className="text-slate-600 truncate max-w-xs">{block.reason || "Mentenanță"}</span>
                        </p>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={deleteBlockMutation.isPending}
                        onClick={() => deleteBlockMutation.mutate(block.id)}
                        className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg shrink-0"
                        title="Deblochează interval"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Deblochează
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MaintenanceModal;
