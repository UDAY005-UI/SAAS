"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { AuthGuard } from "@/app/components/AuthWrapper";

export default function UpdateCourse() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.courseId as string;
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [existingThumbnail, setExistingThumbnail] = useState<string | null>(
        null
    );
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
    });

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const token = await getToken();

                const res = await axios.get(
                    `http://localhost:5500/api/courses/${courseId}/course`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        withCredentials: true,
                    }
                );
                const course = res.data.data;
                console.log(res);
                setForm({
                    title: course.title ?? "",
                    description: course.description ?? "",
                    price: course.price ?? "",
                    category: course.category ?? "",
                });
                setExistingThumbnail(course.thumbnailUrl ?? null);
            } catch (err) {
                console.error("Failed to fetch course data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseDetails();
    }, [getToken]);

    const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        try {
            const data = new FormData();
            data.append("title", form.title);
            data.append("description", form.description);
            data.append("category", form.category);
            data.append("price", form.price);
            if (thumbnail) data.append("thumbnail", thumbnail);

            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };

            await axios.put(
                `http://localhost:5500/api/instructors/update-course/${courseId}`,
                data,
                { headers, withCredentials: true }
            );
            router.push("/instructor/Courses");
        } catch (err) {
            console.error(err);
            alert("Failed to update course");
        }
    };

    if (loading) {
        return (
            <AuthGuard>
                <div className="w-full text-center mt-30 text-gray-400">
                    Loading page
                </div>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen flex items-center justify-center px-4 bg-black">
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await submit();
                    }}
                    className="w-full max-w-lg bg-neutral-900 p-8 rounded-lg space-y-6"
                >
                    <h1 className="text-white text-2xl font-semibold">
                        Update Course
                    </h1>

                    {["title", "description", "category", "price"].map(
                        (key) => (
                            <div key={key} className="space-y-1">
                                <label className="text-gray-300 text-sm">
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </label>
                                <input
                                    value={(form as any)[key]}
                                    onChange={(e) =>
                                        update(key, e.target.value)
                                    }
                                    className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                                />
                            </div>
                        )
                    )}
                    <div className="space-y-1">
                        <label className="text-gray-300 text-sm">
                            Thumbnail
                        </label>

                        <label className="relative flex items-center justify-center w-full h-40 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-[#47d4de] transition overflow-hidden">
                            {thumbnail ? (
                                <img
                                    src={URL.createObjectURL(thumbnail)}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : existingThumbnail ? (
                                <img
                                    src={existingThumbnail}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-sm">
                                    Click to upload thumbnail
                                </span>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setThumbnail(file);
                                }}
                            />
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#47d4de] hover:bg-[#26a3ac] text-white py-2 rounded"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </AuthGuard>
    );
}
