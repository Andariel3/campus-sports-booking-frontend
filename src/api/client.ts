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
      try {
        const res = await api.POST("/auth/login", {
          body: { email: email.trim(), password },
        });
        if (res.data?.accessToken) {
          return res.data;
        }
        if (res.error) {
          throw res.error;
        }
      } catch (err: unknown) {
        const status = (err as { status?: number })?.status;
        if (status === 422) {
          const formBody = new URLSearchParams();
          formBody.append("username", email.trim());
          formBody.append("password", password);

          const rawRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formBody.toString(),
          });
          const rawData = await rawRes.json();
          if (!rawRes.ok) {
            throw new ApiError(rawRes.status, mapeazaEroareApi(rawData), rawData.detail);
          }
          return {
            accessToken: (rawData.access_token || rawData.accessToken) as string,
            tokenType: (rawData.token_type || rawData.tokenType || "bearer") as string,
          };
        }
        throw new ApiError(status || 401, mapeazaEroareApi(err));
      }
      throw new ApiError(401, "Nu s-a primit un token valid.");
    },

    register: async (data: { email: string; password: string; fullName: string; phone?: string }) => {
      return handleResult(
        api.POST("/auth/register", {
          body: {
            email: data.email.trim(),
            password: data.password,
            fullName: data.fullName.trim(),
            phone: data.phone?.trim() || undefined,
          },
        })
      );
    },

    me: async (): Promise<User> => {
      return handleResult(api.GET("/users/me"));
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
    list: async (_params?: {
      status?: "ACTIVA" | "ANULATA" | "FINALIZATA" | "NEPREZENTARE";
      resourceId?: number;
      from?: string;
      to?: string;
    }): Promise<Reservation[]> => {
      const res = await handleResult(api.GET("/reservations"));
      if (!_params) return res;
      return res.filter((r) => {
        if (_params.status && r.status !== _params.status) return false;
        if (_params.resourceId && r.resourceId !== _params.resourceId) return false;
        const resDate = r.start.split("T")[0];
        if (_params.from && resDate && resDate < _params.from) return false;
        if (_params.to && resDate && resDate > _params.to) return false;
        return true;
      });
    },

    get: async (id: number): Promise<Reservation> => {
      return handleResult(
        api.GET("/reservations/{reservationId}", {
          params: { path: { reservationId: id } },
        })
      );
    },

    create: async (data: ReservationCreate): Promise<Reservation> => {
      return handleResult(
        api.POST("/reservations", {
          body: data,
        })
      );
    },

    cancel: async (id: number): Promise<Reservation> => {
      const res = await api.DELETE("/reservations/{reservationId}", {
        params: { path: { reservationId: id } },
      });
      if (res.error) {
        throw new ApiError(res.response?.status || 500, mapeazaEroareApi(res.error));
      }
      return res.data as Reservation;
    },

    setPayment: async (id: number, paymentStatus: PaymentStatus): Promise<Reservation> => {
      return handleResult(
        api.PATCH("/reservations/{reservationId}/payment", {
          params: { path: { reservationId: id } },
          body: { paymentStatus },
        })
      );
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
