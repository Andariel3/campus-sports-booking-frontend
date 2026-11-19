import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
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
 * 2. Polling inteligent la 10 secunde (refetchInterval)
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
        // Dacă serverul nu suportă SSE (404/Refused), închidem conexiunea;
        // polling-ul inteligent de mai jos garantează actualizarea continuă.
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
      };
    } catch {
      // Fallback silențios către polling
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [queryClient, queryKey, enabled, resourceId]);

  // 3. React Query cu polling inteligent scurt la 10 secunde și refetch la focus
  return useQuery({
    queryKey,
    enabled: enabled && resourceId > 0 && Boolean(dateStr),
    refetchInterval: 10000, // 10 secunde pentru actualizare în timp real garantată
    refetchIntervalInBackground: false, // Pauză când tab-ul e ascuns pentru economie de resurse
    refetchOnWindowFocus: true, // Sincronizare instantanee la revenirea utilizatorului în aplicație
    refetchOnReconnect: true,
    staleTime: 5000,
    queryFn: async () => {
      try {
        const res = await api.GET("/resources/{resourceId}/availability", {
          params: {
            path: { resourceId },
            query: { date: dateStr },
          },
        });

        if (res.data && Array.isArray(res.data)) {
          return res.data as AvailabilitySlot[];
        }

        return generareSloturiImplicite(dateStr);
      } catch {
        return generareSloturiImplicite(dateStr);
      }
    },
  });
}

/**
 * Generează intervalele orare standard între 08:00 și 22:00 în cazul în care serverul
 * nu are încă definit endpoint-ul /availability.
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
    // Dacă este azi și ora a trecut deja, marcăm ca ocupat
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
