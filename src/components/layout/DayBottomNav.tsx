"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { BookOpen, Calculator, Trophy, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function DayBottomNav() {
    const params = useParams();
    const pathname = usePathname();
    const courseId = params.courseId as string;
    const dayId = params.dayId as string;

    const tabs = [
        {
            name: "Study",
            href: `/courses/${courseId}/day/${dayId}`,
            icon: BookOpen,
            matchExact: true,
        },
        {
            name: "Practice",
            href: `/courses/${courseId}/day/${dayId}/practice`,
            icon: Calculator,
        },
        {
            name: "Arena",
            href: `/courses/${courseId}/day/${dayId}/arena`,
            icon: Trophy,
        },
        {
            name: "Videos",
            href: `/courses/${courseId}/day/${dayId}/videos`,
            icon: Video,
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
            <div className="flex items-center justify-around h-16 max-w-5xl mx-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = tab.matchExact
                        ? pathname === tab.href
                        : pathname?.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-all duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                            <span className={cn("transition-opacity", isActive ? "opacity-100" : "opacity-70")}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
