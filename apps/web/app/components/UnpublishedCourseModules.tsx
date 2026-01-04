"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

type Module = {
    id: string;
    title: string;
    description: string;
    order: number;
};

type AvailableModulesProps = {
    modules: Module[];
};

export default function AvailableModules({ modules }: AvailableModulesProps) {
    const { courseId } = useParams<{ courseId: string }>();
    const router = useRouter();
    const { getToken } = useAuth();

    // local state for optimistic delete
    const [localModules, setLocalModules] = useState(modules);

    // UI state
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const closeModal = () => {
        setModuleToDelete(null);
        setIsDeleting(false);
    };

    const confirmDelete = async () => {
        if (!moduleToDelete) return;

        try {
            const token = await getToken();
            setIsDeleting(true);

            await axios.delete(
                `http://localhost:5500/api/instructors/${moduleToDelete}/delete-module`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                }
            );

            // ✅ remove from UI immediately
            setLocalModules((prev) =>
                prev.filter((m) => m.id !== moduleToDelete)
            );

            closeModal();
        } catch (err) {
            console.error(err);
            alert("Failed to delete module");
            setIsDeleting(false);
        }
    };

    if (!localModules || localModules.length === 0) {
        return (
            <div className="w-full text-center mt-10 text-gray-300">
                No modules available.
            </div>
        );
    }

    return (
        <>
            {/* Delete confirmation modal */}
            {moduleToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl w-full max-w-md p-6">
                        <h2 className="text-white text-lg font-semibold">
                            Delete module?
                        </h2>

                        <p className="text-gray-400 text-sm mt-2">
                            This action is permanent. The module and its lessons
                            will be deleted.
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl text-gray-300 hover:bg-[#1e2f2f]"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-60"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modules grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {localModules.map((module) => (
                    <div
                        key={module.id}
                        className="relative bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl p-5 hover:scale-[1.02] transition"
                    >
                        {/* 3-dot menu */}
                        <div className="absolute top-5 right-5 z-10">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(
                                        openMenuId === module.id
                                            ? null
                                            : module.id
                                    );
                                }}
                                className="text-gray-300 hover:text-white text-xl px-2"
                            >
                                ⋮
                            </button>

                            {openMenuId === module.id && (
                                <div
                                    className="absolute right-0 mt-5 w-40 bg-[#132323] border border-[#1e2f2f] rounded-xl shadow-lg overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[#1e2f2f]"
                                        onClick={() => {
                                            setOpenMenuId(null);
                                            setModuleToDelete(module.id);
                                        }}
                                    >
                                        Delete Module
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <h2 className="text-white text-lg font-bold mt-4">
                            {module.title}
                        </h2>

                        <p className="text-gray-400 text-xs mt-1">
                            {module.description}
                        </p>

                        <button
                            onClick={() =>
                                router.push(
                                    `/instructor/Courses/${courseId}/Modules/${module.id}`
                                )
                            }
                            className="mt-4 bg-[#47d4de] w-full py-2 rounded-xl font-semibold hover:bg-[#3ac0ca]"
                        >
                            View Module
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
