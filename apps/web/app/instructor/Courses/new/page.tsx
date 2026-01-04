"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function NewCourse() {
    const router = useRouter();
    const { getToken } = useAuth();
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        category: "",
    });

    const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        const data = new FormData();
        data.append("title", form.title);
        data.append("description", form.description);
        data.append("category", form.category);
        data.append("price", form.price);

        if (thumbnail) {
            data.append("thumbnail", thumbnail);
        }

        if (!form.title.trim()) {
            alert("Title is required");
            return;
        }

        if (!form.description) {
            alert("Description is required");
            return;
        }

        if (!form.category.trim()) {
            alert("Category is required");
            return;
        }

        if (!form.price.trim()) {
            alert("Price is required");
            return;
        }

        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/instructors/create-course`,
            data,
            { headers, withCredentials: true }
        );
        router.push("/instructor/Courses");
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
                    Create Course
                </h1>

                {["title", "description", "category", "price"].map((key) => (
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
