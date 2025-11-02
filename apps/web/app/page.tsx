"use client";

import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const { openSignUp } = useClerk();

    const handleGetStarted = () => {
        if (isSignedIn) {
            router.push("/Home");
        } else {
            openSignUp({
                afterSignInUrl: "/Home",
                afterSignUpUrl: "/Onboarding",
            });
        }
    };

    const handleBrowseComponents = () => {
        router.push("/Discover");
    };
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center px-4 -mt-15">
            <h1 className="text-[#47d4de] text-6xl font-extrabold sm:text-4xl md:text-5xl text-center">
                Learn smarter. Grow faster
            </h1>
            <p className="mt-4 text-lg text-gray-200 max-w-[600px] sm:text-base md:text-lg text-center">
                Interactive courses, personalized learning paths, and hands-on
                projects — all in one place
            </p>
            <div className="flex mt-8 gap-6">
                <Button
                    onClick={handleGetStarted}
                    variant="outline"
                    className="h-10 w-35 bg-white text-[#47d4de] font-semibold hover:bg-[#47d4de] hover:text-white"
                >
                    Get Started
                </Button>
                <Button
                    onClick={handleBrowseComponents}
                    variant="outline"
                    className="h-10 w-35 bg-[#47d4de] text-[#ffff] font-semibold hover:bg-[#ffffff] hover:text-[#47d4de]"
                >
                    Browse courses
                </Button>
            </div>
        </div>
    );
}
