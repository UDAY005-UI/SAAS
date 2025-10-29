import { clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";

export const createUser = async (req: Request, res: Response) => {
    const { userId } = req.auth;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const existingUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });
        if (existingUser) {
            return res
                .status(200)
                .json({ message: "User already exists", existingUser });
        }

        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (!email)
            return res.status(400).json({ message: "No primary email found" });

        const user = await prisma.user.create({
            data: { clerkId: userId, email },
        });

        res.status(201).json({ message: "User created !", user });
    } catch (err) {
        res.status(500).json({ message: "Error creating the user", err });
    }
};

export const setRole = async (req: Request, res: Response) => {
    const { role } = req.body;
    const { userId } = req.auth;
    try {
        const existingUser = await prisma.user.findUnique({
            where: { clerkId: userId ?? undefined },
        });
        if (!existingUser) {
            return res.status(404).json({ message: "User doesn't exist" });
        }
        if (existingUser.role && existingUser.role === role) {
            return res.status(400).json({ message: "Role already assigned" });
        }

        const updated = await prisma.user.update({
            where: { clerkId: userId ?? undefined },
            data: { role },
        });

        res.status(200).json({ message: "role updated", updated });
    } catch (err) {
        res.status(500).json({ message: "Error updating the role", err });
    }
};

export const createProfile = async (req: Request, res: Response) => {
    const {
        name,
        bio,
        avatarUrl,
        country,
        website,
        github,
        linkedin,
        twitter,
        orgName,
    } = req.body;
    const { userId } = req.auth;

    try {
        const user = await prisma.user.findUnique({
            where: { clerkId: userId ?? undefined },
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.role === "STUDENT") {
            const profile = await prisma.userProfile.create({
                data: {
                    userId: user.id,
                    name,
                    bio,
                    avatarUrl,
                    country,
                    website,
                    github,
                    linkedin,
                    twitter,
                },
            });
            return res.status(201).json({
                message: "Student profile created successfully",
                profile,
            });
        }

        if (user.role === "INSTRUCTOR") {
            const profile = await prisma.instructorProfile.create({
                data: {
                    userId: user.id,
                    orgName,
                    bio,
                    avatarUrl,
                    country,
                },
            });
            return res
                .status(201)
                .json({ message: "Instructor profile created", profile });
        }

        return res.status(400).json({ message: "Invalid role type" });
    } catch (err) {
        res.status(500).json({ message: "Error creating profile", err });
    }
};
