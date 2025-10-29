import { AnimatedGlassyPricing } from "@/components/animated-glassy-pricing";

export default function PricingPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
            <AnimatedGlassyPricing
                title="Pro Plan"
                description="Perfect for instructors and serious learners."
                price="29"
                features={[
                    "Unlimited course uploads",
                    "Detailed analytics",
                    "Priority support",
                    "Custom certificates",
                ]}
                buttonText="Start Now"
                isPopular
            />
        </main>
    );
}
