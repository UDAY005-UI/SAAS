"use client";

import Link from "next/link";
import { useUser, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
    const pathname = usePathname();
    const { isSignedIn } = useUser();

    const links = [
        { name: "Home", path: "/Home" },
        { name: "Discover", path: "/Discover" },
        { name: "Dashboard", path: "/Dashboard" },
    ];

    return (
        <nav
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50
      w-[90%] md:w-[70%]
      px-6 py-3 flex items-center justify-between
      backdrop-blur-xl bg-white/10 border border-white/20
      rounded-2xl shadow-lg text-white"
        >
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold tracking-wide">
                <span className="text-white">Learn</span>
                <span className="text-[#47d4de]">ify</span>
            </Link>

            {/* Links */}
            <div className="flex items-center gap-6">
                {links.map(({ name, path }) => {
                    const active = pathname === path;
                    return (
                        <Link
                            key={name}
                            href={path}
                            className={cn(
                                "transition font-medium",
                                active
                                    ? "text-[#47d4de]"
                                    : "text-white/80 hover:text-[#47d4de]"
                            )}
                        >
                            {name}
                        </Link>
                    );
                })}
            </div>

            {/* Account Button */}
            <div className="ml-4">
                <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                        elements: {
                            avatarBox:
                                "hover:ring-2 hover:ring-[#47d4de] transition",
                        },
                    }}
                />
            </div>
        </nav>
    );
}
