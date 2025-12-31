import { notFound } from "next/navigation";
import speedMathsData from "@/data/courses/speed-maths.json";
import { DayView } from "@/components/modules/DayView";

interface PageProps {
    params: Promise<{
        courseId: string;
        dayId: string;
    }>;
}

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

    // 3. Render View
    return (
        <div className="container max-w-5xl mx-auto py-8 px-4 pb-24">
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent mb-2">
                    Day {dayData.day}: {dayData.title}
                </h1>
                <p className="text-muted-foreground">step-by-step mastery protocol</p>
            </div>

            <DayView day={dayData} />
        </div>
    );
}
