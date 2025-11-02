import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";
import { getAuth } from "@clerk/express";

export const getProfile = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
            include: {
                userProfile: {
                    select: {
                        name: true,
                        bio: true,
                        avatarUrl: true,
                        country: true,
                        website: true,
                        github: true,
                        linkedin: true,
                        twitter: true,
                        totalCoursesEnrolled: true,
                        totalHoursWatched: true,
                        certificatesEarned: true,
                    },
                },
                instructorProfile: {
                    select: {
                        orgName: true,
                        bio: true,
                        avatarUrl: true,
                        country: true,
                        website: true,
                        github: true,
                        linkedin: true,
                        twitter: true,
                        totalCoursesPublished: true,
                        totalStudents: true,
                        revenueGenerated: true,
                    },
                },
                enrollments: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                thumbnailUrl: true,
                                price: true,
                                modules: {
                                    select: {
                                        id: true,
                                        title: true,
                                        description: true,
                                        order: true,
                                        lessons: {
                                            select: {
                                                id: true,
                                                title: true,
                                                duration: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                paymentsAsStudent: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                        courseId: true,
                    },
                },
                reviews: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                                thumbnailUrl: true,
                            },
                        },
                    },
                },
                courseProgresses: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                        modules: {
                            select: {
                                id: true,
                                progress: true,
                                completed: true,
                            },
                        },
                    },
                },
            },
        });

        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    const {
        name,
        bio,
        avatarUrl,
        country,
        website,
        github,
        linkedin,
        twitter,
    } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId ?? undefined },
            include: { userProfile: true },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const updatedProfile = await prisma.userProfile.upsert({
            where: { userId: user?.id },
            update: {
                name: name ?? undefined,
                bio: bio ?? undefined,
                avatarUrl: avatarUrl ?? undefined,
                country: country ?? undefined,
                website: website ?? undefined,
                github: github ?? undefined,
                linkedin: linkedin ?? undefined,
                twitter: twitter ?? undefined,
            },
            create: {
                userId: user.id,
                name: name ?? "",
                bio: bio ?? undefined,
                avatarUrl: avatarUrl ?? undefined,
                country: country ?? undefined,
                website: website ?? undefined,
                github: github ?? undefined,
                linkedin: linkedin ?? undefined,
                twitter: twitter ?? undefined,
            },
        });

        return res.status(200).json({
            message: "Profile updated successfully",
            userProfile: updatedProfile,
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getPurchasedCourses = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId },
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        const courses = await prisma.enrollment.findMany({
            where: { userId: user.id },
            include: {
                course: {
                    include: { instructor: true, modules: true },
                },
            },
        });

        res.status(200).json({ courses: courses || [] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
