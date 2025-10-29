"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/ui/mini-navbar";

export function NavbarWrapper() {
    const pathname = usePathname();
    const noNavbarRoutes = ["/"];
    const showNavbar = !noNavbarRoutes.includes(pathname);

    return showNavbar ? <Navbar /> : null;
}
