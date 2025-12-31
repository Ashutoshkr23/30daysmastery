"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronLeft, PlayCircle, BookOpen, BrainCircuit, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { VideoPlayer } from "@/components/modules/VideoPlayer";
import { cn } from "@/lib/utils";

export default function DayView({ params }: { params: { courseId: string; dayId: string } }) {
    const [activeTab, setActiveTab] = useState<"watch" | "study" | "practice">("watch");

    // Mock Data (Replace with data-service later)
    const dayData = {
        title: "Day 1: Vedic Maths Secrets",
        description: "Learn how to multiply 3-digit numbers in 5 seconds.",
        video: { id: "dQw4w9WgXcQ", title: "Introduction to Speed Maths" }, // Placeholder ID
        steps: [
            { id: "watch", label: "Watch", icon: PlayCircle },
            { id: "study", label: "Study", icon: BookOpen },
            { id: "practice", label: "Practice", icon: BrainCircuit },
        ]
    };

    return (
        <div className="min-h-screen bg-background pb-20 p-4 space-y-6 animate-in fade-in-50">
            {/* Header */}
            <header className="flex items-center gap-4 pt-4">
                <Link href="/dashboard" className="rounded-full p-2 hover:bg-secondary/80 transition-colors">
                    <ChevronLeft className="h-6 w-6" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-lg font-bold leading-tight">{dayData.title}</h1>
                    <p className="text-xs text-muted-foreground">{dayData.description}</p>
                </div>
            </header>

            {/* Tab Navigation (Segmented Control) */}
            <GlassCard intensity="low" className="p-1 flex rounded-xl">
                {dayData.steps.map((step) => (
                    <button
                        key={step.id}
                        onClick={() => setActiveTab(step.id as any)}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 relative",
                            activeTab === step.id
                                ? "text-primary shadow-sm bg-background/80 dark:bg-white/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                    >
                        <step.icon className={cn("h-4 w-4", activeTab === step.id && "fill-current")} />
                        {step.label}
                        {activeTab === step.id && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                        )}
                    </button>
                ))}
            </GlassCard>

            {/* Content Area */}
            <div className="space-y-6 min-h-[50vh]">
                {activeTab === "watch" && (
                    <div className="space-y-4 animate-in zoom-in-95 duration-300">
                        <VideoPlayer videoId={dayData.video.id} title={dayData.video.title} />

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Key Takeaways</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                    <span>Base 100 multiplication method</span>
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                    <span>Squaring numbers ending in 5</span>
                                </li>
                            </ul>
                        </div>

                        <div className="pt-4">
                            <PremiumButton className="w-full" onClick={() => setActiveTab("study")}>
                                Mark Watched & Continue
                            </PremiumButton>
                        </div>
                    </div>
                )}

                {activeTab === "study" && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <GlassCard className="p-6 min-h-[300px] flex items-center justify-center text-muted-foreground">
                            Notes Viewer Component (Coming Soon)
                        </GlassCard>
                        <div className="pt-6">
                            <PremiumButton className="w-full" onClick={() => setActiveTab("practice")}>
                                Go to Practice
                            </PremiumButton>
                        </div>
                    </div>
                )}

                {activeTab === "practice" && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <GlassCard className="p-6 min-h-[300px] flex items-center justify-center text-muted-foreground">
                            Quiz Runner Component (Coming Soon)
                        </GlassCard>
                    </div>
                )}
            </div>
        </div>
    );
}
