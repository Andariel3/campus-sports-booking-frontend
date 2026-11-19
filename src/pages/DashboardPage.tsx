import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Dumbbell, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  SlidersHorizontal, 
  DollarSign, 
  Layers, 
  Building2,
  CalendarCheck,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminBookingsList } from "@/features/admin/AdminBookingsList";
import { AdminUsersList } from "@/features/admin/AdminUsersList";
import { MaintenanceModal } from "@/features/admin/MaintenanceModal";

interface Resource {
  id: number;
  name: string;
  type: "teren" | "bazin";
  sport: string;
  description: string | null;
  pricePerHour: number | null;
  openHour: string | null;
  closeHour: string | null;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [adminSection, setAdminSection] = useState<"bookings" | "users" | "resources">("bookings");
  const [modalOpen, setModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchTable, setSearchTable] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    type: "teren" as "teren" | "bazin",
    sport: "fotbal",
    description: "",
    pricePerHour: "40",
    openHour: "08:00",
    closeHour: "22:00",
  });

  // 1. GET /api/v1/resources
  const { data: resources = [], isLoading, isError, refetch, isFetching } = useQuery<Resource[]>({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const res = await fetch("/api/v1/resources");
      if (!res.ok) throw new Error("Eroare la citirea bazei de date");
      return res.json();
    },
  });

  // Calcul statistici rapide
  const stats = useMemo(() => {
    const total = resources.length;
    const terenuri = resources.filter((r) => r.type === "teren").length;
    const bazine = resources.filter((r) => r.type === "bazin").length;
    const validPrices = resources.filter((r) => r.pricePerHour !== null).map((r) => r.pricePerHour as number);
    const avgPrice = validPrices.length ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length) : 0;
    return { total, terenuri, bazine, avgPrice };
  }, [resources]);

  // Filtrare tabel
  const displayedResources = useMemo(() => {
    return resources.filter((r) => {
      const matchesType = filterType === "all" || r.type === filterType;
      const matchesSearch =
        !searchTable.trim() ||
        r.name.toLowerCase().includes(searchTable.toLowerCase()) ||
        r.sport.toLowerCase().includes(searchTable.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(searchTable.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [resources, filterType, searchTable]);

  // 2. POST /api/v1/resources
  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const body = {
        name: payload.name.trim(),
        type: payload.type,
        sport: payload.sport.trim().toLowerCase(),
        description: payload.description.trim() || null,
        pricePerHour: payload.pricePerHour ? parseFloat(payload.pricePerHour) : null,
        openHour: payload.openHour || null,
        closeHour: payload.closeHour || null,
      };

      const res = await fetch("/api/v1/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Eroare la salvare" }));
        throw new Error(errorData.detail || "Nu s-a putut crea resursa");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setModalOpen(false);
      resetForm();
      showToast("Resursă sportivă creată cu succes!");
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  // 3. PATCH /api/v1/resources/{id}
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: typeof formData }) => {
      const body = {
        name: payload.name.trim(),
        description: payload.description.trim() || null,
        pricePerHour: payload.pricePerHour ? parseFloat(payload.pricePerHour) : null,
        openHour: payload.openHour || null,
        closeHour: payload.closeHour || null,
      };

      const res = await fetch(`/api/v1/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "Eroare la actualizare" }));
        throw new Error(errorData.detail || "Nu s-a putut actualiza resursa");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setModalOpen(false);
      resetForm();
      showToast("Resursa a fost actualizată!");
    },
    onError: (err: Error) => {
      setFormError(err.message);
    },
  });

  // 4. DELETE /api/v1/resources/{id}
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/v1/resources/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Nu s-a putut șterge resursa");
      }
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resources"] });
      queryClient.invalidateQueries({ queryKey: ["resources"] });
      setDeleteConfirmId(null);
      showToast("Resursa a fost ștearsă.");
    },
    onError: (err: Error) => {
      showToast(`Eroare: ${err.message}`);
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "teren",
      sport: "fotbal",
      description: "",
      pricePerHour: "40",
      openHour: "08:00",
      closeHour: "22:00",
    });
    setEditingResource(null);
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditingResource(res);
    setFormData({
      name: res.name,
      type: res.type,
      sport: res.sport,
      description: res.description || "",
      pricePerHour: res.pricePerHour !== null ? String(res.pricePerHour) : "",
      openHour: res.openHour || "08:00",
      closeHour: res.closeHour || "22:00",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) {
      setFormError("Numele este obligatoriu.");
      return;
    }
    if (editingResource) {
      updateMutation.mutate({ id: editingResource.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="w-full pb-12">
      {/* Subheader Administrare */}
      <div className="border-b border-border bg-card px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Admin - Bază sportivă
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Panoul de control pentru plăți, orare, utilizatori și infrastructură sportivă
            </p>
          </div>
          {adminSection === "resources" && (
            <Button onClick={handleOpenAdd} size="sm" className="bg-[#0F52BA] hover:bg-[#1E40AF] text-white shadow-xs font-semibold">
              <Plus className="h-4 w-4 mr-1.5" /> Adaugă resursă
            </Button>
          )}
        </div>
      </div>

      {/* Taburi principale Administrare */}
      <div className="border-b border-border bg-white px-4 sm:px-8 sticky top-16 z-20">
        <div className="mx-auto flex max-w-7xl items-center gap-2 py-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setAdminSection("bookings")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminSection === "bookings"
                ? "bg-[#0F52BA] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            Rezervările zilei & Plăți
          </button>

          <button
            type="button"
            onClick={() => setAdminSection("users")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminSection === "users"
                ? "bg-[#0F52BA] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Users className="h-4 w-4" />
            Utilizatori & Stare cont
          </button>

          <button
            type="button"
            onClick={() => setAdminSection("resources")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              adminSection === "resources"
                ? "bg-[#0F52BA] text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Dumbbell className="h-4 w-4" />
            Facilități sportive ({resources.length})
          </button>
        </div>
      </div>

      {/* Mesaj Toast Notificare */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Conținut în funcție de tab-ul selectat */}
      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-8 w-full space-y-6">
        {adminSection === "bookings" && (
          <AdminBookingsList onOpenMaintenanceModal={() => setMaintenanceModalOpen(true)} />
        )}

        {adminSection === "users" && (
          <AdminUsersList />
        )}

        {adminSection === "resources" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Gestiune Resurse Sportive
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Configurează terenurile, tarifele și orarele de funcționare.
                </p>
              </div>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                disabled={isFetching}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin text-[#0F52BA]" : ""}`} />
                <span>Actualizează datele</span>
              </Button>
            </div>

            {/* Carduri Statistici KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Resurse</span>
                  <Layers className="h-4 w-4 text-[#0F52BA]" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                <p className="text-[11px] text-slate-500 mt-1">Înregistrate în sistem</p>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Terenuri Sport</span>
                  <Building2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.terenuri}</div>
                <p className="text-[11px] text-slate-500 mt-1">Fotbal, tenis, baschet</p>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Bazin Olimpic</span>
                  <Dumbbell className="h-4 w-4 text-sky-600" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.bazine}</div>
                <p className="text-[11px] text-slate-500 mt-1">Bazin acoperit încălzit</p>
              </Card>

              <Card className="rounded-2xl border-slate-200/80 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Tarif Mediu</span>
                  <DollarSign className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-900">{stats.avgPrice} lei</div>
                <p className="text-[11px] text-slate-500 mt-1">Pe oră de rezervare</p>
              </Card>
            </div>

            {/* Filtre și Căutare */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Caută teren, sport sau descriere..."
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setFilterType("all")}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      filterType === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Toate
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("teren")}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      filterType === "teren" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Terenuri
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType("bazin")}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      filterType === "bazin" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    Bazine
                  </button>
                </div>
              </div>
            </div>

            {/* Tabel Resurse */}
            <Card className="rounded-2xl border-slate-200/80 bg-white overflow-hidden shadow-xs">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-bold text-xs uppercase text-slate-500">ID</TableHead>
                      <TableHead className="font-bold text-xs uppercase text-slate-500">Nume & Sport</TableHead>
                      <TableHead className="font-bold text-xs uppercase text-slate-500">Tip</TableHead>
                      <TableHead className="font-bold text-xs uppercase text-slate-500">Tarif / Oră</TableHead>
                      <TableHead className="font-bold text-xs uppercase text-slate-500">Program</TableHead>
                      <TableHead className="font-bold text-xs uppercase text-slate-500 text-right">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#0F52BA]" />
                          Se încarcă resursele sportive...
                        </TableCell>
                      </TableRow>
                    ) : isError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-rose-500">
                          <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                          Eroare la conectarea cu baza de date backend.
                        </TableCell>
                      </TableRow>
                    ) : displayedResources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                          Nicio resursă găsită conform filtrului aplicat.
                        </TableCell>
                      </TableRow>
                    ) : (
                      displayedResources.map((res) => (
                        <TableRow key={res.id} className="hover:bg-slate-50/80 transition-colors">
                          <TableCell className="font-mono text-xs font-bold text-slate-400">#{res.id}</TableCell>
                          <TableCell>
                            <div className="font-bold text-slate-900 text-sm">{res.name}</div>
                            <div className="text-xs text-slate-500 capitalize flex items-center gap-1">
                              <span>Sport: {res.sport}</span>
                              {res.description && <span>· {res.description}</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              res.type === "teren" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-sky-50 text-sky-700 border border-sky-200"
                            }`}>
                              {res.type === "teren" ? "Teren" : "Bazin"}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-sm text-[#0F52BA]">
                            {res.pricePerHour !== null ? `${res.pricePerHour} lei` : "Gratuit"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-600 font-mono">
                            <Clock className="h-3.5 w-3.5 inline mr-1 text-slate-400" />
                            {res.openHour || "08:00"} – {res.closeHour || "22:00"}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(res)}
                              className="h-8 w-8 p-0 text-slate-600 hover:text-[#0F52BA] rounded-lg"
                              title="Editează"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteConfirmId(res.id)}
                              className="h-8 w-8 p-0 text-slate-600 hover:text-rose-600 rounded-lg"
                              title="Șterge"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Modal Adăugare / Editare Resursă */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {editingResource ? `Editează ${editingResource.name}` : "Adaugă resursă nouă"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Completează datele facilității sportive. Modificările se transmit direct în backend.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="py-2 text-xs">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="res-name" className="text-xs font-semibold">Nume resursă</Label>
              <Input
                id="res-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex. Teren Tenis 2"
                className="h-10 text-sm rounded-xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="res-type" className="text-xs font-semibold">Tip facilitate</Label>
                <select
                  id="res-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as "teren" | "bazin" })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm"
                >
                  <option value="teren">Teren</option>
                  <option value="bazin">Bazin de înot</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-sport" className="text-xs font-semibold">Sport</Label>
                <Input
                  id="res-sport"
                  value={formData.sport}
                  onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                  placeholder="ex. fotbal, tenis, inot"
                  className="h-10 text-sm rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="res-price" className="text-xs font-semibold">Tarif (lei/h)</Label>
                <Input
                  id="res-price"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  placeholder="40"
                  className="h-10 text-sm rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-open" className="text-xs font-semibold">Deschidere</Label>
                <Input
                  id="res-open"
                  value={formData.openHour}
                  onChange={(e) => setFormData({ ...formData, openHour: e.target.value })}
                  placeholder="08:00"
                  className="h-10 text-sm rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="res-close" className="text-xs font-semibold">Închidere</Label>
                <Input
                  id="res-close"
                  value={formData.closeHour}
                  onChange={(e) => setFormData({ ...formData, closeHour: e.target.value })}
                  placeholder="22:00"
                  className="h-10 text-sm rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="res-desc" className="text-xs font-semibold">Descriere / Dotări</Label>
              <Input
                id="res-desc"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="ex. Nocturnă, gazon sintetic, 10 jucători"
                className="h-10 text-sm rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} className="rounded-xl">
                Anulează
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#0F52BA] hover:bg-[#1E40AF] text-white rounded-xl font-semibold"
              >
                {createMutation.isPending || updateMutation.isPending ? "Se salvează..." : "Salvează"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmare Ștergere */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Confirmă dezactivarea
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 pt-1">
              Sigur dorești să dezactivezi această resursă? Rezervările anterioare vor rămâne păstrate în baza de date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-3">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)} className="rounded-xl">
              Anulează
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              className="rounded-xl font-semibold bg-rose-600 hover:bg-rose-700"
            >
              {deleteMutation.isPending ? "Se șterge..." : "Șterge resursa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Blochează interval pentru mentenanță (IP-48) */}
      <MaintenanceModal
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        resources={resources}
      />
    </div>
  );
}
