"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function NewModule() {
    const router = useRouter();
    const { getToken } = useAuth();
    const { courseId } = useParams<{ courseId: string }>();

    const [form, setForm] = useState({
        title: "",
        description: "",
    });

    const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        if (!form.title.trim()) {
            alert("Title is required");
            return;
        }

        if (!form.description.trim()) {
            alert("Description is required");
            return;
        }

        const token = await getToken();

        await axios.post(
            `http://localhost:5500/api/instructors/${courseId}/add-modules`,
            {
                title: form.title,
                description: form.description,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            }
        );

        router.push(`/instructor/Courses/${courseId}`);
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
                    Create Module
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
