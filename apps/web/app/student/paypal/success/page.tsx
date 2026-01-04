import { Suspense } from "react";
import PaypalSuccessClient from "./successClient";

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center text-white">
                    Processing your payment...
                </div>
            }
        >
            <PaypalSuccessClient />
        </Suspense>
    );
}
