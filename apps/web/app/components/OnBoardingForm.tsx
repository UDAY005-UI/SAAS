"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function OnboardingForm() {
    const router = useRouter();
    const { getToken } = useAuth();

    const [role, setRole] = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
    const [form, setForm] = useState({
        name: "",
        bio: "",
        country: "",
        website: "",
        github: "",
        linkedin: "",
        twitter: "",
        orgName: "",
    });

    const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

    const submit = async () => {
        if (!form.name.trim()) {
            alert("Name is required");
            return;
        }

        if (role === "INSTRUCTOR" && !form.orgName.trim()) {
            alert("Organization name is required for instructors");
            return;
        }

        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        await axios.post(
            "http://localhost:5500/api/onboard",
            { role, ...form },
            { headers }
        );

        router.push("/Home");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    await submit();
                }}
                className="w-full max-w-lg bg-neutral-900 p-8 rounded-lg shadow-lg space-y-6"
            >
                <h1 className="text-white text-2xl font-semibold">
                    Complete Onboarding
                </h1>

                <div className="space-y-1">
                    <label className="text-gray-300 text-sm">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                    >
                        <option value="STUDENT">Student</option>
                        <option value="INSTRUCTOR">Instructor</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-gray-300 text-sm">Name *</label>
                    <input
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        required
                        className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                    />
                </div>

                {[
                    "bio",
                    "country",
                    "website",
                    "github",
                    "linkedin",
                    "twitter",
                ].map((key) => (
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

                {role === "INSTRUCTOR" && (
                    <div className="space-y-1">
                        <label className="text-gray-300 text-sm">
                            Organization Name *
                        </label>
                        <input
                            value={form.orgName}
                            onChange={(e) => update("orgName", e.target.value)}
                            required
                            className="w-full rounded bg-neutral-800 border border-neutral-700 text-white p-2"
                        />
                    </div>
                )}

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
