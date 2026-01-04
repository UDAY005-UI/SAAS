import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";
import { Role } from "@prisma/client";

export const getAvailableCourses = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const courses = await prisma.course.findMany({
            where: { published: true },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                price: true,
                thumbnailUrl: true,
                createdAt: true,
                instructor: {
                    select: {
                        userProfile: {
                            select: {
                                name: true,
                                avatarUrl: true,
                                country: true,
                            },
                        },
                    },
                },
                modules: {
                    select: { id: true, title: true, order: true },
                },
            },
        });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } catch (err) {
        console.error("Error fetching available courses:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUnpublishedCourses = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const courses = await prisma.course.findMany({
            where: { published: false },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                price: true,
                thumbnailUrl: true,
                createdAt: true,
                instructor: {
                    select: {
                        userProfile: {
                            select: {
                                name: true,
                                avatarUrl: true,
                                country: true,
                            },
                        },
                    },
                },
                modules: {
                    select: { id: true, title: true, order: true },
                },
            },
        });

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses,
        });
    } catch (err) {
        console.error("Error fetching courses:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getCourse = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkId },
            select: {
                id: true,
                roles: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                title: true,
                description: true,
                price: true,
                category: true,
                thumbnailUrl: true,
                instructorId: true,
            },
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const isInstructor = user.roles.includes("INSTRUCTOR");
        const isOwner = course.instructorId === user.id;

        if (isInstructor && isOwner) {
            return res.status(200).json({
                success: true,
                data: course,
            });
        }
        return res
            .status(403)
            .json({ message: "You are not allowed to access this resource" });
    } catch (err) {
        console.error("Failed to get course", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getModule = async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkId },
            select: {
                id: true,
                roles: true,
            },
        });

        if (!user || !courseId) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const modules = await prisma.module.findMany({
            where: { courseId: courseId },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                description: true,
                order: true,
            },
        });

        const courseProgress = await prisma.courseProgress.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId,
                },
            },
        });

        const moduleProgress = courseProgress
            ? await prisma.moduleProgress.findMany({
                  where: {
                      courseProgressId: courseProgress?.id,
                  },
                  select: {
                      moduleId: true,
                      progress: true,
                      completed: true,
                  },
              })
            : [];

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                instructorId: true,
                published: true,
            },
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId: user.id,
                    courseId: courseId,
                },
            },
        });

        const progressMap = new Map(
            moduleProgress.map((mp) => [mp.moduleId, mp])
        );

        const modulesWithProgress = modules.map((m) => {
            const progress = progressMap.get(m.id);

            return {
                ...m,
                progress: progress?.progress ?? 0,
                completed: progress?.completed ?? false,
            };
        });

        const isInstructor = user?.roles?.includes(Role.INSTRUCTOR);
        const isStudent = user?.roles?.includes(Role.STUDENT);
        const isOwner = course?.instructorId === user?.id;

        if (!course?.published) {
            if (!isInstructor && !isOwner) {
                return res.status(403).json({ message: "Access denied" });
            }
        }

        if (isInstructor && isOwner) {
            return res.status(200).json({
                success: true,
                count: modules.length,
                data: modules,
            });
        }

        if (enrollment && isStudent) {
            return res.status(200).json({
                success: true,
                count: modulesWithProgress.length,
                data: modulesWithProgress,
            });
        }

        return res.status(403).json({ message: "Not enrolled in this course" });
    } catch (err) {
        console.error("Error fetching modules: ", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getLessonsList = async (req: Request, res: Response) => {
    const { moduleId } = req.params;
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ message: "User not authorized" });
    }

    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkId },
            select: {
                id: true,
                roles: true,
            },
        });

        if (!user || !moduleId) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            select: {
                id: true,
                course: {
                    select: {
                        id: true,
                        instructorId: true,
                        published: true,
                    },
                },
            },
        });

        if (!module) {
            return res.status(404).json({ message: "Module not found" });
        }

        const course = module.course;
        const isOwner = course.instructorId === user.id;

        if (!course.published && !isOwner) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!isOwner && course.published) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: user.id,
                        courseId: course.id,
                    },
                },
            });

            if (!enrollment) {
                return res
                    .status(403)
                    .json({ message: "not enrolled in this course" });
            }
        }

        const lessons = await prisma.lesson.findMany({
            where: { moduleId },
            orderBy: { order: "asc" },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                order: true,
                isPreview: true,
            },
        });

        return res.status(200).json({
            success: true,
            count: lessons.length,
            data: lessons,
        });
    } catch (err) {
        console.error("Error fetching lessons: ", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getLesson = async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return res.status(401).json({ message: "User not authorized" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkId },
            select: {
                id: true,
            },
        });

        if (!user || !lessonId) {
            return res.status(400).json({ message: "Invalid request" });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: {
                title: true,
                thumbnailUrl: true,
                order: true,
                isPreview: true,
                module: {
                    select: {
                        course: {
                            select: {
                                id: true,
                                instructorId: true,
                                published: true,
                            },
                        },
                    },
                },
            },
        });

        const videoAsset = await prisma.videoAsset.findUnique({
            where: { lessonId: lessonId },
            select: {
                contentUrl: true,
                duration: true,
                VideoState: true,
            },
        });

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        const course = lesson.module.course;
        const isOwner = course.instructorId === user.id;

        if (!course.published && !isOwner) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!isOwner && course.published) {
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: {
                        userId: user.id,
                        courseId: course.id,
                    },
                },
            });

            if (!enrollment) {
                return res
                    .status(403)
                    .json({ message: "not enrolled in this course" });
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                id: lessonId,
                title: lesson.title,
                videoState: videoAsset?.VideoState,
                contentUrl: videoAsset?.contentUrl,
                thumbnailUrl: lesson.thumbnailUrl,
                duration: videoAsset?.duration,
                order: lesson.order,
                isPreview: lesson.isPreview,
            },
        });
    } catch (err) {
        console.error("Error fetching lesson: ", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
