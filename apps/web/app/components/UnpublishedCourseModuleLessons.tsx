"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

type AvailableLesson = {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
};

type AvailableLessonsProps = {
    lessons: AvailableLesson[];
};

export default function AvailableCourses({ lessons }: AvailableLessonsProps) {
    const router = useRouter();

    if (!lessons || lessons.length === 0) {
        return (
            <div className="w-full text-center mt-10 text-gray-300">
                No lessons available.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {lessons.map((lesson) => (
                <div
                    key={lesson.id}
                    className="bg-[#0f1b1b] border border-[#1e2f2f] rounded-2xl p-5 hover:scale-[1.02] transition cursor-pointer"
                >
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                        <Image
                            src={lesson.thumbnailUrl || "/placeholder.jpg"}
                            alt={lesson.title}
                            fill
                            className="object-cover"
                        />
                    </div>

                    <h2 className="text-white text-lg font-bold mt-4">
                        {lesson.title}
                    </h2>

                    <p className="text-gray-400 text-xs mt-1">
                        {lesson.description}
                    </p>

                    <button
                        onClick={() =>
                            router.push(`/instructor/Courses/${lesson.id}`)
                        }
                        className="mt-4 bg-[#47d4de] w-full py-2 rounded-xl font-semibold hover:bg-[#3ac0ca]"
                    >
                        View Lesson
                    </button>
                </div>
            ))}
        </div>
    );
}
