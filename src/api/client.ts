import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./schema";
import type {
  Resource,
  ResourceCreate,
  ResourceUpdate,
  User,
  Reservation,
  ReservationCreate,
  AvailabilitySlot,
  MaintenanceBlock,
  MaintenanceBlockCreate,
  FinancialReport,
  OccupancyReport,
  PaymentStatus,
} from "./types";
import { mapeazaEroareApi } from "@/lib/erori";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api/v1";

export class ApiError extends Error {
  public status: number;
  public detail?: string;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

// Middleware pentru atașarea automată a token-ului JWT și tratarea răspunsurilor 401
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/inregistrare") &&
        !window.location.pathname.startsWith("/parola-uitata")
      ) {
        sessionStorage.removeItem("usv_token");
        sessionStorage.removeItem("usv_user");
        localStorage.removeItem("usv_token");
        localStorage.removeItem("usv_user");
        window.location.href = "/login?expirat=1";
      }
    }
    return response;
  },
};

/**
 * Clientul HTTP OpenAPI tipizat generat din schema OpenAPI
 */
export const api = createClient<paths>({
  baseUrl: API_BASE_URL,
});

api.use(authMiddleware);

/**
 * Helper generic pentru parsare rezultate sau aruncare ApiError
 */
async function handleResult<T>(promise: Promise<{ data?: T; error?: unknown; response?: Response }>): Promise<T> {
  const res = await promise;
  if (res.error) {
    const status = res.response?.status || 500;
    const friendlyMessage = mapeazaEroareApi(res.error);
    const detail =
      typeof res.error === "object" && res.error !== null && "detail" in res.error
        ? String((res.error as { detail: unknown }).detail)
        : undefined;
    throw new ApiError(status, friendlyMessage, detail);
  }
  return res.data as T;
}

/**
 * API Client cu metode complet tipizate pentru consum direct în componente / hook-uri
 */
