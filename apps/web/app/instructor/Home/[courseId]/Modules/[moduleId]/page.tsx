"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/app/components/AuthWrapper";
import PublishedCourseModuleLessons from "@/app/components/PublishedCourseModuleLessons";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";

export default function Modules() {
    const { getToken } = useAuth();
    const { courseId } = useParams<{ courseId: string }>();
    const { moduleId } = useParams<{ moduleId: string }>();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!moduleId) return;

        const fetchLessons = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${moduleId}/lessons-list`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                setLessons(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch lessons: ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [getToken]);

    if (loading) {
        return (
            <AuthGuard>
                <div className="w-full text-center mt-30 text-gray-400">
                    Loading lessons
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="px-6 py-8">
                <h1 className="text-2xl text-white font-bold text-center">
                    lessons
                </h1>
                <PublishedCourseModuleLessons lessons={lessons} />
            </div>
        </AuthGuard>
    );
}
