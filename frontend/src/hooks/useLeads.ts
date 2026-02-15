import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useLeads(status?: string) {
    const key = status ? `/api/leads?status=${status}` : "/api/leads";
    const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
        refreshInterval: 5000, // Poll every 5s
    });

    return {
        leads: data,
        isLoading,
        isError: error,
        mutate,
    };
}

export function useLead(id: string) {
    const { data, error, isLoading, mutate } = useSWR(id ? `/api/leads/${id}` : null, fetcher);

    // Auto-polling for active states
    useSWR(
        data?.status === "researching" || data?.status === "enriching" || data?.status === "scoring" || data?.status === "drafting"
            ? `/api/leads/${id}`
            : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    return {
        lead: data,
        isLoading,
        isError: error,
        mutate,
    };
}
