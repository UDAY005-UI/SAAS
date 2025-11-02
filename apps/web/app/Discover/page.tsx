"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "../components/AuthWrapper";
import AvailableCourses from "../components/AvailableCourses";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export default function Discover() {
    const { getToken } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    "http://localhost:5500/api/courses/getCourses",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                setCourses(res.data.courses || []);
            } catch (err) {
                console.error("Failed to fetch available courses:", err);
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
                    Loading courses
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="px-6 py-8">
                <h1 className="text-2xl font-bold text-white text-center">
                    Available courses
                </h1>
                <AvailableCourses courses={courses} />
            </div>
        </AuthGuard>
    );
}
