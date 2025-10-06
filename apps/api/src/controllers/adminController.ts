import { prisma } from "../lib/prisma.js";
import type { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const typedPrisma = prisma as PrismaClient;

export const getAllUserHandler = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                userProfile: true,
                instructorProfile: true,
                courses: {
                    include: {
                        modules: true,
                        enrollments: true,
                        payments: true,
                        reviews: true,
                        courseProgresses: {
                            include: {
                                modules: true,
                            },
                        },
                    },
                },
                enrollments: true,
                paymentsAsInstructor: true,
                paymentsAsStudent: true,
                reviews: true,
                courseProgresses: true,
            },
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteUserHandler = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: { id },
        });
        res.status(200).json({ message: "User successfully deleted" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to delete the user" });
    }
};

export const updateUserHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "User Id is required" });

    const { email, role } = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                role,
                email,
                updatedAt: new Date(),
            },
        });
        res.status(200).json({ message: "User updated", updatedUser });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to update the user" });
    }
};
