import { notFound } from "next/navigation";
import speedMathsData from "@/data/courses/speed-maths.json";
import { DayView } from "@/components/modules/DayView";
import { getDailyProgress, getCompletedTasks } from "@/lib/actions/progress";
// Force Re-eval
import { Lock } from "lucide-react";
import { headers } from "next/headers";

interface PageProps {
    params: Promise<{
        courseId: string;
        dayId: string;
    }>;
}

// Global Start Date: Jan 1, 2025
// Global Start Date: Dec 31, 2025 (Aligned with current user system time for testing)
const COURSE_START_DATE = new Date("2025-12-31T00:00:00.000Z");

export default async function DayPage({ params }: PageProps) {
    const { courseId, dayId } = await params;
    const dayNumber = parseInt(dayId);

    // 1. Validate Course
    if (courseId !== "speed-maths") {
        return <div>Course not found (Currently only 'speed-maths' is available)</div>;
    }

    // 2. Fetch Day Data
    const dayData = speedMathsData.days.find((d) => d.day === dayNumber);

    if (!dayData) {
        notFound();
    }

    // 3. Unlock Logic
    // Day 1 unlocks on Start Date. Day 2 on Start Date + 1 day, etc.
    const unlockDate = new Date(COURSE_START_DATE);
    unlockDate.setDate(COURSE_START_DATE.getDate() + (dayNumber - 1));

    const today = new Date();

    // Bypass lock for localhost
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    const isLocked = !isLocalhost && today < unlockDate;

    console.log("Page Debug - Unlock Logic:", {
        dayNumber,
        today: today.toISOString(),
        courseStartDate: COURSE_START_DATE.toISOString(),
        unlockDate: unlockDate.toISOString(),
        isLocked,
        isLocalhost
    });

    // 4. Locked View
    if (isLocked) {
        return (
            <div className="container max-w-lg mx-auto py-24 px-4 text-center">
                <div className="bg-secondary/30 border border-white/5 rounded-2xl p-12 flex flex-col items-center space-y-6">
                    <div className="h-20 w-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                        <Lock className="h-10 w-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Day {dayNumber} is Locked</h1>
                        <p className="text-muted-foreground">
                            This content unlocks on {unlockDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}.
                        </p>
                    </div>
                    <div className="text-sm text-white/40 bg-white/5 px-4 py-2 rounded-full">
                        Strict Schedule Enforced
                    </div>
                </div>
            </div>
        );
    }


    // 5. Fetch User Progress (Only if unlocked)
    const progress = await getDailyProgress(courseId, dayNumber);
    const completedTasks = await getCompletedTasks(courseId, dayNumber);

    // 6. Render View
    return (
        <div className="container max-w-5xl mx-auto py-8 px-4 pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent mb-2">
                    Day {dayData.day}: {dayData.title}
                </h1>
                <p className="text-muted-foreground">step-by-step mastery protocol</p>
            </div>

            <DayView day={dayData} initialProgress={progress} completedTasks={completedTasks} />
        </div>
    );
}
