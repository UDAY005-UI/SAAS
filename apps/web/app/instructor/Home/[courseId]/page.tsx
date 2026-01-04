"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/app/components/AuthWrapper";
import PublishedCourseModules from "@/app/components/PublishedCourseModules";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";

export default function Courses() {
    const { getToken } = useAuth();
    const { courseId } = useParams<{ courseId: string }>();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!courseId) return;

        const fetchModules = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/modules`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                setModules(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch modules: ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, [getToken]);
    console.log(modules);

    if (loading) {
        return (
            <AuthGuard>
                <div className="w-full text-center mt-30 text-gray-400">
                    Loading modules
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="px-6 py-8">
                <h1 className="text-2xl text-white font-bold text-center">
                    modules
                </h1>
                <PublishedCourseModules modules={modules} />
            </div>
        </AuthGuard>
    );
}
