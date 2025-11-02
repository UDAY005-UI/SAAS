"use client";
import { RedirectToSignIn, useUser } from "@clerk/nextjs";
import { ReactNode } from "react";

export function AuthGuard({ children }: { children: ReactNode }) {
    const { isLoaded, isSignedIn } = useUser();

    if (!isLoaded) return null;
    if (!isSignedIn) return <RedirectToSignIn />; // render component here

    return <>{children}</>;
}
