import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";
import { getAuth } from "@clerk/express";

export const getProfile = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    try {
        const User = await prisma.user.findUnique({
            where: { clerkId: userId ?? undefined },
            include: {
                userProfile: true,
                enrollments: {
                    include: {
                        course: {
                            include: {
                                modules: {
                                    include: {
                                        lessons: true,
                                    },
                                },
                                reviews: true,
                            },
                        },
                    },
                },
                paymentsAsStudent: true,
                reviews: {
                    include: {
                        course: true,
                    },
                },
                courseProgresses: {
                    include: {
                        course: true,
                        modules: true,
                    },
                },
            },
        });
        res.status(200).json(User);
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

        res.status(200).json({ courses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
