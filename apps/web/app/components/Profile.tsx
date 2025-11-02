"use client";

import { useState } from "react";
import Image from "next/image";

type ProfileProps = {
    user?: {
        id: string;
        clerkId: string;
        email: string;

        userProfile: {
            name: string | null;
            avatarUrl: string | null;
            bio: string | null;
            country: string | null;
            website?: string | null;
            github?: string | null;
            linkedin?: string | null;
        } | null;
    };
};

export function Profile({ user }: ProfileProps) {
    if (!user) return null;

    const profile = user.userProfile;

    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        name: profile?.name || "",
        bio: profile?.bio || "",
        country: profile?.country || "",
        avatarUrl: profile?.avatarUrl || "",
        website: profile?.website || "",
        github: profile?.github || "",
        linkedin: profile?.linkedin || "",
    });

    const handleChange = (key: string, value: string) => {
        setForm({ ...form, [key]: value });
    };

    return (
        <div className="bg-[#0d0d0d] text-white border border-gray-800 rounded-xl p-6 space-y-6 w-full max-w-3xl">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Profile</h2>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-1 rounded-lg border border-gray-600 hover:bg-gray-700 transition"
                    >
                        Edit
                    </button>
                ) : (
                    <button
                        onClick={() => {
                            setIsEditing(false);
                        }}
                        className="px-4 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                    >
                        Save Changes
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Image
                    src={form.avatarUrl || "/default.png"}
                    alt="avatar"
                    width={80}
                    height={80}
                    className="rounded-full border border-gray-700"
                />

                <div className="flex gap-2 flex-col">
                    {!isEditing ? (
                        <>
                            <p className="text-lg font-semibold">
                                {form.name || "Unnamed User"}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {user.email}
                            </p>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                                className="bg-black border border-gray-600 rounded-md p-2 text-sm"
                                placeholder="Name"
                            />
                            <input
                                type="text"
                                value={form.avatarUrl}
                                onChange={(e) =>
                                    handleChange("avatarUrl", e.target.value)
                                }
                                className="bg-black border border-gray-600 rounded-md p-2 text-sm"
                                placeholder="Avatar URL"
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold">Bio</label>
                {!isEditing ? (
                    <p className="text-gray-400 text-sm">
                        {form.bio || "No bio added"}
                    </p>
                ) : (
                    <textarea
                        value={form.bio}
                        onChange={(e) => handleChange("bio", e.target.value)}
                        className="w-full bg-black border border-gray-600 rounded-md p-2 text-sm h-20"
                    />
                )}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold">Country</label>
                {!isEditing ? (
                    <p className="text-gray-400 text-sm">
                        {form.country || "--"}
                    </p>
                ) : (
                    <input
                        value={form.country}
                        onChange={(e) =>
                            handleChange("country", e.target.value)
                        }
                        className="bg-black border border-gray-600 rounded-md p-2 text-sm w-full"
                        placeholder="Country"
                    />
                )}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold">Website</label>
                {!isEditing ? (
                    <p className="text-gray-400 text-sm">
                        {form.website || "--"}
                    </p>
                ) : (
                    <input
                        value={form.website}
                        onChange={(e) =>
                            handleChange("website", e.target.value)
                        }
                        className="bg-black border border-gray-600 rounded-md p-2 text-sm w-full"
                        placeholder="Website link"
                    />
                )}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold">GitHub</label>
                {!isEditing ? (
                    <p className="text-gray-400 text-sm">
                        {form.github || "--"}
                    </p>
                ) : (
                    <input
                        value={form.github}
                        onChange={(e) => handleChange("github", e.target.value)}
                        className="bg-black border border-gray-600 rounded-md p-2 text-sm w-full"
                        placeholder="GitHub link"
                    />
                )}
            </div>

            <div className="space-y-1">
                <label className="text-sm font-semibold">LinkedIn</label>
                {!isEditing ? (
                    <p className="text-gray-400 text-sm">
                        {form.linkedin || "--"}
                    </p>
                ) : (
                    <input
                        value={form.linkedin}
                        onChange={(e) =>
                            handleChange("linkedin", e.target.value)
                        }
                        className="bg-black border border-gray-600 rounded-md p-2 text-sm w-full"
                        placeholder="LinkedIn link"
                    />
                )}
            </div>
        </div>
    );
}
