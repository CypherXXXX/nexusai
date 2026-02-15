"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { setApiUserId } from "@/lib/api";

export function AuthSync({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded) {
            setApiUserId(user?.id || null);
        }
    }, [user, isLoaded]);

    return <>{children}</>;
}
