"use client";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import Image from "next/image";

export function GlowingEffectDemo() {
    const items = [
        {
            imageSrc:
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop",
            title: "Do things the right way",
            description: "Running out of copy so I'll write anything.",
        },
        {
            imageSrc:
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
            title: "The best AI code editor ever.",
            description: "Yes, it's true. I'm not even kidding.",
        },
        {
            imageSrc:
                "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
            title: "Premium Features",
            description: "It's the best money you'll ever spend.",
        },
        {
            imageSrc:
                "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
            title: "AI-Powered Development",
            description: "Built with cutting-edge technology.",
        },
        {
            imageSrc:
                "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
            title: "Coming soon",
            description: "More features on the way.",
        },
    ];

    return (
        <ul className="flex flex-col gap-6 w-full">
            {items.map((item, idx) => (
                <GridItem key={idx} {...item} />
            ))}
        </ul>
    );
}

interface GridItemProps {
    imageSrc: string;
    title: string;
    description: React.ReactNode;
}

const GridItem = ({ imageSrc, title, description }: GridItemProps) => {
    return (
        <li className="list-none w-full">
            <div className="relative w-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                />

                <div className="relative flex flex-row items-center gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-4 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 w-full h-full">
                    {/* Left side image */}
                    <div className="flex-shrink-0 w-32 md:w-48 lg:w-56 h-32 md:h-40 lg:h-48 overflow-hidden rounded-lg">
                        <Image
                            src={imageSrc}
                            alt={title}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>

                    {/* Right side content */}
                    <div className="flex flex-col justify-center gap-3 flex-1">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </li>
    );
};
