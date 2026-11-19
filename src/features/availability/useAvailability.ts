import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AvailabilitySlot, SlotStatus } from "@/api/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "/api/v1";

export interface UseAvailabilityOptions {
  resourceId: number;
  dateStr: string; // format "YYYY-MM-DD"
  enabled?: boolean;
}

// Canal local pentru sincronizare instantanee între tab-uri deschise simultan
const syncChannel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("usv_availability_sync")
    : null;

/**
 * Emite un semnal de actualizare către toate tab-urile active atunci când se creează sau anulează o rezervare
 */
export function notifyAvailabilityChange(resourceId: number, dateStr?: string) {
  if (syncChannel) {
    syncChannel.postMessage({ type: "SLOT_CHANGED", resourceId, dateStr, timestamp: Date.now() });
  }
}

/**
 * Hook avansat pentru actualizarea orarului în timp real.
 * Combină:
 * 1. SSE (Server-Sent Events) către /api/v1/events/availability/{resourceId} dacă backend-ul îl suportă
 * 2. Polling inteligent la 8 secunde (refetchInterval)
 * 3. Reîncărcare imediată la revenirea în tab (refetchOnWindowFocus)
 * 4. Sincronizare automată multi-tab via BroadcastChannel
 */
export function useAvailability({ resourceId, dateStr, enabled = true }: UseAvailabilityOptions) {
  const queryClient = useQueryClient();
  const queryKey = ["availability", resourceId, dateStr];

  // 1. Abonare la BroadcastChannel pentru sincronizare instantanee între ferestre/tab-uri
  useEffect(() => {
    if (!syncChannel || !enabled || resourceId <= 0) return;

    const handleMessage = (event: MessageEvent) => {
      if (
        event.data?.type === "SLOT_CHANGED" &&
        (event.data.resourceId === resourceId || !event.data.resourceId)
      ) {
        queryClient.invalidateQueries({ queryKey });
      }
    };

    syncChannel.addEventListener("message", handleMessage);
    return () => {
      syncChannel.removeEventListener("message", handleMessage);
    };
  }, [queryClient, queryKey, enabled, resourceId]);

  // 2. Conectare la SSE dacă serverul expune un flux de evenimente live
  useEffect(() => {
    if (!enabled || resourceId <= 0 || typeof window === "undefined" || !("EventSource" in window)) {
      return;
    }

    let eventSource: EventSource | null = null;
    const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
    const sseUrl = `${API_BASE_URL}/events/availability/${resourceId}${token ? `?token=${encodeURIComponent(token)}` : ""}`;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener("availability_update", () => {
        queryClient.invalidateQueries({ queryKey });
      });

      eventSource.onmessage = () => {
        queryClient.invalidateQueries({ queryKey });
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      };
    } catch {
      // Fallback către polling
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [queryClient, queryKey, enabled, resourceId]);

  // 3. React Query cu preluare directă din endpoint-ul backend /resources/{resourceId}/availability?date=YYYY-MM-DD
  return useQuery({
    queryKey,
    enabled: enabled && resourceId > 0 && Boolean(dateStr),
    refetchInterval: 8000, // 8 secunde pentru actualizare în timp real garantată
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 3000,
    queryFn: async (): Promise<AvailabilitySlot[]> => {
      try {
        const token = sessionStorage.getItem("usv_token") || localStorage.getItem("usv_token");
        const rawRes = await fetch(`${API_BASE_URL}/resources/${resourceId}/availability?date=${dateStr}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!rawRes.ok) {
          return generareSloturiImplicite(dateStr);
        }

        const data = await rawRes.json();
        const rawSlots = data.slots || (Array.isArray(data) ? data : []);

        if (rawSlots.length > 0) {
          const now = new Date();
          return rawSlots.map((s: { start: string; end: string; status: SlotStatus }) => {
            const startDate = new Date(s.start);
            const endDate = new Date(s.end);
            const startHour = startDate.getHours();
            const endHour = endDate.getHours();
            let status = s.status;

            // Dacă este astăzi și ora a trecut deja, marcăm ca ocupat
            if (startDate < now && status === "liber") {
              status = "ocupat";
            }

            return {
              start: s.start,
              end: s.end,
              startHour,
              endHour,
              status,
            };
          });
        }

        return generareSloturiImplicite(dateStr);
      } catch {
        return generareSloturiImplicite(dateStr);
      }
    },
  });
}

/**
 * Generează intervalele orare standard între 08:00 și 22:00 în caz de eroare temporară de rețea.
 */
function generareSloturiImplicite(dateStr: string): AvailabilitySlot[] {
  const slots: AvailabilitySlot[] = [];
  const selectedDate = new Date(dateStr);
  const now = new Date();
  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();

  for (let hour = 8; hour < 22; hour++) {
    let status: SlotStatus = "liber";
    if (isToday && hour <= now.getHours()) {
      status = "ocupat";
    }

    slots.push({
      startHour: hour,
      endHour: hour + 1,
      status,
    });
  }

  return slots;
}

export default useAvailability;
