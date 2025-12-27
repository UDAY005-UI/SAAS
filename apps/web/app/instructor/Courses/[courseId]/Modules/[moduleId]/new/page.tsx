"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function NewCourse() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { courseId } = useParams<{ courseId: string }>();
    const { moduleId } = useParams<{ moduleId: string }>();
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
    });

    const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        const data = new FormData();
        data.append("title", form.title);
        data.append("description", form.description);

        if (thumbnail) {
            data.append("thumbnail", thumbnail);
        }

        if (video) {
            data.append("video", video);
        }

        if (!form.title.trim()) {
            alert("Title is required");
            return;
        }

        if (!form.description) {
            alert("Description is required");
            return;
        }

        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        await axios.post(
            `http://localhost:5500/api/instructors/${moduleId}/add-lessons`,
            data,
            { headers, withCredentials: true }
        );
        router.push(`/instructor/Courses/${courseId}/Modules/${moduleId}`);
    };
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-black">
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    await submit();
                }}
                className="w-full max-w-lg bg-neutral-900 p-8 rounded-lg space-y-6"
            >
                <h1 className="text-white text-2xl font-semibold">
                    Create Lesson
                </h1>

                {["title", "description"].map((key) => (
                    <div key={key} className="space-y-1">
                        <label className="text-gray-300 text-sm">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </label>
                        <input
                            value={(form as any)[key]}
                            onChange={(e) => update(key, e.target.value)}
                            className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                        />
                    </div>
                ))}
                <div className="space-y-1">
                    <label className="text-gray-300 text-sm">Thumbnail</label>

                    <label className="relative flex items-center justify-center w-full h-40 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-[#47d4de] transition overflow-hidden">
                        {thumbnail ? (
                            <img
                                src={URL.createObjectURL(thumbnail)}
                                alt="Thumbnail preview"
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

                <div className="space-y-1">
                    <label className="text-gray-300 text-sm">Video</label>

                    <label className="relative flex items-center justify-center w-full h-40 border-2 border-dashed border-neutral-600 rounded-lg cursor-pointer hover:border-[#47d4de] transition overflow-hidden">
                        {video ? (
                            <img
                                src={URL.createObjectURL(video)}
                                alt="video preview"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-400 text-sm">
                                Click to upload video
                            </span>
                        )}

                        <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setVideo(file);
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
    );
}
