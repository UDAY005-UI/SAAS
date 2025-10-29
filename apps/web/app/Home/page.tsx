import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";

export default function Home() {
    return (
        <main className="pt-25 min-h-screen p-8 bg-background">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">
                    Your Courses
                </h1>
                <GlowingEffectDemo />
            </div>
        </main>
    );
}
