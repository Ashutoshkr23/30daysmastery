"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import speedMathsData from "@/data/courses/speed-maths.json";
import { DayBottomNav } from "@/components/layout/DayBottomNav";
import { CompetitionArena } from "@/components/modules/CompetitionArena";
import { Trophy } from "lucide-react";

interface PageProps {
    params: Promise<{
        courseId: string;
        dayId: string;
    }>;
}

export default function ArenaPage({ params }: PageProps) {
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
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                    <Trophy className="h-6 w-6 text-amber-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                                        The Arena
                                    </h1>
                                    <p className="text-muted-foreground">Day {dayData.day}: {dayData.title}</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-4xl mx-auto">
                            <CompetitionArena
                                dayId={dayData.day}
                                onComplete={() => {
                                    console.log("Arena challenge complete");
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <DayBottomNav />
        </>
    );
}
