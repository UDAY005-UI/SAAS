"use client";

import { useAuth, RedirectToSignIn } from "@clerk/nextjs";
import { ReactNode } from "react";

interface AuthWrapperProps {
    children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
    const { isLoaded, userId } = useAuth();

    if (!isLoaded) return null;

    if (!userId) {
        return <RedirectToSignIn />;
    }

    return <>{children}</>;
};
