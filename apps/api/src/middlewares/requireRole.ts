import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";

export const requireRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.auth;

            if (!userId)
                return res.status(401).json({ message: "Unauthorized" });

            const user = await prisma.user.findUnique({
                where: { clerkId: userId },
            });
            if (
                !user ||
                !user.roles.some((role) => allowedRoles.includes(role))
            )
                return res.status(403).json({ message: "Forbidden" });

            req.user = user;
            next();
        } catch (err) {
            console.log("Role check failed", err);
            return res.status(500).json({ message: "Internal server error" });
        }
    };
};
