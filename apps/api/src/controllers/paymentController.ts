import { Request, Response } from "express";
import paypal from "@paypal/checkout-server-sdk";
import client from "../services/paypalClient.js";
import { createPayout } from "../services/payoutServices.js";

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
