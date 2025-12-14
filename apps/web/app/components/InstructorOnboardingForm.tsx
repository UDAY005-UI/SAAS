"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

type FormState = {
    orgName: string;
    bio: string;
    avatarUrl: string;
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
        avatarUrl: "",
        country: "",
        website: "",
        github: "",
        linkedin: "",
        twitter: "",
    });

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

        // Basic validation
        if (!form.orgName.trim()) {
            setError("Organization name is required.");
            return;
        }

        if (form.bio && form.bio.length > 2000) {
            setError("Bio is too long (max 2000 characters).");
            return;
        }

        const urlFields: (keyof FormState)[] = [
            "avatarUrl",
            "website",
            "github",
            "linkedin",
            "twitter",
        ];

        for (const f of urlFields) {
            if (!isValidUrl(form[f])) {
                setError(`${f} must be a valid absolute URL (http/https).`);
                return;
            }
        }

        setLoading(true);

        try {
            const token = await getToken();
            const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            const payload = {
                orgName: form.orgName || null,
                bio: form.bio || null,
                avatarUrl: form.avatarUrl || null,
                country: form.country || null,
                website: form.website || null,
                github: form.github || null,
                linkedin: form.linkedin || null,
                twitter: form.twitter || null,
            };

            const res = await axios.post(
                "http://localhost:5500/api/instructors/becomeInstructor",
                payload,
                { headers, withCredentials: true }
            );

            if (res.status === 200) {
                setSuccessMsg("You are now an instructor. Redirecting...");
                // IMPORTANT: revalidate your client user state here. Replace with your SWR/React-Query/Clerk refresh function.
                // Example placeholders:
                // await mutateUser(); // if using SWR or React Query
                // or call Clerk client to refresh session if roles are stored in token

                try {
                    localStorage.setItem("uiMode", "instructor");
                } catch {}

                // small delay to show success (optional)
                setTimeout(() => router.push("/instructor/dashboard"), 600);
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
                <p className="text-sm text-gray-400">
                    Share a little about yourself and your organization so
                    students can find your courses.
                </p>

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
                        placeholder="What you teach, experience, topics, etc."
                        maxLength={2000}
                    />
                    <div className="text-xs text-gray-500">
                        {form.bio.length}/2000
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-gray-300 text-sm">
                            Avatar URL
                        </label>
                        <input
                            value={form.avatarUrl}
                            onChange={(e) =>
                                update("avatarUrl", e.target.value)
                            }
                            className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-gray-300 text-sm">Country</label>
                        <input
                            value={form.country}
                            onChange={(e) => update("country", e.target.value)}
                            className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                            placeholder="Country"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-gray-300 text-sm">Website</label>
                        <input
                            value={form.website}
                            onChange={(e) => update("website", e.target.value)}
                            className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                            placeholder="https://your-site.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-gray-300 text-sm">GitHub</label>
                        <input
                            value={form.github}
                            onChange={(e) => update("github", e.target.value)}
                            className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                            placeholder="https://github.com/username"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-gray-300 text-sm">
                            LinkedIn
                        </label>
                        <input
                            value={form.linkedin}
                            onChange={(e) => update("linkedin", e.target.value)}
                            className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-gray-300 text-sm">Twitter</label>
                        <input
                            value={form.twitter}
                            onChange={(e) => update("twitter", e.target.value)}
                            className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                            placeholder="https://twitter.com/..."
                        />
                    </div>
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
                    By becoming an instructor you agree to our platform terms.
                    You can edit these details later from your instructor
                    profile.
                </p>
            </form>
        </div>
    );
}
