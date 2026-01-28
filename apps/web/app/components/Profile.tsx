"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

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
            twitter?: string | null;
        } | null;
    };
};

export function Profile({ user }: ProfileProps) {
    const { getToken } = useAuth();
    if (!user) return null;

    const profile = user.userProfile;

    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        name: profile?.name || "",
        bio: profile?.bio || "",
        country: profile?.country || "",
        website: profile?.website || "",
        github: profile?.github || "",
        linkedin: profile?.linkedin || "",
        twitter: profile?.twitter || "",
    });

    const [avatarUrl, setAvatarUrl] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(
        profile?.avatarUrl || null
    );

    const handleChange = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleAvatarChange = (file: File) => {
        setAvatarUrl(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSave = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const formData = new FormData();

            // Avatar (optional)
            if (avatarUrl) {
                formData.append("avatar", avatarUrl);
            }

            // Profile fields
            formData.append("name", form.name);
            formData.append("bio", form.bio);
            formData.append("country", form.country);
            formData.append("website", form.website);
            formData.append("github", form.github);
            formData.append("linkedin", form.linkedin);
            formData.append("twitter", form.twitter);

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/students/update-profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            setIsEditing(false);
        } catch (error) {
            console.error("Profile update failed:", error);
        }
    };

    return (
        <div className="bg-[#0d0d0d] text-white border border-gray-800 rounded-xl p-6 space-y-6 w-full max-w-3xl">
            {/* Header */}
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
                        onClick={handleSave}
                        className="px-4 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                    >
                        Save Changes
                    </button>
                )}
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
                <div className="relative">
                    <label
                        htmlFor="avatar-upload"
                        className={`rounded-full ${
                            isEditing ? "cursor-pointer hover:opacity-80" : ""
                        }`}
                    >
                        <Image
                            src={avatarPreview || "/default.png"}
                            alt="avatar"
                            width={80}
                            height={80}
                            className="rounded-full border border-gray-700 object-cover"
                        />

                        {isEditing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full text-xs text-gray-200">
                                Change
                            </div>
                        )}
                    </label>

                    {isEditing && (
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleAvatarChange(e.target.files[0]);
                                }
                            }}
                        />
                    )}
                </div>

                <div className="flex flex-col gap-1">
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
                        <input
                            value={form.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            className="bg-black border border-gray-600 rounded-md p-2 text-sm"
                            placeholder="Name"
                        />
                    )}
                </div>
            </div>

            {/* Bio */}
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

            {/* Country */}
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
                    />
                )}
            </div>

            {[
                ["Website", "website"],
                ["GitHub", "github"],
                ["LinkedIn", "linkedin"],
                ["Twitter", "twitter"],
            ].map(([label, key]) => (
                <div key={key} className="space-y-1">
                    <label className="text-sm font-semibold">{label}</label>
                    {!isEditing ? (
                        <p className="text-gray-400 text-sm">
                            {(form as any)[key] || "--"}
                        </p>
                    ) : (
                        <input
                            value={(form as any)[key]}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="bg-black border border-gray-600 rounded-md p-2 text-sm w-full"
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
