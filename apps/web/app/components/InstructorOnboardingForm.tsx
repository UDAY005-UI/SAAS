"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

type FormState = {
    orgName: string;
    bio: string;
    country: string;
    website: string;
    github: string;
    linkedin: string;
    twitter: string;
};

export default function InstructorOnboardingForm() {
    const router = useRouter();
    const { getToken } = useAuth();

    const [form, setForm] = useState<FormState>({
        orgName: "",
        bio: "",
        country: "",
        website: "",
        github: "",
        linkedin: "",
        twitter: "",
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const update = (k: keyof FormState, v: string) =>
        setForm((p) => ({ ...p, [k]: v }));

    const isValidUrl = (v: string) => {
        if (!v) return true;
        try {
            const u = new URL(v);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (!form.orgName.trim()) {
            setError("Organization name is required.");
            return;
        }

        if (form.bio && form.bio.length > 2000) {
            setError("Bio is too long (max 2000 characters).");
            return;
        }

        const urlFields: (keyof FormState)[] = [
            "website",
            "github",
            "linkedin",
            "twitter",
        ];

        for (const f of urlFields) {
            if (!isValidUrl(form[f])) {
                setError(`${f} must be a valid URL (http/https).`);
                return;
            }
        }

        setLoading(true);

        try {
            const token = await getToken();
            if (!token) return;

            const formData = new FormData();

            if (avatarFile) {
                formData.append("avatar", avatarFile);
            }

            formData.append("orgName", form.orgName);
            formData.append("bio", form.bio || "");
            formData.append("country", form.country || "");
            formData.append("website", form.website || "");
            formData.append("github", form.github || "");
            formData.append("linkedin", form.linkedin || "");
            formData.append("twitter", form.twitter || "");

            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/instructors/becomeInstructor`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            if (res.status === 200) {
                setSuccessMsg("You are now an instructor. Redirecting…");

                try {
                    localStorage.setItem("uiMode", "instructor");
                } catch {}

                setTimeout(() => router.push("/instructor/Dashboard"), 600);
            } else {
                setError(res.data?.message || "Failed to become instructor");
            }
        } catch (err: any) {
            console.error("onboarding error", err);
            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Network or server error. Try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl bg-neutral-900 p-8 rounded-lg shadow-lg space-y-6"
            >
                <h1 className="text-white text-2xl font-semibold">
                    Instructor Onboarding
                </h1>

                {/* Avatar upload */}
                <div className="flex items-center gap-4">
                    <label
                        htmlFor="avatar-upload"
                        className="relative cursor-pointer"
                    >
                        <Image
                            src={avatarPreview || "/default.png"}
                            alt="avatar"
                            width={80}
                            height={80}
                            className="rounded-full border border-neutral-700 object-cover"
                        />
                        <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-xs text-gray-200 opacity-0 hover:opacity-100 transition">
                            Upload
                        </div>
                    </label>

                    <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setAvatarFile(file);
                                setAvatarPreview(URL.createObjectURL(file));
                            }
                        }}
                    />

                    <p className="text-sm text-gray-400">
                        Instructor avatar (optional)
                    </p>
                </div>

                <div className="space-y-1">
                    <label className="text-gray-300 text-sm">
                        Organization / Brand name *
                    </label>
                    <input
                        value={form.orgName}
                        onChange={(e) => update("orgName", e.target.value)}
                        required
                        className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                        placeholder="e.g. Uday Academy"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-gray-300 text-sm">Short bio</label>
                    <textarea
                        value={form.bio}
                        onChange={(e) => update("bio", e.target.value)}
                        className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                        rows={5}
                        maxLength={2000}
                    />
                    <div className="text-xs text-gray-500">
                        {form.bio.length}/2000
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        ["Country", "country"],
                        ["Website", "website"],
                        ["GitHub", "github"],
                        ["LinkedIn", "linkedin"],
                        ["Twitter", "twitter"],
                    ].map(([label, key]) => (
                        <div key={key} className="space-y-1">
                            <label className="text-gray-300 text-sm">
                                {label}
                            </label>
                            <input
                                value={(form as any)[key]}
                                onChange={(e) =>
                                    update(
                                        key as keyof FormState,
                                        e.target.value
                                    )
                                }
                                className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                            />
                        </div>
                    ))}
                </div>

                {error && <div className="text-sm text-red-400">{error}</div>}
                {successMsg && (
                    <div className="text-sm text-green-400">{successMsg}</div>
                )}

                <div className="flex gap-3 items-center">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-[#47d4de] hover:bg-[#26a3ac] text-black font-medium py-2 rounded disabled:opacity-60"
                    >
                        {loading ? "Submitting..." : "Become an instructor"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded border border-neutral-700 text-gray-200"
                    >
                        Cancel
                    </button>
                </div>

                <p className="text-xs text-gray-500">
                    You can edit these details later from your instructor
                    profile.
                </p>
            </form>
        </div>
    );
}
