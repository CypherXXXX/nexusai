import useSWR from "swr";
import { api } from "@/lib/api";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useAnalytics() {
    const { data, error, isLoading } = useSWR("/api/analytics/summary", fetcher, {
        refreshInterval: 5000,
    });

    return {
        summary: data,
        isLoading,
        isError: error,
    };
}

export function useScoreDistribution() {
    const { data, error, isLoading } = useSWR("/api/analytics/score-distribution", fetcher, {
        refreshInterval: 10000,
    });
    return {
        distribution: data,
        isLoading,
        isError: error,
    };
}

export function useStatusCounts() {
    const { data, error, isLoading } = useSWR("/api/analytics/status-counts", fetcher, {
        refreshInterval: 5000,
    });
    return {
        counts: data,
        isLoading,
        isError: error,
    };
}
