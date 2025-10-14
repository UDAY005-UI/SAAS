import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";

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
