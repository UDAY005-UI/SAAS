"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/app/components/AuthWrapper";
import UnpublishedCourses from "@/app/components/AvailableCourses";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function Courses() {
    const { getToken } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    "http://localhost:5500/api/courses/get-unpublished-courses",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                setCourses(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch courses: ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, [getToken]);
    console.log(courses);

    if (loading) {
        return (
            <AuthGuard>
                <div className="w-full text-center mt-30 text-gray-400">
                    Loading courses
                </div>
            </AuthGuard>
        );
    }

    const handleOnClick = () => {
        router.push("/instructor/Courses/new");
    };

    return (
        <AuthGuard>
            <div className="px-6 py-8">
                <h1 className="text-2xl text-white font-bold text-center">
                    Your unpublished courses
                </h1>
                <UnpublishedCourses courses={courses} />
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
                    Add new course ! ⬆️
                </h1>
            </div>
        </AuthGuard>
    );
}
