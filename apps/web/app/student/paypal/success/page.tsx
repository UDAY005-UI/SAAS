"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";

export default function PaypalSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getToken } = useAuth();

    const hasCaptured = useRef(false);

    const orderId = searchParams.get("token");

    useEffect(() => {
        if (!orderId) return;
        if (hasCaptured.current) return;

        hasCaptured.current = true;

        const capturePayment = async () => {
            try {
                const token = await getToken();

                await axios.post(
                    "http://localhost:5500/api/payments/capture-order",
                    { orderId },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                router.replace("/student/Home");
            } catch (err) {
                console.error(err);
                router.replace("/student/paypal/failed");
            }
        };
        capturePayment();
    }, [orderId, getToken, router]);

    return (
        <div className="min-h-screen flex items-center justify-center text-white">
            Processing your payment...
        </div>
    );
}
