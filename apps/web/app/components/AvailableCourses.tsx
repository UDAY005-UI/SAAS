"use client";
import Image from "next/image";

type AvailableCourse = {
    id: string;
    title: string;
    description: string;
    category: string;
    thumbnailUrl: string;
    price: string;
    createdAt: string;
    instructor: {
        userProfile?: {
            name?: string | null;
            avatarUrl?: string | null;
            country?: string | null;
        } | null;
    };
    modules: {
        id: string;
        title: string;
        order: number;
    }[];
};

type AvailableCoursesProps = {
    courses: AvailableCourse[];
};

export default function AvailableCourses({ courses }: AvailableCoursesProps) {
    if (!courses || courses.length === 0) {
        return (
            <div className="w-full text-center mt-10 text-gray-300">
                No courses available.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {courses.map((course) => (
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

                    <p className="text-gray-400 text-xs mt-1">
                        {course.category}
                    </p>

                    <p className="text-white font-semibold mt-2">
                        ₹{course.price}
                    </p>

                    <button className="mt-4 bg-[#47d4de] w-full py-2 rounded-xl font-semibold hover:bg-[#3ac0ca]">
                        View Course
                    </button>
                </div>
            ))}
        </div>
    );
}
