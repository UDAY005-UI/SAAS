"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Navbar from "./Navbar";

export function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isSignedIn } = useUser();

    const hideOn = ["/", "/Onboarding"];
    const hideBecausePath = hideOn.includes(pathname);
    const showNavbar = isSignedIn && !hideBecausePath;

    return (
        <div className="min-h-screen">
            {showNavbar && <Navbar />}
            {children}
        </div>
    );
}
