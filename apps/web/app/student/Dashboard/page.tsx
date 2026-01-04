"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "../../components/AuthWrapper";
import { useAuth } from "@clerk/nextjs";
import { Profile } from "../../components/Profile";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Dashboard() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/students/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                setUser(res.data || {});
                console.log(user);
            } catch (err) {
                console.error("Failed to fetch student profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [getToken]);

    const isInstructor =
        Array.isArray(user?.roles) && user.roles.includes("INSTRUCTOR");

    const handleBecomeInstructor = () => {
        router.push("/InstructorOnboarding");
    };

    const handleSwitchToInstructorMode = () => {
        try {
            localStorage.setItem("uiMode", "instructor");
        } catch {}

        router.push("/instructor/Dashboard");
    };

    if (loading) {
        return (
            <AuthGuard>
                <div className="w-full text-center mt-30 text-gray-400">
                    Loading your profile
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="px-6 py-8">
                <h1 className="text-2xl font-bold text-white text-center">
                    Your profile
                </h1>

                <div className="flex justify-center pt-5">
                    <Profile user={user} />
                </div>

                <div className="mt-6 flex justify-center">
                    {!isInstructor ? (
                        <div className="w-full max-w-md text-center">
                            <p className="text-sm text-gray-300 mb-3">
                                Want to teach? Create courses and earn by
                                sharing your knowledge.
                            </p>

                            <button
                                onClick={handleBecomeInstructor}
                                className="w-full px-4 py-2 rounded-md bg-[#47d4de] text-white text-sm font-medium hover:bg-[#3f999f]"
                            >
                                Become an instructor
                            </button>

                            <p className="mt-2 text-xs text-gray-500">
                                This will ask for some details and activate your
                                instructor role.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-md text-center">
                            <p className="text-sm text-gray-300 mb-3">
                                You are an instructor.
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleSwitchToInstructorMode}
                                    className="px-4 py-2 rounded-md bg-[#47d4de] text-white text-sm font-medium hover:bg-[#147c83]"
                                >
                                    Open instructor dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
