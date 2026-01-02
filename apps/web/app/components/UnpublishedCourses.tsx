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
    published: string;
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
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [courseId, setCourseId] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);

    const closeModal = () => {
        setCourseId(null);
        setIsPublishing(false);
    };

    const confirmPublish = async () => {
        if (!courseId) return;

        try {
            const token = await getToken();

            setIsPublishing(true);

            await axios.post(
                `http://localhost:5500/api/instructors/${courseId}/publish-course`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            closeModal();
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Failed to publish course");
            setIsPublishing(false);
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
            {courseId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-white text-lg font-semibold">
                            Publish course?
                        </h2>

                        <p className="text-gray-400 text-sm mt-2">
                            Once published, this course will be visible to
                            students. You can still edit it later.
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                disabled={isPublishing}
                                className="px-4 py-2 rounded-xl text-gray-300 hover:bg-[#1e2f2f]"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmPublish}
                                disabled={isPublishing}
                                className="px-4 py-2 rounded-xl bg-[#47d4de] text-black font-semibold hover:bg-[#3ac0ca] disabled:opacity-60"
                            >
                                {isPublishing ? "Publishing..." : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className="relative bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl p-5 hover:scale-[1.02] transition"
                    >
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
                                {" "}
                                ⋮{" "}
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
                                </div>
                            )}
                        </div>
                        <div className="relative w-full h-40 rounded-xl overflow-hidden">
                            <Image
                                src={course.thumbnailUrl || "/placeholder.jpg"}
                                alt={course.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <h2 className="text-white text-lg font-bold mt-4">
                            {course.title}
                        </h2>

                        <p className="text-gray-400 text-xs mt-1">
                            {course.description}
                        </p>

                        <p className="text-[#47d4de] text-sm">
                            {course.instructor?.userProfile?.name ||
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
