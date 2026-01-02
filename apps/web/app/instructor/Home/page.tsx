"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/app/components/AuthWrapper";
import PublishedCourses from "@/app/components/PublishedCourses";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function Home() {
    const { getToken } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    "http://localhost:5500/api/instructors/instructor-courses",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                setCourses(res.data || []);
            } catch (err) {
                console.error("Failed to fetch courses: ", err);
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
                <h1 className="text-2xl text-white font-bold text-center">
                    Your courses
                </h1>
                <PublishedCourses courses={courses} />
            </div>
        </AuthGuard>
    );
}
