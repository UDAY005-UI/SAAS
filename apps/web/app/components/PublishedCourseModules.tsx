"use client";
import { useRouter, useParams } from "next/navigation";

type AvailableModule = {
    id: string;
    title: string;
    description: string;
    order: string;
}[];

type AvailableModulesProps = {
    modules: AvailableModule[];
};

export default function AvailableCourses({ modules }: AvailableModulesProps) {
    const { courseId } = useParams<{ courseId: string }>();
    const router = useRouter();

    if (!modules || modules.length === 0) {
        return (
            <div className="w-full text-center mt-10 text-gray-300">
                No modules available.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {modules.map((module: any) => (
                <div
                    key={module.id}
                    className="bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl p-5 hover:scale-[1.02] transition cursor-pointer"
                >
                    <h2 className="text-white text-lg font-bold mt-4">
                        {module.title}
                    </h2>

                    <p className="text-gray-400 text-xs mt-1">
                        {module.description}
                    </p>

                    <button
                        onClick={() =>
                            router.push(
                                `/instructor/Home/${courseId}/Modules/${module.id}`
                            )
                        }
                        className="mt-4 bg-[#47d4de] w-full py-2 rounded-xl font-semibold hover:bg-[#3ac0ca]"
                    >
                        View Module
                    </button>
                </div>
            ))}
        </div>
    );
}
