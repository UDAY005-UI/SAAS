"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/app/components/AuthWrapper";
import UnpublishedCourseModuleLessons from "@/app/components/UnpublishedCourseModuleLessons";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";

export default function Modules() {
    const { getToken } = useAuth();
    const { courseId } = useParams<{ courseId: string }>();
    const { moduleId } = useParams<{ moduleId: string }>();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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

    const handleOnClick = () => {
        router.push(`/instructor/Courses/${courseId}/Modules/${moduleId}/new`);
    };

    return (
        <AuthGuard>
            <div className="px-6 py-8">
                <h1 className="text-2xl text-white font-bold text-center">
                    lessons
                </h1>
                <UnpublishedCourseModuleLessons lessons={lessons} />
                <div className="flex justify-center py-10">
                    <button
                        onClick={handleOnClick}
                        className="flex items-center justify-center h-32 w-32 border-2 border-white rounded-md hover:border-gray-400 transition cursor-pointer"
                    >
                        <div className="relative h-25 w-25">
                            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gray-700 -translate-x-1/2" />
                            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gray-700 -translate-y-1/2" />
                        </div>
                    </button>
                </div>
                <h1 className="text-bold text-white text-2xl text-center">
                    Add new lessons ! ⬆️
                </h1>
            </div>
        </AuthGuard>
    );
}
