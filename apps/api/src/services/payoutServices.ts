import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new paypal.core.PayPalHttpClient(
    new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID!,
        process.env.PAYPAL_CLIENT_SECRET!
    )
);

export async function createPayout(receiverEmail: string, amount: number) {
    const request = new paypal.payouts.PayoutsPostRequest();
    request.requestBody({
        sender_batch_header: {
            sender_batch_id: `${Date.now()}`,
            email_subject: "You have a payout!",
        },
        items: [
            {
                recipient_type: "EMAIL",
                amount: { value: amount.toFixed(2), currency: "USD" },
                receiver: receiverEmail,
                note: "Course payout",
                sender_item_id: `item-${Date.now()}`,
            },
        ],
    });

    const response = await client.execute(request);
    return response.result;
}
