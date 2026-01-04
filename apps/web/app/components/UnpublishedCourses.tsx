"use client";

import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

type AvailableCourse = {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnailUrl: string;
    price: string;
    published: boolean;
    createdAt: string;
    instructor: {
        userProfile?: {
            name?: string | null;
            avatarUrl?: string | null;
            country?: string | null;
        } | null;
    };
    modules: {
        id: string;
        title: string;
        order: number;
    }[];
};

type AvailableCoursesProps = {
    courses: AvailableCourse[];
};

export default function AvailableCourses({ courses }: AvailableCoursesProps) {
    const { getToken } = useAuth();
    const router = useRouter();

    const [localCourses, setLocalCourses] = useState(courses);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [courseId, setCourseId] = useState<string | null>(null);

    const [action, setAction] = useState<"publish" | "delete" | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const closeModal = () => {
        setCourseId(null);
        setAction(null);
        setIsLoading(false);
    };

    const confirmAction = async () => {
        if (!courseId || !action) return;

        try {
            const token = await getToken();
            setIsLoading(true);

            if (action === "publish") {
                await axios.post(
                    `http://localhost:5500/api/instructors/${courseId}/publish-course`,
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );
            }

            if (action === "delete") {
                await axios.delete(
                    `http://localhost:5500/api/instructors/${courseId}/delete-course`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true,
                    }
                );
            }
            setLocalCourses((prev) =>
                prev.filter((course) => course.id !== courseId)
            );

            closeModal();
            router.refresh();
        } catch (err) {
            console.error(err);
            alert(`Failed to ${action} course`);
            setIsLoading(false);
        }
    };

    if (!courses || courses.length === 0) {
        return (
            <div className="w-full text-center mt-10 text-gray-300">
                No courses available.
            </div>
        );
    }

    return (
        <>
            {/* Confirmation Modal */}
            {courseId && action && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-white text-lg font-semibold">
                            {action === "publish"
                                ? "Publish course?"
                                : "Delete course?"}
                        </h2>

                        <p className="text-gray-400 text-sm mt-2">
                            {action === "publish"
                                ? "Once published, this course will be visible to students."
                                : "This action is permanent. The course and all its content will be deleted."}
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                disabled={isLoading}
                                className="px-4 py-2 rounded-xl text-gray-300 hover:bg-[#1e2f2f]"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmAction}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-xl font-semibold ${
                                    action === "publish"
                                        ? "bg-[#47d4de] text-black hover:bg-[#3ac0ca]"
                                        : "bg-red-500 text-white hover:bg-red-600"
                                } disabled:opacity-60`}
                            >
                                {isLoading
                                    ? action === "publish"
                                        ? "Publishing..."
                                        : "Deleting..."
                                    : action === "publish"
                                      ? "Confirm"
                                      : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Courses Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {localCourses.map((course) => (
                    <div
                        key={course.id}
                        className="relative bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl p-5 hover:scale-[1.02] transition"
                    >
                        {/* Menu */}
                        <div className="absolute top-5 right-5 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(
                                        openMenuId === course.id
                                            ? null
                                            : course.id
                                    );
                                }}
                                className="text-gray-300 hover:text-white text-xl px-2"
                            >
                                ⋮
                            </button>

                            {openMenuId === course.id && (
                                <div
                                    className="absolute right-0 mt-5 w-44 bg-[#132323] border border-[#1e2f2f] rounded-xl shadow-lg overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {!course.published && (
                                        <button
                                            className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#1e2f2f]"
                                            onClick={() => {
                                                setOpenMenuId(null);
                                                setCourseId(course.id);
                                                setAction("publish");
                                            }}
                                        >
                                            Publish Course
                                        </button>
                                    )}

                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#1e2f2f]"
                                        onClick={() => {
                                            setOpenMenuId(null);
                                            router.push(
                                                `/instructor/Courses/${course.id}/edit`
                                            );
                                        }}
                                    >
                                        Edit Course
                                    </button>

                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1e2f2f]"
                                        onClick={() => {
                                            setOpenMenuId(null);
                                            setCourseId(course.id);
                                            setAction("delete");
                                        }}
                                    >
                                        Delete Course
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative w-full h-40 rounded-xl overflow-hidden">
                            <Image
                                src={course.thumbnailUrl || "/placeholder.jpg"}
                                alt={course.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Content */}
                        <h2 className="text-white text-lg font-bold mt-4">
                            {course.title}
                        </h2>

                        <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                            {course.description}
                        </p>

                        <p className="text-[#47d4de] text-sm mt-1">
                            {course.instructor?.userProfile?.name ??
                                "Unknown Instructor"}
                        </p>

                        <p className="text-gray-400 text-xs mt-1">
                            {course.category}
                        </p>

                        <p className="text-white font-semibold mt-2">
                            ₹{course.price}
                        </p>

                        <button
                            onClick={() =>
                                router.push(`/instructor/Courses/${course.id}`)
                            }
                            className="mt-4 bg-[#47d4de] w-full py-2 rounded-xl font-semibold hover:bg-[#3ac0ca]"
                        >
                            View Course
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
