import { Request, Response } from "express";
import axios from "axios";
import { prisma } from "../lib/prisma.js";
import { getPayPalAccessToken } from "../services/paypalToken.js";
import { getAuth } from "@clerk/express";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({ message: "courseId is required" });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { price: true },
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const accessToken = await getPayPalAccessToken();

        const orderRes = await axios.post(
            "https://api-m.sandbox.paypal.com/v2/checkout/orders",
            {
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "USD",
                            value: course.price.toString(),
                        },
                    },
                ],
                application_context: {
                    return_url: "http://localhost:3000/student/paypal/success",
                    cancel_url: "http://localhost:3000/student/paypal/cancel",
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const approvalUrl = orderRes.data.links.find(
            (l: any) => l.rel === "approve"
        )?.href;

        return res.json({
            orderId: orderRes.data.id,
            approvalUrl,
        });
    } catch (err: any) {
        console.error(err.response?.data || err);
        return res
            .status(500)
            .json({ message: "PayPal order creation failed" });
    }
};

export const captureOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.body;
        const { courseId } = req.params;
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (!orderId || !courseId) {
            return res
                .status(400)
                .json({ message: "orderId and courseId are required" });
        }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: {
                price: true,
                instructorId: true,
            },
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const existingPayment = await prisma.payment.findUnique({
            where: { orderId },
        });

        if (existingPayment) {
            return res.json({
                success: true,
                captureId: existingPayment.captureId,
                message: "Payment already captured",
            });
        }

        const accessToken = await getPayPalAccessToken();

        const captureRes = await axios.post(
            `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (captureRes.data.status !== "COMPLETED") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        const capture = captureRes.data.purchase_units[0].payments.captures[0];

        if (capture.amount.value !== course.price.toString()) {
            return res.status(400).json({ message: "Payment amount mismatch" });
        }

        await prisma.$transaction([
            prisma.payment.create({
                data: {
                    userId,
                    courseId,
                    instructorId: course.instructorId,
                    amount: course.price,
                    status: captureRes.data.status,
                    captureId: capture.id,
                    orderId,
                    payerEmail: captureRes.data.payer?.email_address ?? null,
                },
            }),

            prisma.enrollment.create({
                data: {
                    userId,
                    courseId,
                },
            }),
        ]);

        return res.json({
            success: true,
            captureId: capture.id,
        });
    } catch (err: any) {
        console.error(err.response?.data || err);
        return res.status(500).json({ message: "PayPal capture failed" });
    }
};
