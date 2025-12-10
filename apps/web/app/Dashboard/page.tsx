"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "../components/AuthWrapper";
import { useAuth } from "@clerk/nextjs";
import { Profile } from "../components/Profile";
import axios from "axios";

export default function Dashboard() {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    "http://localhost:5500/api/students/profile",
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
            <div className="px-6 py-8 ">
                <h1 className="text-2xl font-bold text-white text-center">
                    Your profile
                </h1>

                <div className="flex justify-center">
                    <Profile user={user} />
                </div>
            </div>
        </AuthGuard>
    );
}
