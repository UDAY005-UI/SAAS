"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "../components/AuthWrapper";
import PurchasedCourses from "../components/PurchasedCourses";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

export default function Home() {
    const { getToken } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        const syncUser = async () => {
            const token = await getToken();
            try {
                await axios.post(
                    "http://localhost:5500/api/users/create",
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
            } catch (err) {
                console.error(err);
            }
        };
        syncUser();
    }, [isLoaded, isSignedIn, getToken]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    "http://localhost:5500/api/students/courses",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                setCourses(
                    Array.isArray(res.data.courses) ? res.data.courses : []
                );
            } catch (err) {
                console.error("Failed to fetch purchased courses:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [getToken]);

    if (loading) {
        return (
            <AuthGuard>
                <div className="w-full text-center mt-30 text-gray-400">
                    Loading your courses
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="px-6 py-8">
                <h1 className="text-2xl font-bold text-white text-center">
                    Your Courses
                </h1>
                <PurchasedCourses courses={courses} />
            </div>
        </AuthGuard>
    );
}
