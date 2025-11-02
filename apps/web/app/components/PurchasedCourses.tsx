"use client";

import Image from "next/image";

type PurchasedCoursesProps = {
    courses: {
        course: {
            id: string;
            title: string;
            thumbnailUrl: string;
            instructor?: {
                userProfile?: {
                    name: string;
                };
            };
        };
        progress: number;
    }[];
};

export default function PurchasedCourses({ courses }: PurchasedCoursesProps) {
    if (!courses || courses.length === 0) {
        return (
            <div className="w-full text-center mt-10 text-gray-300">
                You haven’t enrolled in any courses yet.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {courses.map(({ course, progress }) => (
                <div
                    key={course.id}
                    className="bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl p-5 hover:scale-[1.02] transition cursor-pointer"
                >
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                        <Image
                            src={course.thumbnailUrl || "/placeholder.jpg"}
                            alt={course.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <h2 className="text-white text-lg font-bold mt-4">
                        {course.title}
                    </h2>

                    <p className="text-[#47d4de] text-sm">
                        {course.instructor?.userProfile?.name ||
                            "Unknown Instructor"}
                    </p>

                    <div className="w-full bg-gray-700 h-2 rounded-full mt-3">
                        <div
                            className="h-full bg-[#47d4de] rounded-full"
                            style={{ width: `${progress || 0}%` }}
                        />
                    </div>

                    <button className="mt-4 bg-[#47d4de] w-full py-2 rounded-xl font-semibold hover:bg-[#3ac0ca]">
                        Continue Learning
                    </button>
                </div>
            ))}
        </div>
    );
}
