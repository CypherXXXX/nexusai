import { useState, useEffect } from "react";
import { useSWRConfig } from "swr";

export function usePolling(key: string, interval: number = 3000, shouldPoll: boolean = true) {
    const { mutate } = useSWRConfig();

    useEffect(() => {
        if (!shouldPoll) return;

        const timer = setInterval(() => {
            mutate(key);
        }, interval);

        return () => clearInterval(timer);
    }, [key, interval, shouldPoll, mutate]);
}
