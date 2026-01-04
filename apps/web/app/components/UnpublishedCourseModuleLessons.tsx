"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

type Lesson = {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
};

type AvailableLessonsProps = {
    lessons: Lesson[];
};

export default function AvailableLessons({ lessons }: AvailableLessonsProps) {
    const { courseId, moduleId } = useParams<{
        courseId: string;
        moduleId: string;
    }>();

    const router = useRouter();
    const { getToken } = useAuth();

    // optimistic UI
    const [localLessons, setLocalLessons] = useState(lessons);

    // UI state
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const closeModal = () => {
        setLessonToDelete(null);
        setIsDeleting(false);
    };

    const confirmDelete = async () => {
        if (!lessonToDelete) return;

        try {
            const token = await getToken();
            setIsDeleting(true);

            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/instructors/${lessonToDelete}/delete-lesson`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            setLocalLessons((prev) =>
                prev.filter((l) => l.id !== lessonToDelete)
            );

            closeModal();
        } catch (err) {
            console.error(err);
            alert("Failed to delete lesson");
            setIsDeleting(false);
        }
    };

    if (!localLessons || localLessons.length === 0) {
        return (
            <div className="w-full text-center mt-10 text-gray-300">
                No lessons available.
            </div>
        );
    }

    return (
        <>
            {lessonToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-white text-lg font-semibold">
                            Delete lesson?
                        </h2>

                        <p className="text-gray-400 text-sm mt-2">
                            This action is permanent. The lesson and its content
                            will be deleted.
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl text-gray-300 hover:bg-[#1e2f2f]"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {localLessons.map((lesson) => (
                    <div
                        key={lesson.id}
                        className="relative bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl p-5 hover:scale-[1.02] transition"
                    >
                        <div className="absolute top-5 right-5 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(
                                        openMenuId === lesson.id
                                            ? null
                                            : lesson.id
                                    );
                                }}
                                className="text-gray-300 hover:text-white text-xl px-2"
                            >
                                ⋮
                            </button>

                            {openMenuId === lesson.id && (
                                <div
                                    className="absolute right-0 mt-5 w-40 bg-[#132323] border border-[#1e2f2f] rounded-xl shadow-lg overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1e2f2f]"
                                        onClick={() => {
                                            setOpenMenuId(null);
                                            setLessonToDelete(lesson.id);
                                        }}
                                    >
                                        Delete Lesson
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="relative w-full h-40 rounded-xl overflow-hidden">
                            <Image
                                src={lesson.thumbnailUrl || "/placeholder.jpg"}
                                alt={lesson.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <h2 className="text-white text-lg font-bold mt-4">
                            {lesson.title}
                        </h2>

                        <p className="text-gray-400 text-xs mt-1">
                            {lesson.description}
                        </p>

                        <button
                            onClick={() =>
                                router.push(
                                    `/instructor/Courses/${courseId}/Modules/${moduleId}/Lessons/${lesson.id}`
                                )
                            }
                            className="mt-4 bg-[#47d4de] w-full py-2 rounded-xl font-semibold hover:bg-[#3ac0ca]"
                        >
                            View Lesson
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
