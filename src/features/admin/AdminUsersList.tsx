import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Shield,
  Search,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/api/client";
import type { User as ApiUser } from "@/api/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function AdminUsersList() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const {
    data: users = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery<ApiUser[]>({
    queryKey: ["adminUsers"],
    queryFn: () => apiClient.users.list(),
  });

  // Mutație deblocare cont
  const unblockMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiClient.users.unblock(userId);
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(`Contul utilizatorului ${updatedUser.fullName || updatedUser.email} a fost deblocat.`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "A apărut o eroare la deblocarea utilizatorului.");
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (u.fullName || "").toLowerCase().includes(q);
        const matchesEmail = (u.email || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Filtre și Căutare */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Caută după nume sau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs rounded-xl border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Toți ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("student")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === "student" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Studenți
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("administrator")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                roleFilter === "administrator" ? "bg-white text-purple-700 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Admini
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-9 w-9 p-0 rounded-xl text-slate-600"
            title="Reîmprospătează"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin text-[#0F52BA]" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Lista utilizatorilor */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="h-6 w-6 animate-spin text-[#0F52BA] mx-auto mb-2" />
          <p className="text-xs text-slate-500">Se încarcă lista de utilizatori...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-2">
          <User className="h-8 w-8 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">Niciun utilizator găsit</h4>
          <p className="text-xs text-slate-400">Verifică termenul căutat sau filtrele active.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredUsers.map((u) => {
            const isBlocked = Boolean(u.isBlocked);
            const isAdmin = u.role === "administrator";
            const noShowCount = u.noShowCount || 0;

            return (
              <Card
                key={u.id}
                className={`rounded-2xl border p-4 bg-white shadow-2xs transition-all ${
                  isBlocked ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAdmin
                          ? "bg-purple-50 text-purple-700"
                          : isBlocked
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-50 text-[#0F52BA]"
                      }`}
                    >
                      {isAdmin ? <Shield className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{u.fullName || "Utilizator"}</h4>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] py-0 px-1.5 font-semibold capitalize ${
                            isAdmin
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-50 text-blue-800"
                          }`}
                        >
                          {u.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate max-w-[200px] sm:max-w-xs">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Status blocat / deblocat */}
                  {isBlocked ? (
                    <Badge className="bg-rose-100 text-rose-800 border-rose-300 text-xs font-bold shrink-0">
                      <Lock className="h-3 w-3 mr-1" /> Blocat
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-xs shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Activ
                    </Badge>
                  )}
                </div>

                {/* Statistici cont student & Buton deblocare */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1 font-medium">
                      <CalendarCheck className="h-3.5 w-3.5 text-[#0F52BA]" />
                      Luna aceasta:{" "}
                      <strong className="text-slate-800 font-bold">
                        {u.reservationsThisMonth || 0}
                      </strong>
                      /3
                    </span>

                    <span className="flex items-center gap-1 font-medium">
                      <AlertCircle className={`h-3.5 w-3.5 ${noShowCount > 0 ? "text-rose-500" : "text-slate-400"}`} />
                      Neprezentări:{" "}
                      <strong className={`${noShowCount >= 2 ? "text-rose-600 font-bold" : "text-slate-800 font-bold"}`}>
                        {noShowCount}
                      </strong>
                    </span>
                  </div>

                  {isBlocked && (
                    <Button
                      type="button"
                      size="sm"
                      disabled={unblockMutation.isPending}
                      onClick={() => unblockMutation.mutate(u.id)}
                      className="h-8 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                    >
                      <Unlock className="h-3.5 w-3.5 mr-1" />
                      Deblochează
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminUsersList;
