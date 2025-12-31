"use client";

import axios from "axios";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AuthGuard } from "@/app/components/AuthWrapper";
import { useAuth } from "@clerk/nextjs";
import VideoPlayer from "@/app/components/VideoPlayer";

export default function Lesson() {
    const { getToken } = useAuth();
    const { lessonId } = useParams<{ lessonId: string }>();
    const [loading, setLoading] = useState(true);
    const [lesson, setLesson] = useState<any>(null);

    useEffect(() => {
        if (!lessonId) return;

        const fetchLesson = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    `http://localhost:5500/api/courses/${lessonId}/lesson`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                setLesson(res.data.data || null);
            } catch (err) {
                console.log("Failed to fetch your lesson: ", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [getToken]);

    if (loading) {
        return (
            <AuthGuard>
                <div className="w-full text-center mt-30 text-gray-400">
                    Loading your lesson
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <VideoPlayer
                title={lesson.title}
                videoState={lesson.videoState}
                contentUrl={lesson.contentUrl}
                thumbnailUrl={lesson.thumbnailUrl}
                duration={lesson.duration}
            />
        </AuthGuard>
    );
}
