"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import speedMathsData from "@/data/courses/speed-maths.json";
import { DayBottomNav } from "@/components/layout/DayBottomNav";
import { Video, PlayCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface PageProps {
    params: Promise<{
        courseId: string;
        dayId: string;
    }>;
}

export default function VideosPage({ params }: PageProps) {
    const { courseId, dayId } = use(params);
    const dayNumber = parseInt(dayId);

    if (courseId !== "speed-maths") {
        return <div>Course not found</div>;
    }

    const dayData = speedMathsData.days.find((d) => d.day === dayNumber);

    if (!dayData) {
        notFound();
    }

    return (
        <>
            <div className="flex flex-col min-h-screen">
                <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
                    <div className="max-w-lg mx-auto">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                                    <Video className="h-6 w-6 text-violet-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                        Video Lessons
                                    </h1>
                                    <p className="text-muted-foreground">Day {dayData.day}: {dayData.title}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <GlassCard className="p-6">
                                <div className="aspect-[9/16] w-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl border-2 border-violet-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_85%)]" />
                                    <div className="relative z-10 text-center space-y-4 p-8">
                                        <div className="w-16 h-16 mx-auto bg-violet-500/20 rounded-full flex items-center justify-center">
                                            <PlayCircle className="w-10 h-10 text-violet-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Video lessons optimized for mobile viewing (9:16 format)
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                                        Upcoming Topics
                                    </h4>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                                            <span>Visual explanation of {dayData.title}</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                                            <span>Step-by-step worked examples</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-2" />
                                            <span>Common mistakes to avoid</span>
                                        </li>
                                    </ul>
                                </div>
                            </GlassCard>
                        </div>
                    </div>
                </div>
            </div>

            <DayBottomNav />
        </>
    );
}
