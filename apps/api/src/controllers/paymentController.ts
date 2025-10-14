import { Request, Response } from "express";
import paypal from "@paypal/checkout-server-sdk";
import client from "../services/paypalClient.js";
import { createPayout } from "../services/payoutServices.js";
import { prisma } from "../lib/prisma.js";

export async function createOrder(req: Request, res: Response) {
    const { courseId, studentId } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency: "USD",
                    value: "100.00",
                },
                description: `Course ${courseId} enrollment`,
            },
        ],
    });

    try {
        const order = await client.execute(request);
        res.json({ id: order.result.id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function captureOrder(req: Request, res: Response) {
    const { orderId } = req.body;

    const request = new paypal.orders.OrderCaptureRequest(orderId);
    request.requestBody({});

    try {
        const capture = await client.execute(request);
        res.json({ capture });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function sendPayout(req: Request, res: Response) {
    try {
        const { email, amount } = req.body;

        if (!email || !amount) {
            return res
                .status(400)
                .json({ error: `Email and amount are required` });
        }

        const result = await createPayout(email, amount);
        return res.json(result);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
}

export const verifyPayment = async (req: Request, res: Response) => {
    const { courseId, orderId, clerkId } = req.body;

    if (!orderId || !courseId || !clerkId) {
        return res.status(400).json({ message: "Missing parameters" });
    }
    try {
        const request = new paypal.orders.OrderGetRequest(orderId);
        const order = await client.execute(request);

        if (order.result.status !== "COMPLETED") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        const amount = order.result.purchase_units[0].amount.value;
        const transactionId = order.result.id;

        const user = await prisma.user.findUnique({ where: { clerkId } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const course = await prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course)
            return res.status(404).json({ message: "Course not found" });

        const alreadyEnrolled = await prisma.enrollment.findFirst({
            where: { userId: user.id, courseId },
        });
        if (alreadyEnrolled)
            return res.status(200).json({ message: "Already enrolled" });

        const payment = prisma.payment.create({
            data: {
                userId: user.id,
                courseId,
                instructorId: course.instructorId,
                amount,
                status: "COMPLETED",
                transactionId,
            },
        });

        const enrollment = prisma.enrollment.create({
            data: {
                userId: user.id,
                courseId,
                progress: 0,
                completed: false,
            },
        });

        await prisma.userProfile.updateMany({
            where: { userId: user.id },
            data: { totalCoursesEnrolled: { increment: 1 } },
        });

        await prisma.instructorProfile.updateMany({
            where: { userId: course.instructorId },
            data: {
                totalStudents: { increment: 1 },
                revenueGenerated: { increment: amount },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified, access granted",
            enrollment,
            payment,
        });
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ message: "Verification failed", error: err });
    }
};
