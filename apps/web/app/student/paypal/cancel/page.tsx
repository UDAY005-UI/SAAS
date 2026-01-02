"use client";

import { useRouter } from "next/navigation";

export default function PayPalCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b1414] px-4">
            <div className="max-w-md w-full bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl p-6 text-center">
                <h1 className="text-xl font-semibold text-white mb-2">
                    Payment Cancelled
                </h1>

                <p className="text-gray-400 text-sm mb-6">
                    Your payment was cancelled and no charges were made. You can
                    try again or return to browsing courses.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.replace("/student/Discover")}
                        className="w-full py-2 rounded-xl bg-[#47d4de] text-black font-semibold hover:bg-[#3ac0ca]"
                    >
                        Back to Courses
                    </button>

                    <button
                        onClick={() => router.back()}
                        className="w-full py-2 rounded-xl border border-[#2a3f3f] text-gray-300 hover:bg-[#132020]"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
