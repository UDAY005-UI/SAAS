"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/app/components/AuthWrapper";
import { useAuth } from "@clerk/nextjs";
import { InstructorProfile } from "@/app/components/InstructorProfile";
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
                    `${process.env.NEXT_PUBLIC_API_URL}/api/instructors/getProfile`,
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
                console.log("Failed to fetch instructor profile:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [getToken]);

    const isInstructor =
        Array.isArray(user?.roles) && user.roles.includes("INSTRUCTOR");

    const handleSwitchToStudentMode = () => {
        try {
            localStorage.setItem("uiMode", "student");
        } catch {}
        router.push("/student/Dashboard");
    };

    if (loading) {
        return (
            <AuthGuard>
                <div className="w-full text-center mt-30 text-gray-400">
                    {" "}
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
                    {" "}
                    <InstructorProfile user={user} />
                </div>

                <div className="flex gap-3 mt-6 justify-center">
                    <button
                        onClick={handleSwitchToStudentMode}
                        className="px-4 py-2 rounded-md bg-[#47d4de] text-white text-sm font-medium hover:bg-[#147c83]"
                    >
                        Open student dashboard
                    </button>
                </div>
            </div>
        </AuthGuard>
    );
}