export const apiClient = {
  auth: {
    login: async (email: string, password: string) => {
      // Backend-ul FastAPI folosește fluxul OAuth2 Password Request Form (application/x-www-form-urlencoded)
      const formBody = new URLSearchParams();
      formBody.append("username", email.trim());
      formBody.append("password", password);

      try {
        const rawRes = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formBody.toString(),
        });

        const rawData = await rawRes.json().catch(() => ({}));
        if (!rawRes.ok) {
          const detail = rawData?.detail || rawData?.message;
          const status = rawRes.status;
          throw new ApiError(status, mapeazaEroareApi({ status, detail }), typeof detail === "string" ? detail : undefined);
        }

        const accessToken = (rawData.access_token || rawData.accessToken) as string;
        const tokenType = (rawData.token_type || rawData.tokenType || "bearer") as string;

        if (!accessToken) {
          throw new ApiError(401, "Nu s-a primit un token valid de la server.");
        }

        return { accessToken, tokenType };
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          throw err;
        }
        throw new ApiError(401, mapeazaEroareApi(err));
      }
    },

    register: async (data: { email: string; password: string; fullName: string; phone?: string }) => {
      const parts = data.fullName.trim().split(" ");
      const firstName = parts[0] || data.fullName.trim();
      const lastName = parts.slice(1).join(" ") || "Student";

      const rawRes = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email.trim(),
          password: data.password,
          firstName,
          lastName,
          first_name: firstName,
          last_name: lastName,
          fullName: data.fullName.trim(),
          phone: data.phone?.trim() || undefined,
        }),
      });

      const rawData = await rawRes.json().catch(() => ({}));
      if (!rawRes.ok) {
        const detail = rawData?.detail || rawData?.message;
        const status = rawRes.status;
        throw new ApiError(status, mapeazaEroareApi({ status, detail }), typeof detail === "string" ? detail : undefined);
      }

      return rawData as User;
    },

    me: async (): Promise<User> => {
      const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
      const rawRes = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!rawRes.ok) {
        const rawData = await rawRes.json().catch(() => ({}));
        throw new ApiError(rawRes.status, "Sesiunea a expirat sau este invalidă.", rawData?.detail);
      }

      const data = await rawRes.json();
      return {
        ...data,
        fullName:
          data.fullName ||
          `${data.firstName || data.first_name || ""} ${data.lastName || data.last_name || ""}`.trim() ||
          data.email,
        firstName: data.firstName || data.first_name || "",
        lastName: data.lastName || data.last_name || "",
        isBlocked: Boolean(data.isBlocked ?? data.blocked ?? false),
        role: (data.role || "student").toLowerCase(),
      } as User;
    },
  },

  resources: {
    list: async (params?: { sport?: string; type?: "teren" | "bazin" }): Promise<Resource[]> => {
      return handleResult(
        api.GET("/resources", {
          params: { query: params },
        })
      );
    },

    get: async (id: number): Promise<Resource> => {
      return handleResult(
        api.GET("/resources/{resourceId}", {
          params: { path: { resourceId: id } },
        })
      );
    },

    getAvailability: async (id: number, dateStr: string): Promise<AvailabilitySlot[]> => {
      return handleResult(
        api.GET("/resources/{resourceId}/availability", {
          params: {
            path: { resourceId: id },
            query: { date: dateStr },
          },
        })
      );
    },

    create: async (data: ResourceCreate): Promise<Resource> => {
      return handleResult(
        api.POST("/resources", {
          body: data,
        })
      );
    },

    update: async (id: number, data: ResourceUpdate): Promise<Resource> => {
      return handleResult(
        api.PATCH("/resources/{resourceId}", {
          params: { path: { resourceId: id } },
          body: data,
        })
      );
    },

    delete: async (id: number): Promise<void> => {
      const res = await api.DELETE("/resources/{resourceId}", {
        params: { path: { resourceId: id } },
      });
      if (res.error) {
        throw new ApiError(res.response?.status || 500, mapeazaEroareApi(res.error));
      }
    },
  },

  reservations: {
    list: async (params?: {
      status?: "ACTIVA" | "ANULATA" | "FINALIZATA" | "NEPREZENTARE";
      resourceId?: number;
      from?: string;
      to?: string;
    }): Promise<Reservation[]> => {
      const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
      const url = new URL(`${API_BASE_URL}/reservations`, window.location.origin);
      if (params?.status) url.searchParams.append("status", params.status);
      if (params?.resourceId) url.searchParams.append("resourceId", String(params.resourceId));
      if (params?.from) url.searchParams.append("from", params.from);
      if (params?.to) url.searchParams.append("to", params.to);

      const rawRes = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!rawRes.ok) {
        const errorData = await rawRes.json().catch(() => ({}));
        throw new ApiError(rawRes.status, mapeazaEroareApi(errorData), errorData?.detail);
      }
      const listData = (await rawRes.json()) as Reservation[];
      return listData.map((r) => ({
        ...r,
        resourceId: r.resourceId || r.resource?.id || 0,
        resourceName: r.resourceName || r.resource?.name || "Facilitate USV",
        amount: r.amount ?? r.totalPrice ?? 0,
        totalPrice: r.totalPrice ?? r.amount ?? 0,
      }));
    },

    get: async (id: number): Promise<Reservation> => {
      const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
      const rawRes = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!rawRes.ok) {
        const errorData = await rawRes.json().catch(() => ({}));
        throw new ApiError(rawRes.status, mapeazaEroareApi(errorData), errorData?.detail);
      }
      const r = (await rawRes.json()) as Reservation;
      return {
        ...r,
        resourceId: r.resourceId || r.resource?.id || 0,
        resourceName: r.resourceName || r.resource?.name || "Facilitate USV",
        amount: r.amount ?? r.totalPrice ?? 0,
        totalPrice: r.totalPrice ?? r.amount ?? 0,
      };
    },

    create: async (data: ReservationCreate): Promise<Reservation> => {
      const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
      const rawRes = await fetch(`${API_BASE_URL}/reservations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          resourceId: data.resourceId,
          start: data.start,
          end: data.end,
        }),
      });

      const rawData = await rawRes.json().catch(() => ({}));
      if (!rawRes.ok) {
        const detail = rawData?.detail || rawData?.message;
        throw new ApiError(
          rawRes.status,
          mapeazaEroareApi({ status: rawRes.status, detail }),
          typeof detail === "string" ? detail : undefined
        );
      }
      return rawData as Reservation;
    },

    cancel: async (id: number): Promise<Reservation> => {
      const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
      const rawRes = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const rawData = await rawRes.json().catch(() => ({}));
      if (!rawRes.ok) {
        const detail = rawData?.detail || rawData?.message;
        throw new ApiError(
          rawRes.status,
          mapeazaEroareApi({ status: rawRes.status, detail }),
          typeof detail === "string" ? detail : undefined
        );
      }
      return rawData as Reservation;
    },

    setPayment: async (id: number, paymentStatus: PaymentStatus): Promise<Reservation> => {
      const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
      const rawRes = await fetch(`${API_BASE_URL}/reservations/${id}/payment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paymentStatus }),
      });

      const rawData = await rawRes.json().catch(() => ({}));
      if (!rawRes.ok) {
        const detail = rawData?.detail || rawData?.message;
        throw new ApiError(
          rawRes.status,
          mapeazaEroareApi({ status: rawRes.status, detail }),
          typeof detail === "string" ? detail : undefined
        );
      }
      return rawData as Reservation;
    },

    markNoShow: async (id: number): Promise<Reservation> => {
      const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
      const rawRes = await fetch(`${API_BASE_URL}/reservations/${id}/no-show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await rawRes.json();
      if (!rawRes.ok) {
        throw new ApiError(rawRes.status, mapeazaEroareApi(data), data.detail);
      }
      return data as Reservation;
    },
  },

  users: {
    list: async (params?: { role?: "student" | "profesor" | "administrator"; blocked?: boolean }): Promise<User[]> => {
      return handleResult(
        api.GET("/users", {
          params: { query: params },
        })
      );
    },

    unblock: async (userId: number): Promise<User> => {
      return handleResult(
        api.POST("/users/{userId}/unblock", {
          params: { path: { userId } },
        })
      );
    },
  },

  maintenance: {
    list: async (resourceId?: number): Promise<MaintenanceBlock[]> => {
      const blocks = await handleResult(api.GET("/maintenance-blocks"));
      if (resourceId) {
        return blocks.filter((b) => b.resourceId === resourceId);
      }
      return blocks;
    },

    create: async (data: MaintenanceBlockCreate): Promise<MaintenanceBlock> => {
      return handleResult(
        api.POST("/maintenance-blocks", {
          body: data,
        })
      );
    },

    delete: async (blockId: number): Promise<void> => {
      const res = await api.DELETE("/maintenance-blocks/{blockId}", {
        params: { path: { blockId } },
      });
      if (res.error) {
        throw new ApiError(res.response?.status || 500, mapeazaEroareApi(res.error));
      }
    },
  },

  reports: {
    financial: async (params?: { month?: string; format?: "json" | "csv" | "xlsx" | "pdf" }): Promise<FinancialReport> => {
      const res = (await api.GET("/reports/financial", {
        params: { query: params },
      })) as { data?: FinancialReport; error?: unknown; response?: Response };
      if (res.error) {
        throw new ApiError(res.response?.status || 500, mapeazaEroareApi(res.error));
      }
      return res.data as FinancialReport;
    },

    occupancy: async (params?: { month?: string; format?: "json" | "csv" | "xlsx" | "pdf" }): Promise<OccupancyReport> => {
      const res = (await api.GET("/reports/occupancy", {
        params: { query: params },
      })) as { data?: OccupancyReport; error?: unknown; response?: Response };
      if (res.error) {
        throw new ApiError(res.response?.status || 500, mapeazaEroareApi(res.error));
      }
      return res.data as OccupancyReport;
    },
  },
};

export default api;
