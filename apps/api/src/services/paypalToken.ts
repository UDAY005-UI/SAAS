import axios from "axios";

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getPayPalAccessToken() {
    if (cachedToken && Date.now() < tokenExpiry - 60_000) {
        return cachedToken;
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("PayPal credentials are missing in .env file");
    }

    try {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString(
            "base64"
        );

        const res = await axios.post(
            "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            "grant_type=client_credentials",
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        cachedToken = res.data.access_token;
        tokenExpiry = Date.now() + res.data.expires_in * 1000;

        return cachedToken;
    } catch (error: any) {
        console.error(
            "PayPal Auth Error:",
            error.response?.data || error.message
        );
        throw new Error("Failed to authenticate with PayPal");
    }
}
