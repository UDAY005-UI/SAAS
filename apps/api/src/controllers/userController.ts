import { prisma } from "../lib/prisma.js";
import { Request, Response } from "express";

export const createUser = async (req: Request, res: Response) => {
    const { userId, email } = req.body;
    try {
        const existingUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });
        if (existingUser) {
            return res
                .status(200)
                .json({ message: "User already exists", existingUser });
        }

        const User = await prisma.user.create({
            data: { clerkId: userId, email },
        });

        res.status(201).json({ message: "User created !", User });
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
        if (existingUser.role && existingUser.role !== "STUDENT") {
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
