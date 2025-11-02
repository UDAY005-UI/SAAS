import { clerkClient } from "@clerk/clerk-sdk-node";
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
        const name = clerkUser.username || "User";
        if (!email)
            return res.status(400).json({ message: "No primary email found" });

        const user = await prisma.user.create({
            data: {
                clerkId: userId,
                email,
                userProfile: {
                    create: { name },
                },
            },
        });

        res.status(201).json({ message: "User created !", user });
    } catch (err) {
        res.status(500).json({ message: "Error creating the user", err });
    }
};
